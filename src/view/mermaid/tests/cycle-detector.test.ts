import * as assert from "assert";
import { initializeTelemetry } from "../../../telemetry";
import { MermaidCycleDetector, Subgraph } from "../cycle-detector";

suite("MermaidCycleDetector Test Suite", () => {
    initializeTelemetry();

    const validMermaidCode =
        "graph TD\n    subgraph Extension_\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n    end\n\n    Extension --> CreateArchitectureCommand\n";
    const validMermaidCodeWithNestedSubgraphs =
        "\ngraph TB\n    subgraph Application_\n        Application[Spring Boot Application]\n        RestfulServer[FHIR Restful Server]\n        FhirContextConfig[FHIR Context]\n\n        subgraph inner\n            node \n             subgraph inner2\n                node2\n            end\n        end \n    end\n\n    subgraph Storage\n        JPA[JPA Storage Layer]\n        Hibernate[Hibernate]\n        Database[(Database)]\n        Elasticsearch[(Elasticsearch)]\n    end\n\n    subgraph Core_Features\n        ValidationModule[Validation]\n        Subscriptions[Subscriptions]\n        BatchJobs[Batch Jobs]\n        MDM[Master Data Management]\n    end\n\n    subgraph Extensions\n        CDS[Clinical Decision Support]\n        IPS[International Patient Summary]\n        CR[Clinical Reasoning]\n        IG[Implementation Guide]\n    end\n\n    subgraph Web\n        WebUI[Web UI]\n        CustomContent[Custom Content]\n        Tester[FHIR Tester]\n    end\n\n    Application --> RestfulServer\n    RestfulServer --> FhirContextConfig\n    \n    RestfulServer --> JPA\n    JPA --> Hibernate\n    Hibernate --> Database\n    JPA --> Elasticsearch\n\n    RestfulServer --> ValidationModule\n    RestfulServer --> Subscriptions\n    RestfulServer --> BatchJobs\n    RestfulServer --> MDM\n\n    RestfulServer --> CDS\n    RestfulServer --> IPS \n    RestfulServer --> CR\n    RestfulServer --> IG\n\n    Application --> WebUI\n    Application --> CustomContent\n    Application --> Tester\n";
    const mermaidCodeWithCycle =
        "graph TD\n    subgraph Extension\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n    end\n\n    Extension --> CreateArchitectureCommand\n";
    const mermaidCodeWithTwoCycles =
        "graph TD\n    subgraph Extension\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n    end\n\n    subgraph Other\n        Other[Extension Entry Point]\n        Better\n    end\n\n    Extension --> CreateArchitectureCommand\n    Other --> Extension";
    const mermaidCodeWithTwoCyclesFixed =
        "graph TD\n    subgraph Extension_\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n    end\n\n    subgraph Other_\n        Other[Extension Entry Point]\n        Better\n    end\n\n    Extension --> CreateArchitectureCommand\n    Other --> Extension";
    const mermaidCodeWithNestedSubgraphCycle =
        "graph TD\n    subgraph Extension_Core\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n\n        subgraph Extension_Core\n            Node1\n            Node2\n        end\n    end\n\n    subgraph Other\n        Other[Extension Entry Point]\n        Better\n    end\n\n    Extension --> CreateArchitectureCommand\n    Other --> Extension";
    const mermaidCodeWithNestedSubgraphCycleFixed =
        "graph TD\n    subgraph Extension_Core_\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand\n\n        subgraph Extension_Core\n            Node1\n            Node2\n        end\n    end\n\n    subgraph Other_\n        Other[Extension Entry Point]\n        Better\n    end\n\n    Extension --> CreateArchitectureCommand\n    Other --> Extension";

    [validMermaidCode, validMermaidCodeWithNestedSubgraphs].forEach((mermaidCode, index) => {
        test(`on valid mermaid code, cycle is not detected - case ${index}`, () => {
            const detector = new MermaidCycleDetector(mermaidCode);
            const result = detector.detectCycles();
            assert.equal(result, undefined);
        });
    });

    test("on mermaid code with cycle, cycle is detected", () => {
        const detector = new MermaidCycleDetector(mermaidCodeWithCycle);
        const cycles = detector.detectCycles();
        assertCyclesEqual(cycles, [{ name: "Extension", line: 1 }]);
    });

    [
        {
            name: "single cycle",
            mermaidCode: mermaidCodeWithCycle,
            expectedCycles: [{ name: "Extension", line: 1 }],
            expectedMermaidCode: validMermaidCode,
        },
        {
            name: "multiple cycles",
            mermaidCode: mermaidCodeWithTwoCycles,
            expectedCycles: [
                { name: "Extension", line: 1 },
                { name: "Other", line: 6 },
            ],
            expectedMermaidCode: mermaidCodeWithTwoCyclesFixed,
        },
        {
            name: "nested subgraph",
            mermaidCode: mermaidCodeWithNestedSubgraphCycle,
            expectedCycles: [
                { name: "Extension_Core", line: 1 },
                { name: "Other", line: 11 },
            ],
            expectedMermaidCode: mermaidCodeWithNestedSubgraphCycleFixed,
        },
    ].forEach(({ name, mermaidCode, expectedCycles, expectedMermaidCode }, index) => {
        test(`fixCycles - ${name}`, () => {
            const detector = new MermaidCycleDetector(mermaidCode);
            const cycles = detector.detectCycles();
            assertCyclesEqual(cycles, expectedCycles);

            if (!cycles) {
                assert.fail("Cycles not detected");
            }

            const result = detector.fixCycles(cycles);
            assert.equal(result, expectedMermaidCode);
        });
    });

    function assertCyclesEqual(actualCycles: Map<number, Subgraph> | undefined, expectedCycles: Subgraph[]): void {
        if (!actualCycles) {
            assert.fail("Cycles not detected");
        }

        assert.equal(actualCycles.size, expectedCycles.length);

        for (let i = 0; i < actualCycles.size; i++) {
            const line = expectedCycles[i].line;
            const subgraph = actualCycles.get(line);
            assert.equal(subgraph?.name, expectedCycles[i].name);
            assert.equal(subgraph?.line, expectedCycles[i].line);
        }
    }
});
