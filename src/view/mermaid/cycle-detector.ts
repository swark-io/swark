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
        const ancestorNodes: string[] = [];

        for (let line of lines) {
            line = line.trim();

            if (line.startsWith("subgraph")) {
                const rest = line.substring("subgraph".length, line.length);
                const subgraphName = rest.split("[")[0].trim();

                if (ancestorNodes.includes(subgraphName)) {
                    return subgraphName;
                }

                ancestorNodes.push(subgraphName);
            } else if (line.startsWith("end")) {
                ancestorNodes.pop();
            } else if (line === "") {
                continue;
            } else {
                const node = line.split("[")[0];

                if (ancestorNodes.includes(node)) {
                    return node;
                }
            }
        }

        return undefined;
    }
}
