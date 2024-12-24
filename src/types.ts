import * as vscode from "vscode";

export type File = {
    path: string;
    content: string;
    languageId: string;
};

export type TokenCounter = (text: string | vscode.LanguageModelChatMessage) => Thenable<number>;
