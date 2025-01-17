import { telemetry } from "../../telemetry";

interface Subgraph {
    name: string;
    line: number;
}

export class MermaidCycleDetector {
    private readonly mermaidCode: string;

    public constructor(mermaidCode: string) {
        this.mermaidCode = mermaidCode;
    }

    public detectCycle(): boolean {
        const cycleNode = this.detectCyclicSubgraph();

        if (cycleNode) {
            console.log(`Cycle detected in diagram at node: ${cycleNode}`);
            telemetry.sendTelemetryErrorEvent("diagramCycleDetected");
            return true;
        }

        return false;
    }

    private detectCyclicSubgraph(): string | undefined {
        const lines = this.mermaidCode.split("\n");
        const ancestorSubgraphs: Subgraph[] = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            line = line.trim();

            if (line.startsWith("subgraph")) {
                const rest = line.substring("subgraph".length, line.length);
                const subgraphName = rest.split("[")[0].trim();

                if (ancestorSubgraphs.find((subgraph) => subgraph.name === subgraphName)) {
                    return subgraphName;
                }

                ancestorSubgraphs.push({ name: subgraphName, line: i });
            } else if (line.startsWith("end")) {
                ancestorSubgraphs.pop();
            } else if (line === "") {
                continue;
            } else {
                const node = line.split("[")[0];

                if (ancestorSubgraphs.find((subgraph) => subgraph.name === node)) {
                    return node;
                }
            }
        }

        return undefined;
    }
}
