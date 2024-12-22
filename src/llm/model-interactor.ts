import * as vscode from "vscode";
import { telemetry } from "../telemetry";

export class ModelInteractor {
    public static async getModel(): Promise<vscode.LanguageModelChat> {
        const availableModels = await this.getAvailableModels();
        const configuredModel = this.getConfiguredModel();
        const selectedModel = this.selectModel(availableModels, configuredModel);

        this.sendModelSelectedTelemetry(selectedModel);
        return selectedModel;
    }

    private static async getAvailableModels(): Promise<vscode.LanguageModelChat[]> {
        const availableModels = await vscode.lm.selectChatModels({
            vendor: "copilot",
        });
        console.log(availableModels);

        if (availableModels.length === 0) {
            throw new Error("No language models are available. Ensure you have GitHub Copilot extension installed.");
        }

        return availableModels;
    }

    private static getConfiguredModel(): string {
        const config = vscode.workspace.getConfiguration("swark");
        const configuredModel = config.get<string>("languageModel");
        console.log("configuredModel: " + configuredModel);

        if (!configuredModel) {
            throw new Error('Language model is not configured. Please set "swark.languageModel" setting.');
        }

        return configuredModel;
    }

    private static selectModel(
        availableModels: vscode.LanguageModelChat[],
        configuredModel: string
    ): vscode.LanguageModelChat {
        const selectedModel = availableModels.find((model) => model.family === configuredModel);

        if (!selectedModel) {
            const availableModelFamilies = availableModels.map((model) => model.family);
            throw new Error(
                `Language model "${configuredModel}" is not available. Available models: ${availableModelFamilies.join(
                    ", "
                )}`
            );
        }

        return selectedModel;
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
