# Beautify Revival

English | [日本語](README.ja.md)

An unofficial revival based on [HookyQR/VSCodeBeautify](https://github.com/HookyQR/VSCodeBeautify), powered by [`js-beautify`](https://github.com/beautifier/js-beautify). This is an independent project, not an official release of or endorsed by the upstream projects.

## AI-assisted development (vibe coding)

This revival was developed through AI-assisted **vibe coding** using Hermes Agent: the project owner described the goals and requested changes in natural language, and the AI assisted with implementation, tests, debugging, and documentation.

Automated tests and VS Code Extension Host checks have been run, but AI assistance and passing tests do not guarantee correctness or complete compatibility. Review formatting changes before saving or committing important code, and report reproducible problems through this repository's Issues.

This disclosure concerns the revival work, not the authorship of the upstream projects. Their authorship and licenses remain unchanged.

## Installation and setup

Publisher: **CorpDrone Labs** (`corpdrone-labs`). Extension ID: `corpdrone-labs.vscode-beautify-revival`.

Version 0.1.2 is the starting snapshot of this recreated repository. Get the VSIX from [GitHub Releases](https://github.com/corpdrone-labs/vscode-beautify-revival/releases/tag/v0.1.2). Marketplace publication is a separate step. Run **Extensions: Install from VSIX...** in VS Code and select `vscode-beautify-revival-0.1.2.vsix`, or run from the package directory:

```bash
code --install-extension ./vscode-beautify-revival-0.1.2.vsix
```

If you have a separately installed development build, disable or uninstall it before installing this package. Builds with a different publisher are separate extensions and are not automatically replaced. Disable the original `HookyQR.beautify` extension too if installed, to avoid duplicate commands/settings and competing formatters. Run **Developer: Reload Window** after switching.

Open a supported file and run **Beautify Revival: Beautify File** or **Beautify Revival: Beautify Selection**. For standard formatting, choose **Format Document With... → Configure Default Formatter... → Beautify Revival**. To enable format on save for JavaScript, for example:

```jsonc
{
  "[javascript]": {
    "editor.defaultFormatter": "corpdrone-labs.vscode-beautify-revival",
    "editor.formatOnSave": true
  }
}
```

Use the same formatter ID for other supported language settings. Update any default formatter settings that point to a different build. The extension supports `beautify.*` and `.jsbeautifyrc` options.

## Features

- Formats JavaScript, TypeScript, JSON/JSONC, CSS/SCSS/Less, and HTML via `js-beautify` 2.x.
- Preserves the original extension's command style:
  - `Beautify Revival: Beautify Selection`
  - `Beautify Revival: Beautify File`
- Registers VS Code document and range formatters, so `Format Document`, `Format Selection`, and `editor.formatOnSave` work.
- Honors `.jsbeautifyrc` files found from the current file upward to the workspace root.
- Supports `beautify.config`, `beautify.language`, and `beautify.ignore` for compatibility with the original extension.
- Merges supported `.editorconfig` settings when no `.jsbeautifyrc` overrides them.

## JSX / TSX safety

For JavaScript React and TypeScript React documents, JSX elements and fragments (including their text, whitespace, and embedded expressions) are preserved verbatim. Only the surrounding code is formatted. If parsing fails or the parsed syntax would change, the input is left unchanged; incomplete selections may therefore remain unformatted. This is not a full JSX/TypeScript formatter.

Overlapping selections are merged after expanding to whole lines. With no selection, **Beautify Selection** formats the entire document and honors `end_with_newline`.

`beautify.ignore` applies to both VS Code document and range formatting providers. The explicit **Beautify File** and **Beautify Selection** commands intentionally bypass ignore rules.

## Configuration precedence

1. Nearest `.jsbeautifyrc` from the file path up to the workspace root.
2. `beautify.config` as either an inline object or a config-file path.
3. `.jsbeautifyrc` above the workspace root.
4. `~/.jsbeautifyrc`.
5. VS Code editor/html/javascript settings plus `.editorconfig`.

Formatter-specific config blocks are supported:

```jsonc
{
  "indent_size": 4,
  "css": {
    "indent_size": 2
  },
  "html": {
    "wrap_attributes": "force-expand-multiline"
  }
}
```

## Language mapping

```jsonc
{
  "beautify.language": {
    "js": {
      "type": ["javascript", "typescript", "json", "jsonc"],
      "filename": [".jshintrc", ".jsbeautifyrc"],
      "ext": ["mjs", "cjs"]
    },
    "css": ["css", "less", "scss"],
    "html": ["html", "htm"]
  }
}
```

## Development

```bash
npm install
npm test
npm run test:integration # Requires the VS Code `code` CLI; launches an isolated test window.
npm run package
```

## Acknowledgements and provenance

This extension is based on the implementation and behavior of [HookyQR/VSCodeBeautify](https://github.com/HookyQR/VSCodeBeautify), originally created by HookyQR. Thank you to HookyQR and the original contributors for their work. Portions of this project are derived from that MIT-licensed implementation; the original copyright notice and license terms are retained in [LICENSE](LICENSE).

Formatting is powered by [js-beautify](https://github.com/beautifier/js-beautify). Thank you to its authors, maintainers, and contributors. Bundled dependencies retain their own copyright notices and license files; the project's license does not replace those notices.

This revival uses modern VS Code activation events and a new test harness. It is independently maintained and does not imply affiliation with or endorsement by HookyQR or the js-beautify maintainers.

## License

[MIT](LICENSE).

- Original VSCodeBeautify code: Copyright (c) 2016 HookyQR.
- Revival contributions: Copyright (c) 2026 Beautify Revival contributors.
