import * as vscode from "vscode";
import { telemetry, initializeTelemetry } from "./telemetry";
import { CreateArchitectureCommand } from "./commands/create-architecture";

export function activate(context: vscode.ExtensionContext): void {
    initializeTelemetry();
    registerCommand(context);
    telemetry.sendTelemetryEvent("extensionActivated");
}

function registerCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand("swark.architecture", async () => {
        await CreateArchitectureCommand.run();
    });

    context.subscriptions.push(disposable);
}

export async function deactivate(): Promise<void> {
    telemetry.sendTelemetryEvent("extensionDeactivated");
    await telemetry.dispose();
}
