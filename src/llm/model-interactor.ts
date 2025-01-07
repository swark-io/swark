import * as vscode from "vscode";
import { telemetry } from "../telemetry";

export class ModelInteractor {
    private static readonly FALLBACK_MODEL = "gpt-4o";

    public static async getModel(): Promise<vscode.LanguageModelChat> {
        const availableModels = await this.getAvailableModels();
        const configuredModel = this.getConfiguredModel();
        const fallbackModel = this.FALLBACK_MODEL;
        const selectedModel = this.selectModel(availableModels, configuredModel, fallbackModel);

        this.sendModelSelectedTelemetry(selectedModel, configuredModel, fallbackModel, availableModels);
        return selectedModel;
    }

    private static async getAvailableModels(): Promise<vscode.LanguageModelChat[]> {
        const availableModels = await vscode.lm.selectChatModels({
            vendor: "copilot",
        });
        console.log(availableModels);

        if (availableModels.length === 0) {
            throw new Error(
                "No language models are available. " +
                    "Ensure you have GitHub Copilot extension installed: https://marketplace.visualstudio.com/items?itemName=GitHub.copilot"
            );
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
        configuredModelFamily: string,
        fallbackModelFamily: string
    ): vscode.LanguageModelChat {
        const configuredModel = this.findModel(availableModels, configuredModelFamily);

        if (configuredModel) {
            console.log("configured");
            return configuredModel;
        }

        const fallbackModel = this.findModel(availableModels, fallbackModelFamily);

        if (fallbackModel) {
            console.log("fallback");
            this.showModelNotAvailableMessage(configuredModelFamily, fallbackModelFamily, availableModels);
            return fallbackModel;
        }

        const someModel = availableModels[0];
        this.showModelNotAvailableMessage(configuredModelFamily, someModel.family, availableModels);
        console.log("someModel");
        return someModel;
    }

    private static findModel(
        availableModels: vscode.LanguageModelChat[],
        modelFamily: string
    ): vscode.LanguageModelChat | undefined {
        return availableModels.find((model) => model.family === modelFamily);
    }

    private static showModelNotAvailableMessage(
        configuredModelFamily: string,
        alternativeModelFamily: string,
        availableModels: vscode.LanguageModelChat[]
    ): void {
        vscode.window.showInformationMessage(
            `Configured model "${configuredModelFamily}" is not available. Using "${alternativeModelFamily}" instead. ` +
                `You can change this in "swark.languageModel" setting. Available models: ${this.availableModelsToString(
                    availableModels
                )}`
        );
    }

    private static sendModelSelectedTelemetry(
        model: vscode.LanguageModelChat,
        configuredModel: string,
        fallbackModel: string,
        availableModels: vscode.LanguageModelChat[]
    ): void {
        telemetry.sendTelemetryEvent(
            "modelSelected",
            {
                name: model.name,
                id: model.id,
                vendor: model.vendor,
                family: model.family,
                version: model.version,
                configuredModel,
                fallbackModel,
                availableModels: this.availableModelsToString(availableModels),
            },
            { maxInputTokens: model.maxInputTokens }
        );
    }

    private static availableModelsToString(availableModels: vscode.LanguageModelChat[]): string {
        return availableModels.map((model) => model.family).join(", ");
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
