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
            const line = lines[i].trim();

            if (line === "") {
                continue;
            } else if (line.startsWith("subgraph")) {
                const rest = line.substring("subgraph".length, line.length);
                const subgraphName = rest.split("[")[0].trim();

                if (this.containsSubgraph(ancestorSubgraphs, subgraphName)) {
                    return subgraphName;
                }

                ancestorSubgraphs.push({ name: subgraphName, line: i });
            } else if (line.startsWith("end")) {
                ancestorSubgraphs.pop();
            } else {
                const nodeName = line.split("[")[0];

                if (this.containsSubgraph(ancestorSubgraphs, nodeName)) {
                    return nodeName;
                }
            }
        }

        return undefined;
    }

    private containsSubgraph(subgraphs: Subgraph[], subgraphName: string): Subgraph | undefined {
        return subgraphs.find((subgraph) => subgraph.name === subgraphName);
    }
}
