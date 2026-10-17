# Beautify Revival 設定一覧

[English](Settings.md) | 日本語 | [README](README.ja.md)

[HookyQR/VSCodeBeautify Settings.md](https://github.com/HookyQR/VSCodeBeautify/blob/master/Settings.md) を参考に、Beautify Revival 0.1.2で使用する **js-beautify 2.0.3** の実装と照合した設定一覧です。旧版の既定値をそのまま転載したものではありません。

## 設定を書く場所

エンジンの設定は `.jsbeautifyrc`、またはVS Codeの `settings.json` 内の `beautify.config` オブジェクトに記述します。`beautify.config` にJSON設定ファイルのパスを指定することもできます。相対パスはワークスペースルート基準、ワークスペースがなければ拡張プロセスの作業ディレクトリ基準です。

共通設定と `js`・`html`・`css` ブロックを使用でき、選択したブロックが共通設定を上書きします。JSON／JSONCは `js` を使用します。これらは設定ブロックであり、個別のVS Code設定名ではありません。

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

近くにある `.jsbeautifyrc` が `beautify.config` より優先されます。選択した設定はVS Code／EditorConfig由来の設定を置き換え、すべてをマージするわけではありません。必要なインデント設定なども明記してください。明示的な設定がない場合は、エディター・HTML・JavaScript設定や対応するEditorConfig項目により、以下のエンジン既定値が上書きされます。優先順位はREADMEを参照してください。ただし、現実装はマルチルートでも所属ルートより上を探索する場合があり、元拡張の厳密な探索境界とは異なります。設定ファイルはJSONコメントに対応しますが、末尾カンマや実行可能なJavaScriptには対応しません。

## 拡張機能の設定（VS Codeの `settings.json`）

| 設定 | 型 | 用途 |
| --- | --- | --- |
| `beautify.config` | object / string / null | エンジン設定オブジェクト、設定ファイルのパス、または明示指定なし。既定値：null。 |
| `beautify.language` | object | 言語ID（type）、ドットなし拡張子（ext）、ベース名（filename）をjs／css／htmlに割り当てます。配列は言語IDです。既定値は以下を参照。 |
| `beautify.ignore` | string / string[] | Format Document・Format Selection・保存時整形のglob除外設定。既定値：[]。明示的なBeautifyコマンドは除外を無視します。 |

`beautify.language` の既定値：

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

独自に追加した言語だけでは拡張が自動起動しません。先にBeautifyコマンドを実行するか、標準対応言語を開いてください。保存時整形にはVS Codeの `editor.defaultFormatter` を `corpdrone-labs.vscode-beautify-revival` にし、`editor.formatOnSave: true` を指定します。

## エンジンの設定項目

既定値は、**エディターによる上書きがないエンジン単体の値**です。現在のエディターの実効値とは限りません。AllはJS／CSS／HTML、JSにはJSON／JSONCも含みます。構文の対応範囲はjs-beautifyに依存します。表の後半には旧資料にない現行の補足項目を追加しています。非対応になった旧項目も明記しています。

| 設定 | 対象 | 型 | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| `eol` | All | string | `"auto"` | 改行コード。入力から自動判別するか、`"\n"`／`"\r\n"` を指定します。 |
| `end_with_newline` | All | boolean | `false` | 末尾に改行を付けます。部分選択の整形ではfalseに上書きされます。 |
| `indent_char` | All | string | `" "` | インデント文字。 |
| `indent_size` | All | integer | `4` | インデント幅。 |
| `indent_with_tabs` | All | boolean | `false` | タブでインデントします。indent_charがタブなら既定値もtrueです。indent_sizeが単純に無視されるわけではありません。 |
| `preserve_newlines` | All | boolean | `true` | エンジンが許す範囲で元の改行を保持します。空白を完全に保存する指定ではありません。 |
| `max_preserve_newlines` | All | integer | `32786` | 保持する連続改行の上限。preserve_newlinesがfalseなら0になります。 |
| `wrap_line_length` | JS / HTML | integer | `0` | 改行可能な位置で折り返します。0は長さによる折り返し無効。厳密な最大文字数ではありません。 |
| `extra_liners` | HTML | string[] | `["head", "body", "/html"]` | 直前に追加の改行を入れるタグ。 |
| `indent_body_inner_html` | HTML | boolean | `true` | bodyの中身をインデントします。 |
| `indent_handlebars` | HTML | boolean | `true` | Handlebarsのブロック構文をインデントします。 |
| `indent_head_inner_html` | HTML | boolean | `true` | headの中身をインデントします。 |
| `indent_inner_html` | HTML | boolean | `false` | html内のhead／bodyをインデントします。 |
| `indent_scripts` | HTML | string | `"normal"` | スクリプトのインデント方法：`normal`、`keep`、`separate`。 |
| `inline` | HTML | string[] | `See list / 一覧参照` | インライン要素として扱うタグ。指定したリストは既定リストを置き換えます。 |
| `wrap_attributes` | HTML | string | `"auto"` | 属性改行方式：`auto`、`force`、`force-aligned`、`force-expand-multiline`、`aligned-multiple`、`preserve`、`preserve-aligned`。 |
| `wrap_attributes_indent_size` | HTML | integer | `indent_size` | 改行した属性のインデント幅。真偽値ではなく数値です。 |
| `unformatted` | HTML | string[] | `[]` | マークアップを再整形しないタグ。 |
| `content_unformatted` | HTML | string[] | `["pre", "textarea"]` | 中身を再整形しないタグ。 |
| `void_elements` | HTML | string[] | `See list / 一覧参照` | 終了タグを持たない単独タグとして扱う要素。指定リストは既定リストを置き換えます。 |
| `newline_between_rules` | CSS | boolean | `true` | ルール間に空行を入れます。 |
| `selector_separator_newline` | CSS | boolean | `true` | カンマ区切りのセレクターを別行にします。 |
| `space_around_combinator` | CSS | boolean | `false` | >、+、~などの結合子の前後に空白を入れます。 |
| `brace_style` | JS / CSS | string | `"collapse"` | JSは `collapse`、`expand`、`end-expand`、`none`。必要なら `,preserve-inline` を追加します。CSSの実装はcollapse／expandのみです。 |
| `break_chained_methods` | JS | boolean | `false` | メソッドチェーンを改行します。 |
| `comma_first` | JS | boolean | `false` | 継続行の先頭側にカンマを配置します。 |
| `e4x` | JS | boolean | `false` | E4XのXMLリテラルを保持します。完全なJSX整形ではありません。本拡張のReact保護経路ではfalseに固定します。 |
| `indent_level` | JS | integer | `0` | JavaScriptの初期インデント段数。 |
| `jslint_happy` | JS | boolean | `false` | JSLint寄りの空白設定。space_after_anon_functionをtrueにします。 |
| `keep_array_indentation` | JS | boolean | `false` | 元の配列インデントを保持します。配列を必ず複数行に展開する指定ではありません。 |
| `keep_function_indentation` | JS | legacy | `Unsupported / 非対応` | 旧拡張の一覧にありますが、js-beautify 2.0.3では読み取られません。効果を期待しないでください。 |
| `operator_position` | JS | string | `"before-newline"` | 演算子位置：`before-newline`、`after-newline`、`preserve-newline`。 |
| `space_after_anon_function` | JS | boolean | `false` | 無名関数の括弧の前に空白を入れます：`function ()`。 |
| `space_after_named_function` | JS | boolean | `false` | 名前付き関数の括弧の前に空白を入れます：`function example ()`。 |
| `space_before_conditional` | JS | boolean | `true` | 条件文の括弧の前に空白を入れます。 |
| `space_in_empty_paren` | JS | boolean | `false` | 空の括弧内に空白を入れます：`f( )`。 |
| `space_in_paren` | JS | boolean | `false` | 中身がある括弧内に空白を入れます：`f( a, b )`。 |
| `unescape_strings` | JS | boolean | `false` | 文字列内の印字可能な16進エスケープを展開します。文字列表記の変更を確認してください。 |
| `unindent_chained_methods` | JS | boolean | `false` | メソッドチェーンの追加インデントを抑えます。 |
| `disabled` | All | boolean | `false` | 入力を整形せず返します。 |
| `indent_empty_lines` | All | boolean | `false` | 対応する整形箇所で空行にもインデントを付けます。 |
| `templating` | All | string[] | `["auto"]` | テンプレート処理：auto、none、angular、django、erb、handlebars、php、smarty。HTMLのautoはdjango／erb／handlebars／phpに展開されます。 |
| `wrap_attributes_min_attrs` | HTML | integer | `2` | 対応する強制改行モードで使用する最小属性数。 |
| `inline_custom_elements` | HTML | boolean | `true` | カスタム要素をインラインとして扱います。 |
| `unformatted_content_delimiter` | HTML | string | `""` | 未整形テキスト領域の区切り文字。 |

## HTMLの既定タグ一覧

### `inline`

```json
["a", "abbr", "area", "audio", "b", "bdi", "bdo", "br", "button", "canvas", "cite", "code", "data", "datalist", "del", "dfn", "em", "embed", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "map", "mark", "math", "meter", "noscript", "object", "output", "progress", "q", "ruby", "s", "samp", "select", "small", "span", "strong", "sub", "sup", "svg", "template", "textarea", "time", "u", "var", "video", "wbr", "text", "acronym", "big", "strike", "tt"]
```

### `void_elements`

```json
["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr", "!doctype", "?xml", "basefont", "isindex"]
```


## 旧資料から変更・修正した点

- `eol` の既定値はLF固定ではなく `"auto"` です。
- `max_preserve_newlines` は10ではなく32786です。
- `indent_handlebars` とCSSの `newline_between_rules` は既定値trueです。
- `wrap_attributes_indent_size` は真偽値ではなく整数で、未指定時は `indent_size` を使います。
- 属性整形方式の正しい値は `align-multiple` ではなく `aligned-multiple` です。
- `keep_function_indentation` はこのエンジンのバージョンでは未実装です。
- inline／voidの既定リストも旧版と異なります。CSSもcollapse／expandの波括弧スタイルに対応します。

## 埋め込みJSON・Reactの注意点

HTML内の `application/json` の中身はJavaScriptエンジンで整形します。括弧の結合と既存改行の保持が混在するため、同じ配列でも1行入力と複数行入力でレイアウトが変わる場合があります。`keep_array_indentation` はJSONを一定のレイアウトに統一する設定ではありません。

本拡張はHTMLの設定選択時に最上位のjs／cssブロックを除去するため、最上位の `js` 指定は埋め込みスクリプトに自動では適用されません。例えば、確認済みのHTML内JSON配列の例で、既存改行への依存を減らすには次を使います。

```json
{
  "indent_size": 2,
  "html": {
    "preserve_newlines": false
  }
}
```

他のHTMLや埋め込みスクリプトにも影響し、JSONの括弧を必ず別行にする指定ではありません。JSX／TSXの要素・フラグメントは拡張の保護処理でそのまま保持し、内部を整形しません。構文解析失敗や構文の変化がある場合は元の入力を保持します。完全なTypeScript／JSX整形対応ではありません。

## 参考資料・著作権

MITライセンスの元資料 [Settings.md](https://github.com/HookyQR/VSCodeBeautify/blob/master/Settings.md)（Copyright (c) 2016 HookyQR）を参考にしています。[LICENSE](LICENSE)を参照してください。定義・既定値はインストール済みjs-beautify 2.0.3のcore・JavaScript・HTML・CSSオプション実装、および本拡張の `src/options.js` と照合しました。上流の説明は [js-beautify](https://github.com/beautifier/js-beautify) を参照してください。エンジン・VS Codeのバージョンで動作が変わる場合があります。
