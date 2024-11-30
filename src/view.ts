import * as vscode from "vscode";
import { telemetry } from "./telemetry";

export async function showDiagram(llmResponse: string): Promise<void> {
    const content = getMarkdownContent(llmResponse);
    const document = await vscode.workspace.openTextDocument({ content, language: "markdown" });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("markdown.showPreview");
    telemetry.sendTelemetryEvent("diagramShown");
}

function getMarkdownContent(llmResponse: string): string {
    return `<p align="center">
<img src="https://i.ibb.co/cyfB0nm/swark-logo-dark-mode.png" width="10%" />
</p>\n
### Architecture Diagram

To render this diagram (Mermaid Syntax), you can:
* Install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension in VS Code, or
* Copy the content below and paste it into the [Mermaid Live Editor](https://mermaid.live/).

For any issues or feature requests, please visit our [GitHub repository](https://github.com/swark-io/swark) or email us at contact@swark.io.\n
${llmResponse}`;
}
