import * as vscode from "vscode";
import { File, TokenCounter } from "../types";
import { PromptBuilder } from "../llm/prompt-builder";
import { telemetry } from "../telemetry";

export class RepositoryReader {
    private readonly baseFolder: vscode.Uri;
    private readonly tokenCounter: TokenCounter;
    private readonly config: vscode.WorkspaceConfiguration;
    private readonly maxTokens: number;

    public constructor(baseFolder: vscode.Uri, tokenCounter: TokenCounter, maxTokens: number) {
        this.baseFolder = baseFolder;
        this.tokenCounter = tokenCounter;
        this.config = vscode.workspace.getConfiguration("swark");
        this.maxTokens = maxTokens;
    }

    public async readFiles(): Promise<string> {
        const searchPattern = this.getSearchPattern();
        const excludePattern = this.getExcludePattern();
        const maxFiles = this.config.get<number>("maxFiles");

        const uris = await vscode.workspace.findFiles(
            new vscode.RelativePattern(this.baseFolder, searchPattern),
            excludePattern,
            maxFiles
        );
        const files: Array<File> = await this.openFiles(uris);
        return files.map(PromptBuilder.encodeFile).join("\n");
    }

    private getSearchPattern(): string {
        const fileExtensions = this.config.get<string[]>("fileExtensions");

        if (!fileExtensions || fileExtensions.length === 0) {
            throw new Error(
                "No file extensions specified in the configuration. Please go to the settings and specify the file extensions."
            );
        }

        return `**/*.{${fileExtensions.join(",")}}`;
    }

    private getExcludePattern(): string | null {
        const excludePatterns = this.config.get<string[]>("excludePatterns");

        if (!excludePatterns || excludePatterns.length === 0) {
            return null;
        }

        return `{${excludePatterns.join(",")}}`;
    }

    private async openFiles(uris: vscode.Uri[]): Promise<File[]> {
        let files: Array<File> = [];
        let totalTokens = 0;

        for (const uri of uris) {
            const file = await this.openFile(uri);
            const encodedFile = PromptBuilder.encodeFile(file);
            const numTokensInFile = await this.tokenCounter(encodedFile);

            if (totalTokens + numTokensInFile <= this.maxTokens) {
                totalTokens += numTokensInFile;
                files.push(file);
            }
        }

        this.showProcessingMessage(files.length, uris.length);
        this.sendTelemetryEvent(files.length, uris.length);
        console.log(files);
        return files;
    }

    private async openFile(uri: vscode.Uri): Promise<File> {
        const filePath = uri.fsPath;
        const textDocument = await vscode.workspace.openTextDocument(filePath);
        return { path: filePath, content: textDocument.getText() };
    }

    private showProcessingMessage(numProcessedFiles: number, totalFiles: number): void {
        if (numProcessedFiles < totalFiles) {
            vscode.window.showInformationMessage(
                `Processing ${numProcessedFiles}/${totalFiles} files due to LLM token limit`
            );
        } else {
            vscode.window.showInformationMessage(`Processing ${numProcessedFiles} files`);
        }
    }

    private sendTelemetryEvent(numProcessedFiles: number, totalFiles: number): void {
        telemetry.sendTelemetryEvent("filesProcessed", {}, { numProcessedFiles, totalFiles });
    }
}
