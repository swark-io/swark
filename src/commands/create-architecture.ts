import * as vscode from "vscode";
import { selectFolder } from "../io/input-selection";
import { ModelInteractor } from "../llm/model-interactor";
import { PromptBuilder } from "../llm/prompt-builder";
import { OutputFormatter } from "../view/output-formatter";
import { OutputWriter } from "../view/output-writer";
import { TokenCounter } from "../types";
import { RepositoryReader } from "../io/repository-reader";
import { countTotalTokens, getMaxTokensForFiles } from "../llm/token-count-utils";
import { telemetry } from "../telemetry";
import { showDiagram } from "../view/viewer";
import { File } from "../types";

export class CreateArchitectureCommand {
    public static async run(): Promise<void> {
        const selectedFolder = await selectFolder();
        const model = await ModelInteractor.getModel();
        const tokenCounter = model.countTokens;

        const files = await this.readRepositoryFiles(selectedFolder, tokenCounter, model.maxInputTokens);
        const prompt = PromptBuilder.createPrompt(files);
        await this.logTotalTokens(prompt, tokenCounter);

        const response = await this.sendPrompt(model, prompt);
        const diagramUri = await this.writeOutputFiles(selectedFolder, model, response, files);
        await showDiagram(diagramUri);
    }

    private static async readRepositoryFiles(
        selectedFolder: vscode.Uri,
        tokenCounter: TokenCounter,
        llmMaxInputTokens: number
    ): Promise<File[]> {
        const maxTokens = await getMaxTokensForFiles(llmMaxInputTokens, tokenCounter);
        const repositoryReader = new RepositoryReader(selectedFolder, tokenCounter, maxTokens);
        return await repositoryReader.readFiles();
    }

    private static async logTotalTokens(
        prompt: vscode.LanguageModelChatMessage[],
        tokenCounter: TokenCounter
    ): Promise<void> {
        const totalTokens = await countTotalTokens(prompt, tokenCounter);
        console.log("Number of tokens in prompt:" + totalTokens);
        telemetry.sendTelemetryEvent("promptBuilt", {}, { totalTokens });
    }

    private static async sendPrompt(
        model: vscode.LanguageModelChat,
        prompt: vscode.LanguageModelChatMessage[]
    ): Promise<string> {
        const startTime = performance.now();

        const response = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Creating architecture diagram...",
            },
            async (_progress) => {
                return await ModelInteractor.sendPrompt(model, prompt);
            }
        );

        const endTime = performance.now();
        telemetry.sendTelemetryEvent("promptSent", {}, { responseTime: endTime - startTime });
        return response;
    }

    private static async writeOutputFiles(
        selectedFolder: vscode.Uri,
        model: vscode.LanguageModelChat,
        response: string,
        files: File[]
    ): Promise<vscode.Uri> {
        const outputFolder = this.getOutputFolder(selectedFolder);
        const writer = new OutputWriter(outputFolder);
        const [diagramUri, _] = await Promise.all([
            this.writeDiagramFile(model, response, writer),
            this.writeLogFile(files, selectedFolder, model, writer),
        ]);
        return diagramUri;
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

    private static async writeDiagramFile(
        model: vscode.LanguageModelChat,
        response: string,
        writer: OutputWriter
    ): Promise<vscode.Uri> {
        const diagramFileContent = OutputFormatter.getDiagramFileContent(model.name, response);
        const uri = await writer.writeDiagramFile(diagramFileContent);
        return uri;
    }

    private static async writeLogFile(
        files: File[],
        selectedFolder: vscode.Uri,
        model: vscode.LanguageModelChat,
        writer: OutputWriter
    ): Promise<void> {
        const filePaths = files.map((file) => file.path);
        const logFileContent = OutputFormatter.getLogFileContent(selectedFolder, model, filePaths);
        await writer.writeLogFile(logFileContent);
    }
}
