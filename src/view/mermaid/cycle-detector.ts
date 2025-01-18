import { telemetry } from "../../telemetry";

export interface Subgraph {
    name: string;
    line: number;
}

export class MermaidCycleDetector {
    private readonly mermaidCode: string;

    public constructor(mermaidCode: string) {
        this.mermaidCode = mermaidCode;
    }

    public detectCycles(): Map<number, Subgraph> | null {
        try {
            const cyclicSubgraphs = this.detectCyclicSubgraphs();

            if (cyclicSubgraphs.size > 0) {
                const subgraphsNames = Array.from(cyclicSubgraphs.values()).map((subgraph) => subgraph.name);
                console.log(`Cycles detected in diagram at subgraphs: ${subgraphsNames}`);
                telemetry.sendTelemetryErrorEvent("diagramCycleDetected", {}, { numCycles: cyclicSubgraphs.size });
                return cyclicSubgraphs;
            }
        } catch (error) {
            let properties = {};
            if (error instanceof Error) {
                properties = { error: error.name, message: error.message };
            }

            telemetry.sendTelemetryErrorEvent("diagramCycleDetectionFailed", properties);
        }

        return null;
    }

    private detectCyclicSubgraphs(): Map<number, Subgraph> {
        const lines = this.mermaidCode.split("\n");
        const ancestorSubgraphs: Subgraph[] = [];
        const cyclicSubgraphs: Map<number, Subgraph> = new Map();

        for (let i = 0; i < lines.length; i++) {
            this.processLine(lines[i], i, ancestorSubgraphs, cyclicSubgraphs);
        }

        return cyclicSubgraphs;
    }

    private processLine(
        line: string,
        lineNumber: number,
        ancestorSubgraphs: Subgraph[],
        cyclicSubgraphs: Map<number, Subgraph>
    ): void {
        line = line.trim();

        if (line === "") {
            return;
        }

        if (line.startsWith("subgraph")) {
            const rest = line.substring("subgraph".length, line.length);
            const subgraphName = rest.split("[")[0].trim();

            this.checkIfCyclicSubgraph(ancestorSubgraphs, subgraphName, cyclicSubgraphs);

            ancestorSubgraphs.push({ name: subgraphName, line: lineNumber });
        } else if (line.startsWith("end")) {
            ancestorSubgraphs.pop();
        } else {
            const nodeName = line.split("[")[0];
            this.checkIfCyclicSubgraph(ancestorSubgraphs, nodeName, cyclicSubgraphs);
        }
    }

    private checkIfCyclicSubgraph(
        ancestorSubgraphs: Subgraph[],
        nodeName: string,
        cyclicSubgraphs: Map<number, Subgraph>
    ): void {
        const ancestorSubgraph = ancestorSubgraphs.find((subgraph) => subgraph.name === nodeName);

        if (ancestorSubgraph) {
            cyclicSubgraphs.set(ancestorSubgraph.line, ancestorSubgraph);
        }
    }

    public fixCycles(subgraphs: Map<number, Subgraph>): string | null {
        try {
            const lines = this.mermaidCode.split("\n");

            for (const subgraph of subgraphs.values()) {
                const cyclicLine = lines[subgraph.line];

                const [beforeSubgraph, afterSubgraph] = cyclicLine.split("subgraph", 2);
                let [subgraphName, afterBracket] = afterSubgraph.split("[");
                subgraphName = subgraphName.trim();

                if (subgraphName !== subgraph.name) {
                    throw new Error(`Expected "${subgraph.name}" but found "${subgraphName}"`);
                }

                lines[subgraph.line] = this.fixSubgraphLine(subgraphName, beforeSubgraph, afterBracket);
            }

            return lines.join("\n");
        } catch (error) {
            let properties = {};
            if (error instanceof Error) {
                properties = { error: error.name, message: error.message };
            }

            telemetry.sendTelemetryErrorEvent("diagramCycleFixFailed", properties);
            return null;
        }
    }

    private fixSubgraphLine(subgraphName: string, beforeSubgraph: string, afterBracket: string): string {
        const newSubgraphName = `${subgraphName}_`;
        let newLine = `${beforeSubgraph}subgraph ${newSubgraphName}`;

        if (afterBracket) {
            newLine += `[${afterBracket}`;
        }

        return newLine;
    }
}
