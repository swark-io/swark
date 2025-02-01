import * as vscode from "vscode";
import { MermaidLinkGenerator } from "./mermaid/link-generator";
import { telemetry } from "../telemetry";
import { MermaidCycleDetector } from "./mermaid/cycle-detector";

export class OutputFormatter {
    public static getDiagramFileContent(modelName: string, llmResponse: string): string {
        let mermaidBlock = this.getMermaidBlock(llmResponse);
        let mermaidCode = mermaidBlock.replace(/```mermaid|```/g, "");

        const fixedMermaidCode = this.fixCycles(mermaidCode);
        if (fixedMermaidCode) {
            mermaidCode = fixedMermaidCode;
            mermaidBlock = "```mermaid\n" + fixedMermaidCode + "\n```";
        }

        const linkGenerator = new MermaidLinkGenerator(mermaidCode);

        return `<p align="center">
    <a href="https://swark.io">
        <img src="https://raw.githubusercontent.com/swark-io/swark/refs/heads/main/assets/logo/swark-logo-dark-mode.png" width="10%" />
    </a>
</p>
<p align="center">
    <b>Automatic Architecture Diagrams from Code</b><br />
    <a href="https://github.com/swark-io/swark">GitHub</a> • <a href="https://swark.io">Website</a> • <a href="mailto:contact@swark.io">Contact Us</a>
</p>

## Usage Instructions

1. **Render the Diagram**: Use the links below to open it in Mermaid Live Editor, or install the [Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension.
2. **Recommended Model**: If available for you, use \`claude-3.5-sonnet\` [language model](vscode://settings/swark.languageModel). It can process more files and generates better diagrams.
3. **Iterate for Best Results**: Language models are non-deterministic. Generate the diagram multiple times and choose the best result.

## Generated Content
**Model**: ${modelName} - [Change Model](vscode://settings/swark.languageModel)  
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

    private static fixCycles(mermaidCode: string): string | null {
        const cycleDetector = new MermaidCycleDetector(mermaidCode);
        const cycles = cycleDetector.detectCycles();
        const isCycleFixEnabled = vscode.workspace.getConfiguration("swark").get<number>("fixMermaidCycles");

        if (cycles && isCycleFixEnabled) {
            const fixedMermaidCode = cycleDetector.fixCycles(cycles);

            if (fixedMermaidCode) {
                const subgraphNames = Array.from(cycles.values()).map((subgraph) => subgraph.name);
                vscode.window.showInformationMessage(
                    `Detected and fixed cycles in the generated diagram that would cause rendering failure. Subgraphs renamed: ${subgraphNames}`
                );

                const numCyclesInFixedCode = this.getNumCycles(fixedMermaidCode);
                telemetry.sendTelemetryEvent(
                    "diagramCycleFixSucceeded",
                    {},
                    { numCycles: cycles.size, numCyclesInFixedCode }
                );

                return fixedMermaidCode;
            }
        }

        return null;
    }

    private static getNumCycles(mermaidCode: string): number {
        const cycleDetector = new MermaidCycleDetector(mermaidCode);
        const cycles = cycleDetector.detectCycles();
        return cycles ? cycles.size : 0;
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
