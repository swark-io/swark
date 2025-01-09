import * as vscode from "vscode";
import { MermaidLinkGenerator } from "./mermaid/link-generator";
import { telemetry } from "../telemetry";

export class OutputFormatter {
    public static getDiagramFileContent(modelName: string, llmResponse: string): string {
        const mermaidBlock = this.getMermaidBlock(llmResponse);
        const mermaidCode = mermaidBlock.replace(/```mermaid|```/g, "");
        const sanitizedCode = this.removeMermaidCodeCycles(mermaidCode);
        const linkGenerator = new MermaidLinkGenerator(sanitizedCode);

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

${mermaidBlock}`;
    }

    public static getMermaidBlock(llmResponse: string): string {
        const matches = llmResponse.match(/```mermaid[\s\S]*```/);

        if (!matches) {
            throw new Error("No Mermaid block found in the language model response. Please try again.");
        }

        const block = matches[0];

        if (block !== llmResponse) {
            telemetry.sendTelemetryEvent("llmResponseContainedExtraPayload");
        }

        return block;
    }

    public static removeMermaidCodeCycles(mermaidCode: string): string {
        const nodeRegex = /([A-Za-z0-9_]+)\[.+?\]/g;
        const subgraphRegex = /subgraph\s+([A-Za-z0-9_]+)/g;
        const nodeNames = new Set<string>();
        let nodeMatch;

        while ((nodeMatch = nodeRegex.exec(mermaidCode)) !== null) {
            nodeNames.add(nodeMatch[1]);
        }

        return mermaidCode.replace(subgraphRegex, (match, subgraphName) => {
            if (nodeNames.has(subgraphName)) {
                let newName = subgraphName;

                while (nodeNames.has(newName)) {
                    newName += '_';
                }

                return `subgraph ${newName}`;
            }
            return match;
        });
    }

    public static getLogFileContent(
        selectedFolder: vscode.Uri,
        model: vscode.LanguageModelChat,
        filePaths: string[]
    ): string {
        const json = JSON.stringify(
            {
                selectedFolder: selectedFolder.fsPath,
                model: { family: model.family, name: model.name, maxInputTokens: model.maxInputTokens },
                numFilesUsed: filePaths.length,
            },
            null,
            4
        );

        return `# Swark Log File

## Info
\`\`\`json
${json}
\`\`\`

## Files Used
\`\`\`
total ${filePaths.length}  
${filePaths.join("\n")}
\`\`\``;
    }
}
