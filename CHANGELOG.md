# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/swark-io/swark/compare/v1.2.0...main)

### Added

-   N/A

### Changed

-   N/A

### Fixed

-   N/A

## [v1.2.0](https://github.com/swark-io/swark/compare/v1.1.1...v1.2.0) - 2024-12-23

### Added

-   Generate links to Mermaid Live Editor to view or edit the diagram. (#4)

### Changed

-   Set default model to `claude-3.5-sonnet`.

### Fixed

-   N/A

## [1.1.1](https://github.com/swark-io/swark/compare/v1.1.0...v1.1.1) - 2024-12-22

### Fixed

-   Fixed duplicate logo rendering on Visual Studio Marketplace (both light and dark mode logos showed).

## [1.1.0](https://github.com/swark-io/swark/compare/ee950ecbff51bed7e65e2e008767fec5a235c953...v1.1.0) - 2024-12-22

### Added

-   Support additional language models: `gpt-4o`, `openai-o1`, `claude-3.5-sonnet`.
-   Users can now configure the language model to use via the `swark.languageModel` setting.

### Changed

-   Modify prompt to not generate additional text besides the architecture diagram.

## 1.0.0 - 2024-11-30

### Added

-   Initial release of Swark VS Code extension.
-   Extension contributes `swark.architecture` command to automatically create an architecture diagram from code.
