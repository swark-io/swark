# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

-   N/A

### Changed

-   N/A

### Fixed

-   N/A

## [1.1.0](https://github.com/swark-io/swark/commit/741f4ee5ded0accffb933a98f649ce4924be2d3d) - 2024-12-22

### Added

-   Support additional language models: `gpt-4o`, `openai-o1`, `claude-3.5-sonnet`.
-   Users can now configure the language model to use via the `swark.languageModel` setting.

### Changed

-   Modify prompt to not generate additional text besides the architecture diagram.

## 1.0.0 - 2024-11-30

### Added

-   Initial release of Swark VS Code extension.
-   Extension contributes `swark.architecture` command to automatically create an architecture diagram from code.
