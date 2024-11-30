import * as vscode from "vscode";
import { telemetry } from "../telemetry";

export async function selectFolder(): Promise<vscode.Uri> {
    const selectedFolders = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: "Select Folder for Swark",
    });
    const selectedFolder = selectedFolders?.[0];

    if (!selectedFolder) {
        throw new Error("No folder selected");
    }

    telemetry.sendTelemetryEvent("folderSelected");
    return selectedFolder;
}
