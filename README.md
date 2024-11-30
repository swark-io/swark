<h1 align="center">
    <a href="https://swark.io#gh-light-mode-only">
      <img src="./assets/logo/swark-logo-light-mode.png#gh-light-mode-only" width="30%"/>
    </a>
    <a href="https://swark.io#gh-dark-mode-only"> 
      <img src="./assets/logo/swark-logo-dark-mode.png#gh-dark-mode-only" width="30%"/>
    </a>
</h1>

<p align="center">
  <b>Automatic Architecture Diagrams from Code</b> <br />
  </b>Powered by LLMs</b> <br />
</p>

## Swark

Swark is a VS Code extension that allows creating architecture diagrams from code, automatically, using LLMs.\
Swark is **directly integrated with GitHub Copilot**, and requires no authentication or API key.

<h1 align="center">
    <img src="./assets/demo.png" width="85%"/>
</h1>

### Use Cases

-   🔎 **Learn a New Codebase**: Swark helps you quickly generate an architecture diagram of a repository, providing a high-level overview of the codebase without the need to manually explore files or folder structure. This allows you to focus on the areas most relevant to your work.
-   📕 **Documentation**: enhance your documentation with up-to-date architecture diagrams that are simple to create and require minimal engineering effort.
-   🧩 **Visualize Dependencies**: a dependency graph of your repo can help you spot unwanted dependencies and suboptimal design.
-   ✅ **Test Coverage**: include your tests in Swark's input to visualize your test coverage and identify areas that may be missing.

## How it Works

1. **File Retrieval**: Swark retrieves code files within the chosen folder. Swark automatically adjusts the number of retrieved files to match the LLM max token limit.
2. **Prompt Building**: based on the retrieved files, Swark builds a prompt to generate an architecture diagram. The code files are included in the prompt, together with instructions on how to build the diagram.
3. **LLM Request**: Swark invokes LLM request to GitHub Copilot via VS Code [Language Model API](https://code.visualstudio.com/api/extension-guides/language-model).
4. **Diagram Preview**: upon a successful response, the diagram is presented. This is done by creating a markdown file that includes the diagram in [Mermaid](https://mermaid.js.org/) syntax and previewing it.

### Code Access and File Sharing

It's important to note that source code is **only shared with GitHub Copilot**, and with no other external APIs or providers.

## Requirements

-   **GitHub Copilot Subscription**: Swark is currently working directly with GitHub Copilot and requires an [active subscription](https://github.com/features/copilot#pricing) to work.
-   **Mermaid Markdown Preview**: in order to preview the diagram in VS Code you can install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension. Alternatively, you can copy the Mermaid code and paste it into any [Mermaid editor](https://mermaid.live/).

## Installation

Simply install Swark via the [VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=swark.swark).

## How to Use

1. In VS Code, open the Command Palette and run: **Swark: Create Architecture Diagram**.\
   Alternatively, you can use Swark's default keybindings: `cmd+shift+r` (Mac) or `ctrl+shift+r` (Windows).
2. Select a folder to use in Swark's file search.
3. Within a few seconds, a tab will open displaying a preview of your architecture diagram.\
   Another tab will contain the diagram's code, which you can edit manually or copy for use in other tools.

<h1 align="center">
    <a href="https://github.com/user-attachments/assets/5b885430-d958-47a0-9daa-f64542844fba"><img src="./assets/demo.gif" width="85%" alt="Swark Demo"/></a>
</h1>

## Extension Settings

This extension contributes the following settings:

| Setting                 | Description                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `swark.maxFiles`        | Max number of files to read.<br>The number of files read is also affected by the LLM max token limit.                                    |
| `swark.fileExtensions`  | List of file extensions to include in search.                                                                                            |
| `swark.excludePatterns` | List of glob patterns to exclude from file search.<br>Defaults include: `**/.*` for hidden files, `**/node_modules/**` for node modules. |

## Known Issues

### Mermaid Diagram Cycle

The LLM's output may occasionally generate a cycle in the Mermaid code, resulting in the following error:

```
Syntax error in text
mermaid version 11.4.0

Setting Node as parent of Node would create a cycle
```

This occurs when a parent and child node share the same name.\
To resolve this issue:

1. Re-run Swark to generate a new result.
2. Edit the diagram code manually by renaming the parent node to give it a unique name.

## Release Notes

### 1.0.0

Initial release of Swark VS Code extension.

## Privacy Notice

This extension collects telemetry data to help improve the product experience. The data collected includes:

-   Extension activation and usage events
-   Selected model information
-   Number of files processed and prompt length
-   LLM response time
-   Error events

No source code, file contents, or personal information is ever included in the telemetry data.

We use [@vscode/extension-telemetry](https://github.com/microsoft/vscode-extension-telemetry) module to collect this data. The data is sent to Azure Application Insights and is used solely to improve Swark's functionality and user experience.

You can disable telemetry collection by setting `"telemetry.telemetryLevel": "off"` in your VS Code settings.

## License

Swark is licensed under the [GNU Affero General Public License v3.0](https://github.com/swark-io/swark/blob/main/LICENSE)
