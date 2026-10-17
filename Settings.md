# Beautify Revival settings

English | [日本語](Settings.ja.md) | [README](README.md)

A settings reference based on [HookyQR/VSCodeBeautify Settings.md](https://github.com/HookyQR/VSCodeBeautify/blob/master/Settings.md), checked against **js-beautify 2.0.3** used by Beautify Revival 0.1.2. This is not a verbatim copy of the old defaults.

## Where to put settings

Put engine options in `.jsbeautifyrc`, or in the `beautify.config` object in VS Code's `settings.json`. `beautify.config` can instead be a path to a JSON configuration file. Relative paths use the workspace root, or the extension process's working directory without a workspace.

The extension accepts common options plus `js`, `html`, and `css` blocks. The selected block overrides common options. JSON/JSONC uses `js`. These are configuration blocks, not independent VS Code setting names.

```json
{
  "indent_size": 4,
  "indent_char": " ",
  "end_with_newline": true,
  "js": {
    "brace_style": "collapse",
    "keep_array_indentation": false
  },
  "html": {
    "wrap_attributes": "force-expand-multiline",
    "wrap_attributes_indent_size": 4
  },
  "css": {
    "indent_size": 2,
    "newline_between_rules": true
  }
}
```

A nearer `.jsbeautifyrc` takes precedence over `beautify.config`. A selected config replaces the fallback VS Code/EditorConfig options, rather than merging all sources. Include required indentation settings explicitly. Without an explicit config, editor/HTML/JavaScript and supported EditorConfig settings can override the engine defaults below. See the README for precedence; in multi-root workspaces this implementation may also search above the containing root, unlike the original extension's strict boundary. Config files allow JSON comments but not trailing commas or executable JavaScript.

## Extension settings (VS Code `settings.json`)

| Setting | Type | Purpose |
| --- | --- | --- |
| `beautify.config` | object / string / null | Inline engine options, config-file path, or no explicit config. Default: null. |
| `beautify.language` | object | Map language IDs (`type`), extensions (`ext`, without dots), or basenames (`filename`) to js/css/html. Arrays mean language IDs. Defaults are listed below. |
| `beautify.ignore` | string / string[] | Glob exclusions for Format Document, Format Selection, and save formatting. Default: []. Explicit Beautify commands bypass exclusions. |

Default `beautify.language`:

```json
{
  "beautify.language": {
    "js": {
      "type": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "json",
        "jsonc"
      ],
      "filename": [
        ".jshintrc",
        ".jsbeautifyrc"
      ]
    },
    "css": [
      "css",
      "less",
      "scss"
    ],
    "html": [
      "htm",
      "html"
    ]
  }
}
```

Custom-only languages do not automatically activate the extension; first run a Beautify command or open a built-in supported language. Configure VS Code's `editor.defaultFormatter` as `corpdrone-labs.vscode-beautify-revival` and `editor.formatOnSave: true` to use this formatter on save.

## Engine options

Defaults are **engine defaults with no editor overrides**, not a guarantee of your current editor's effective settings. All = JS/CSS/HTML. JS includes JSON/JSONC; syntax support is limited by js-beautify. The final rows add useful current options absent from the older reference. An unsupported legacy option is explicitly marked.

| Setting | Formatter | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `eol` | All | string | `"auto"` | Line endings: auto-detect from input, or specify `"\n"` / `"\r\n"`. |
| `end_with_newline` | All | boolean | `false` | End the result with a newline. Partial selections override this to false. |
| `indent_char` | All | string | `" "` | Indentation character. |
| `indent_size` | All | integer | `4` | Indent width. |
| `indent_with_tabs` | All | boolean | `false` | Use tabs instead of the indent character. Also defaults to true when indent_char is a tab; indent_size is not simply ignored. |
| `preserve_newlines` | All | boolean | `true` | Retain input line breaks where the formatter permits; not exact whitespace preservation. |
| `max_preserve_newlines` | All | integer | `32786` | Maximum consecutive preserved line breaks; becomes 0 when preserve_newlines is false. |
| `wrap_line_length` | JS / HTML | integer | `0` | Wrap at available break points; 0 disables length-based wrapping. Not a strict maximum. |
| `extra_liners` | HTML | string[] | `["head", "body", "/html"]` | Tags that receive an extra preceding newline. |
| `indent_body_inner_html` | HTML | boolean | `true` | Indent content inside body. |
| `indent_handlebars` | HTML | boolean | `true` | Indent Handlebars block constructs. |
| `indent_head_inner_html` | HTML | boolean | `true` | Indent content inside head. |
| `indent_inner_html` | HTML | boolean | `false` | Indent head/body under html. |
| `indent_scripts` | HTML | string | `"normal"` | Script indentation: `normal`, `keep`, or `separate`. |
| `inline` | HTML | string[] | `See list / 一覧参照` | Tags treated as inline elements. A supplied list replaces the default. |
| `wrap_attributes` | HTML | string | `"auto"` | One of `auto`, `force`, `force-aligned`, `force-expand-multiline`, `aligned-multiple`, `preserve`, `preserve-aligned`. |
| `wrap_attributes_indent_size` | HTML | integer | `indent_size` | Indent width for wrapped attributes. This is numeric, not boolean. |
| `unformatted` | HTML | string[] | `[]` | Tags whose markup should not be reformatted. |
| `content_unformatted` | HTML | string[] | `["pre", "textarea"]` | Tags whose contents should not be reformatted. |
| `void_elements` | HTML | string[] | `See list / 一覧参照` | Elements treated as void/single tags; a supplied list replaces the default. |
| `newline_between_rules` | CSS | boolean | `true` | Insert a blank line between rules. |
| `selector_separator_newline` | CSS | boolean | `true` | Put comma-separated selectors on separate lines. |
| `space_around_combinator` | CSS | boolean | `false` | Add spaces around combinators such as >, +, and ~. |
| `brace_style` | JS / CSS | string | `"collapse"` | JS: `collapse`, `expand`, `end-expand`, `none`, optionally followed by `,preserve-inline`. CSS implements collapse/expand only. |
| `break_chained_methods` | JS | boolean | `false` | Break chained method calls across lines. |
| `comma_first` | JS | boolean | `false` | Place commas at the beginning of continued lines. |
| `e4x` | JS | boolean | `false` | Preserve E4X XML literals. Not a full JSX formatter; the revival React safety path forces this off. |
| `indent_level` | JS | integer | `0` | Initial JavaScript indentation level. |
| `jslint_happy` | JS | boolean | `false` | Enable stricter JSLint-style spacing; forces space_after_anon_function on. |
| `keep_array_indentation` | JS | boolean | `false` | Keep existing array indentation; does not force expanded arrays. |
| `keep_function_indentation` | JS | legacy | `Unsupported / 非対応` | Listed by the old extension, but not read by js-beautify 2.0.3; do not rely on it. |
| `operator_position` | JS | string | `"before-newline"` | `before-newline`, `after-newline`, or `preserve-newline`. |
| `space_after_anon_function` | JS | boolean | `false` | Space before anonymous-function parentheses: `function ()`. |
| `space_after_named_function` | JS | boolean | `false` | Space before named-function parentheses: `function example ()`. |
| `space_before_conditional` | JS | boolean | `true` | Space before a conditional statement parenthesis. |
| `space_in_empty_paren` | JS | boolean | `false` | Space inside empty parentheses: `f( )`. |
| `space_in_paren` | JS | boolean | `false` | Padding inside nonempty parentheses: `f( a, b )`. |
| `unescape_strings` | JS | boolean | `false` | Decode printable hex escapes in strings. Review textual changes. |
| `unindent_chained_methods` | JS | boolean | `false` | Avoid extra indentation for chained methods. |
| `disabled` | All | boolean | `false` | Return input without formatting. |
| `indent_empty_lines` | All | boolean | `false` | Indent empty lines where supported. |
| `templating` | All | string[] | `["auto"]` | Template handling: auto, none, angular, django, erb, handlebars, php, smarty. Auto resolves to django/erb/handlebars/php in HTML. |
| `wrap_attributes_min_attrs` | HTML | integer | `2` | Minimum attribute count for applicable forced wrapping modes. |
| `inline_custom_elements` | HTML | boolean | `true` | Treat custom elements as inline. |
| `unformatted_content_delimiter` | HTML | string | `""` | Delimiter for preserving unformatted text regions. |

## Default HTML tag lists

### `inline`

```json
["a", "abbr", "area", "audio", "b", "bdi", "bdo", "br", "button", "canvas", "cite", "code", "data", "datalist", "del", "dfn", "em", "embed", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "map", "mark", "math", "meter", "noscript", "object", "output", "progress", "q", "ruby", "s", "samp", "select", "small", "span", "strong", "sub", "sup", "svg", "template", "textarea", "time", "u", "var", "video", "wbr", "text", "acronym", "big", "strike", "tt"]
```

### `void_elements`

```json
["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr", "!doctype", "?xml", "basefont", "isindex"]
```


## Differences from the older reference

- `eol` defaults to `"auto"`, not a fixed LF.
- `max_preserve_newlines` defaults to 32786, not 10.
- `indent_handlebars` and CSS `newline_between_rules` default to true.
- `wrap_attributes_indent_size` is an integer falling back to `indent_size`, not a boolean.
- The accepted attribute mode is `aligned-multiple`, not `align-multiple`.
- `keep_function_indentation` is not implemented in this engine version.
- The current inline/void lists differ from the old lists. CSS also supports collapse/expand brace styles.

## Embedded JSON and React caveats

HTML's `application/json` contents are formatted by the JavaScript engine. Collapsed braces plus preserved newlines can produce different layouts for equivalent compact/multiline arrays. `keep_array_indentation` does not enforce a standard JSON layout.

The extension discards top-level js/css blocks when selecting HTML options, so a top-level `js` override does not automatically apply to embedded scripts. For example, use the following to reduce existing-line-break dependence for the tested HTML/JSON array examples:

```json
{
  "indent_size": 2,
  "html": {
    "preserve_newlines": false
  }
}
```

This affects other HTML and embedded scripts too, and does not force each JSON bracket onto its own line. JSX/TSX elements and fragments are preserved by the extension's safety path, not formatted internally; parsing failure or changed syntax leaves the original input unchanged. This is not complete TypeScript/JSX formatting support.

## Sources and attribution

Based on the original MIT-licensed [Settings.md](https://github.com/HookyQR/VSCodeBeautify/blob/master/Settings.md), Copyright (c) 2016 HookyQR; see [LICENSE](LICENSE). Definitions/defaults were checked against the installed js-beautify 2.0.3 core, JavaScript, HTML, and CSS option implementations and this extension's `src/options.js`. See [js-beautify](https://github.com/beautifier/js-beautify) for upstream documentation. Engine and VS Code versions can change behavior.
