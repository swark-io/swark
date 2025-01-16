import { telemetry } from "../../telemetry";

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
        const parentNodes: string[] = [];

        for (let line of lines) {
            line = line.trim();

            if (line.startsWith("subgraph")) {
                const rest = line.substring("subgraph".length, line.length);
                const subgraphName = rest.split("[")[0].trim();

                if (parentNodes.includes(subgraphName)) {
                    return subgraphName;
                }

                parentNodes.push(subgraphName);
            } else if (line.startsWith("end")) {
                parentNodes.pop();
            } else if (line === "") {
                continue;
            } else {
                const node = line.split("[")[0];

                if (parentNodes.includes(node)) {
                    return node;
                }
            }
        }

        return undefined;
    }
}
