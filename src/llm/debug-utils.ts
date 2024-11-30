import * as vscode from "vscode";

export async function openPromptAsDocument(prompt: vscode.LanguageModelChatMessage[]): Promise<void> {
    const content = prompt.map((message) => message.content).join("\n");
    const document = await vscode.workspace.openTextDocument({
        content,
        language: "markdown",
    });
    await vscode.window.showTextDocument(document);
}
