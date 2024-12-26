import * as vscode from "vscode";
import { telemetry } from "../telemetry";

export async function showDiagram(uri: vscode.Uri): Promise<void> {
    await vscode.commands.executeCommand("markdown.showPreview", uri);
    telemetry.sendTelemetryEvent("diagramShown");
}
