import * as vscode from "vscode";
import { telemetry } from "../telemetry";
import { MermaidLinkGenerator } from "./mermaid/link-generator";

export async function showDiagram(modelName: string, llmResponse: string): Promise<void> {
    const content = getMarkdownContent(modelName, llmResponse);
    const document = await vscode.workspace.openTextDocument({ content, language: "markdown" });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("markdown.showPreview");
    telemetry.sendTelemetryEvent("diagramShown");
}

function getMarkdownContent(modelName: string, llmResponse: string): string {
    const mermaidCode = llmResponse.replace(/```mermaid|```/g, "");
    const linkGenerator = new MermaidLinkGenerator(mermaidCode);

    return `<p align="center">
<img src="https://raw.githubusercontent.com/swark-io/swark/refs/heads/main/assets/logo/swark-logo-dark-mode.png" width="10%" />
</p>\n
## Architecture Diagram

To render this diagram (Mermaid Syntax), you can:
* Install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension in VS Code, or
* Use the links below to open it in Mermaid Live Editor.

For any issues or feature requests, please visit our [GitHub repository](https://github.com/swark-io/swark) or email us at contact@swark.io.

## Generated Content
**Model**: ${modelName}  
**Mermaid Live Editor**: [View](${linkGenerator.createViewLink()}) | [Edit](${linkGenerator.createEditLink()})

${llmResponse}`;
}
