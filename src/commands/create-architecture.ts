import * as vscode from "vscode";
import { selectFolder } from "../io/input-selection";
import { ModelInteractor } from "../llm/model-interactor";
import { PromptBuilder } from "../llm/prompt-builder";
import { getMarkdownContent, showDiagram } from "../view/diagram";
import { OutputWriter } from "../io/output-writer";
import { TokenCounter } from "../types";
import { RepositoryReader } from "../io/repository-reader";
import { countTotalTokens, getMaxTokensForFiles } from "../llm/token-count-utils";
import { telemetry } from "../telemetry";

export class CreateArchitectureCommand {
    public static async run(): Promise<void> {
        const selectedFolder = await selectFolder();
        const model = await ModelInteractor.getModel();
        const tokenCounter = model.countTokens;

        const filesContents = await this.readRepositoryFiles(selectedFolder, tokenCounter, model.maxInputTokens);
        const prompt = PromptBuilder.createPrompt(filesContents);
        await this.logTotalTokens(prompt, tokenCounter);

        vscode.window.showInformationMessage("Creating architecture diagram...");
        const response = await this.sendPrompt(model, prompt);
        const markdownContent = getMarkdownContent(model.name, response);

        const outputFolder = this.getOutputFolder(selectedFolder);
        const writer = new OutputWriter(outputFolder);
        const uri = await writer.writeDiagramFile(markdownContent);
        await showDiagram(uri);
    }

    private static async logTotalTokens(
        prompt: vscode.LanguageModelChatMessage[],
        tokenCounter: TokenCounter
    ): Promise<void> {
        const totalTokens = await countTotalTokens(prompt, tokenCounter);
        console.log("Number of tokens in prompt:" + totalTokens);
        telemetry.sendTelemetryEvent("promptBuilt", {}, { totalTokens });
    }

    private static async readRepositoryFiles(
        selectedFolder: vscode.Uri,
        tokenCounter: TokenCounter,
        llmMaxInputTokens: number
    ): Promise<string> {
        const maxTokens = await getMaxTokensForFiles(llmMaxInputTokens, tokenCounter);
        const repositoryReader = new RepositoryReader(selectedFolder, tokenCounter, maxTokens);
        return await repositoryReader.readFiles();
    }

    private static async sendPrompt(
        model: vscode.LanguageModelChat,
        prompt: vscode.LanguageModelChatMessage[]
    ): Promise<string> {
        const startTime = performance.now();
        const response = await ModelInteractor.sendPrompt(model, prompt);
        const endTime = performance.now();
        telemetry.sendTelemetryEvent("promptSent", {}, { responseTime: endTime - startTime });
        return response;
    }

    private static getOutputFolder(selectedFolder: vscode.Uri): vscode.Uri {
        const rootFolder = this.getRootFolder(selectedFolder);
        return vscode.Uri.joinPath(rootFolder, "swark-output");
    }

    private static getRootFolder(selectedFolder: vscode.Uri): vscode.Uri {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (workspaceFolder) {
            return workspaceFolder.uri;
        }

        telemetry.sendTelemetryEvent("noWorkspaceFolder");
        return selectedFolder;
    }
}
