import * as assert from "assert";
import { OutputFormatter } from "../output-formatter";
import { initializeTelemetry } from "../../telemetry";

suite("OutputFormatter Test Suite", () => {
    initializeTelemetry();

    const validMermaidBlock =
        "```mermaid\ngraph TD\n    subgraph Extension_\n        Extension[Extension Entry Point]\n        CreateArchitectureCommand[Create Architecture Command]\n    end\n\n    Extension --> CreateArchitectureCommand\n```";

    test("on valid response, getMermaidBlock is identity function", () => {
        runValidResponseTest(validMermaidBlock, validMermaidBlock);
    });

    test("on response with extra payload before block, getMermaidBlock extracts the block", () => {
        const responseWithExtraPayloadBeforeBlock = "response with extra payload - before" + validMermaidBlock;
        runValidResponseTest(responseWithExtraPayloadBeforeBlock, validMermaidBlock);
    });

    test("on response with extra payload after block, getMermaidBlock extracts the block", () => {
        const responseWithExtraPayloadAfterBlock = validMermaidBlock + "response with extra payload - after";
        runValidResponseTest(responseWithExtraPayloadAfterBlock, validMermaidBlock);
    });

    test("on response with extra payload before and after block, getMermaidBlock extracts the block", () => {
        const responseWithExtraPayloadBeforeAndAfterBlock =
            "response with extra payload - before\n" + validMermaidBlock + "\nresponse with extra payload - after";
        runValidResponseTest(responseWithExtraPayloadBeforeAndAfterBlock, validMermaidBlock);
    });

    test("on response with no block, getMermaidBlock throws", () => {
        const reponseWithNoBlock = "a response with no block";
        runInvalidResponseTest(reponseWithNoBlock);
    });

    test("on empty respone, getMermaidBlock throws", () => {
        const emptyRepsonse = "";
        runInvalidResponseTest(emptyRepsonse);
    });

    function runValidResponseTest(llmResponse: string, expectedResult: string): void {
        const result = OutputFormatter.getMermaidBlock(llmResponse);
        assert.equal(result, expectedResult);
    }

    function runInvalidResponseTest(llmResponse: string): void {
        assert.throws(
            () => OutputFormatter.getMermaidBlock(llmResponse),
            Error,
            "No Mermaid block found in the language model response. Please try again."
        );
    }
});
