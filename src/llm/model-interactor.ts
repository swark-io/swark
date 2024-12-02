import * as vscode from "vscode";
import { telemetry } from "../telemetry";

export class ModelInteractor {
    public static async getModel(): Promise<vscode.LanguageModelChat> {
        const models = await vscode.lm.selectChatModels({ family: "gpt-4o" });

        if (models.length === 0) {
            throw new Error(
                "No language models available. This may occur if there is no active GitHub Copilot subscription."
            );
        }

        const [model] = models;
        console.log(model);
        this.sendModelSelectedTelemetry(model);
        return model;
    }

    private static sendModelSelectedTelemetry(model: vscode.LanguageModelChat): void {
        telemetry.sendTelemetryEvent(
            "modelSelected",
            { name: model.name, id: model.id, vendor: model.vendor, family: model.family, version: model.version },
            { maxInputTokens: model.maxInputTokens }
        );
    }

    public static async sendPrompt(
        model: vscode.LanguageModelChat,
        prompt: vscode.LanguageModelChatMessage[]
    ): Promise<string> {
        try {
            const response = await model.sendRequest(prompt, {});
            return await this.readStream(response);
        } catch (error) {
            if (error instanceof vscode.LanguageModelError) {
                console.error(error.message, error.code, error.cause);
            } else {
                console.error(error);
            }
            throw error;
        }
    }

    private static async readStream(response: vscode.LanguageModelChatResponse): Promise<string> {
        let content = "";
        for await (const chunk of response.text) {
            content += chunk;
        }
        return content;
    }
}
