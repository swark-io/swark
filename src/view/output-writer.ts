import * as vscode from "vscode";

export class OutputWriter {
    private readonly outputFolder: vscode.Uri;
    private readonly timestamp: string;

    public constructor(outputFolder: vscode.Uri) {
        this.outputFolder = outputFolder;
        this.timestamp = this.getTimestamp();
    }

    private getTimestamp(): string {
        const now = new Date();
        const locale = "en-US";

        const year = now.toLocaleString(locale, {
            year: "numeric",
        });
        const month = now.toLocaleString(locale, {
            month: "2-digit",
        });
        const day = now.toLocaleString(locale, {
            day: "2-digit",
        });

        const time = now
            .toLocaleString(locale, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            })
            .replaceAll(":", "-");

        return `${year}-${month}-${day}__${time}`;
    }

    public async writeDiagramFile(markdownContent: string): Promise<vscode.Uri> {
        const filename = this.getFileName("diagram");
        return await this.writeFile(filename, markdownContent);
    }

    public async writeLogFile(markdownContent: string): Promise<vscode.Uri> {
        const filename = this.getFileName("log");
        return await this.writeFile(filename, markdownContent);
    }

    private getFileName(type: string): string {
        return `${this.timestamp}__${type}.md`;
    }

    private async writeFile(filename: string, content: string): Promise<vscode.Uri> {
        const uri = vscode.Uri.joinPath(this.outputFolder, filename);
        const encoded = new TextEncoder().encode(content);
        await vscode.workspace.fs.writeFile(uri, encoded);
        return uri;
    }
}
