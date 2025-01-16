import * as assert from "assert";
import { initializeTelemetry } from "../../../telemetry";
import { MermaidCycleDetector } from "../cycle-detector";

suite("MermaidCycleDetector Test Suite", () => {
    const validMermaidCode =
        "graph TD\n    subgraph Extension_\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n        Telemetry[Telemetry Service]\n\n        subgraph test [bla]\n            a\n            b\n        end\n    end\n\n    subgraph Input\n        FolderSelector[Folder Selector]\n        RepoReader[Repository Reader]\n        LangCounter[Language Counter]\n    end\n\n    subgraph LLM Integration\n        ModelInteractor[Model Interactor]\n        PromptBuilder[Prompt Builder]\n        TokenCounter[Token Counter]\n    end\n\n    subgraph Output Generation\n        OutputFormatter[Output Formatter]\n        OutputWriter[Output Writer]\n        DiagramViewer[Diagram Viewer]\n    end\n\n    subgraph Mermaid\n        MermaidSerializer[Mermaid Serializer]\n        LinkGenerator[Link Generator]\n    end\n\n    Extension --> CreateArchitectureCommand\n    Extension --> Telemetry\n\n    CreateArchitectureCommand --> FolderSelector\n    CreateArchitectureCommand --> RepoReader\n    CreateArchitectureCommand --> ModelInteractor\n    CreateArchitectureCommand --> OutputWriter\n    CreateArchitectureCommand --> DiagramViewer\n\n    RepoReader --> LangCounter\n    RepoReader --> TokenCounter\n\n    ModelInteractor --> PromptBuilder\n    ModelInteractor --> TokenCounter\n\n    OutputFormatter --> MermaidSerializer\n    OutputFormatter --> LinkGenerator\n\n    OutputWriter --> OutputFormatter\n";
    const mermaidCodeWithCycle =
        "graph TD\n    subgraph Extension\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n        Telemetry[Telemetry Service]\n\n        subgraph test [bla]\n            a\n            b\n        end\n    end\n\n    subgraph Input\n        FolderSelector[Folder Selector]\n        RepoReader[Repository Reader]\n        LangCounter[Language Counter]\n    end\n\n    subgraph LLM Integration\n        ModelInteractor[Model Interactor]\n        PromptBuilder[Prompt Builder]\n        TokenCounter[Token Counter]\n    end\n\n    subgraph Output Generation\n        OutputFormatter[Output Formatter]\n        OutputWriter[Output Writer]\n        DiagramViewer[Diagram Viewer]\n    end\n\n    subgraph Mermaid\n        MermaidSerializer[Mermaid Serializer]\n        LinkGenerator[Link Generator]\n    end\n\n    Extension --> CreateArchitectureCommand\n    Extension --> Telemetry\n\n    CreateArchitectureCommand --> FolderSelector\n    CreateArchitectureCommand --> RepoReader\n    CreateArchitectureCommand --> ModelInteractor\n    CreateArchitectureCommand --> OutputWriter\n    CreateArchitectureCommand --> DiagramViewer\n\n    RepoReader --> LangCounter\n    RepoReader --> TokenCounter\n\n    ModelInteractor --> PromptBuilder\n    ModelInteractor --> TokenCounter\n\n    OutputFormatter --> MermaidSerializer\n    OutputFormatter --> LinkGenerator\n\n    OutputWriter --> OutputFormatter\n";

    initializeTelemetry();

    test("on valid mermaid code, cycle is not detected", () => {
        const detector = new MermaidCycleDetector(validMermaidCode);
        const result = detector.detectCycle();
        assert.equal(result, false);
    });

    test("on mermaid code with cycle, cycle is detected", () => {
        const detector = new MermaidCycleDetector(mermaidCodeWithCycle);
        const result = detector.detectCycle();
        assert.equal(result, true);
    });
});
