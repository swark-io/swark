import { MermaidSerializer } from "./serde";

export class MermaidLinkGenerator {
    private static readonly BASE_URL = "https://mermaid.live/";
    private readonly serializedDiagram: string;

    public constructor(mermaidCode: string) {
        this.serializedDiagram = MermaidSerializer.serialize(mermaidCode);
    }

    public createEditLink(): string {
        return `${MermaidLinkGenerator.BASE_URL}edit#${this.serializedDiagram}`;
    }

    public createViewLink(): string {
        return `${MermaidLinkGenerator.BASE_URL}view#${this.serializedDiagram}`;
    }
}
