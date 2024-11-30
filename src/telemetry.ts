import * as vscode from "vscode";
import TelemetryReporter from "@vscode/extension-telemetry";

const connectionString =
    "InstrumentationKey=fd5f40ad-cdf9-4a2b-aa0b-0a4a52302287;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=94ecf07a-6a8c-4d95-aa57-64d0468b88ce";

export let telemetry: TelemetryReporter;

export function initializeTelemetry(context: vscode.ExtensionContext): void {
    telemetry = new TelemetryReporter(connectionString);
    context.subscriptions.push(telemetry);
}
