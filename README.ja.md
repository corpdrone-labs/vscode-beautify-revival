# Beautify Revival

[English](README.md) | 日本語

[HookyQR/VSCodeBeautify](https://github.com/HookyQR/VSCodeBeautify) を基にした、非公式の復刻版VS Code拡張機能です。整形エンジンには [`js-beautify`](https://github.com/beautifier/js-beautify) を使用しています。独立したプロジェクトであり、元プロジェクトの公式リリースや公認の後継版ではありません。

## AIによる開発（バイブコーディング）について

この復刻版は、Hermes Agentを利用した、AI支援による**バイブコーディング**で開発しました。プロジェクトオーナーが自然言語で開発方針や変更内容を指示し、AIが実装・テスト・不具合修正・ドキュメント作成を支援しています。

自動テストとVS Code Extension Hostでの動作確認を実施していますが、AIの利用やテストの成功は、正確性や完全な互換性を保証するものではありません。重要なコードでは、保存・コミット前に整形結果の差分を確認してください。再現可能な問題は、このリポジトリのIssuesへ報告してください。

この説明は本復刻版の開発についてのものであり、元プロジェクトがAIで開発されたことを意味しません。元プロジェクトの著作者・ライセンスは変わりません。

## インストール・設定

公開者：**CorpDrone Labs**（`corpdrone-labs`）。拡張ID：`corpdrone-labs.vscode-beautify-revival`。

バージョン0.1.2は、この再作成したリポジトリの開始時点のスナップショットです。[GitHub Releases](https://github.com/corpdrone-labs/vscode-beautify-revival/releases/tag/v0.1.2)からVSIXを入手してください。Marketplaceへの公開は別の手順です。VS Codeで **Extensions: Install from VSIX...** を実行して `vscode-beautify-revival-0.1.2.vsix` を選ぶか、VSIXのあるフォルダから次を実行してください。

```bash
code --install-extension ./vscode-beautify-revival-0.1.2.vsix
```

別途開発用ビルドをインストールしている場合は、先に無効化またはアンインストールしてください。公開者の異なるビルドは別拡張のため、自動的には置き換わりません。元の `HookyQR.beautify` も入っている場合は、コマンド・設定の重複やフォーマッターの競合を避けるため無効化してください。切り替え後は **Developer: Reload Window** を実行します。

対応ファイルを開き、**Beautify Revival: Beautify File** または **Beautify Revival: Beautify Selection** を実行します。標準の整形機能を使う場合は **Format Document With... → Configure Default Formatter... → Beautify Revival** を選択します。例えばJavaScriptの保存時整形は、次のように設定できます。

```jsonc
{
  "[javascript]": {
    "editor.defaultFormatter": "corpdrone-labs.vscode-beautify-revival",
    "editor.formatOnSave": true
  }
}
```

他の対応言語の設定にも同じ拡張IDを指定できます。別ビルドのIDを指定した既定フォーマッター設定があれば更新してください。本拡張は `beautify.*` と `.jsbeautifyrc` の設定に対応しています。

## 主な機能

- `js-beautify` 2.xによるJavaScript、TypeScript、JSON／JSONC、CSS／SCSS／Less、HTMLの整形。
- 元拡張に近い操作のコマンドを提供。
  - `Beautify Revival: Beautify Selection`
  - `Beautify Revival: Beautify File`
- VS Codeのドキュメント／範囲整形プロバイダーを登録し、`Format Document`、`Format Selection`、`editor.formatOnSave`に対応。
- 対象ファイルからワークスペースルートまでの階層にある`.jsbeautifyrc`を参照。
- 元拡張との設定互換のため、`beautify.config`、`beautify.language`、`beautify.ignore`をサポート。
- `.jsbeautifyrc`による上書きがない場合、対応する`.editorconfig`の設定を反映。

## JSX／TSXの保護と制限

JavaScript ReactおよびTypeScript Reactのドキュメントでは、JSX要素・フラグメントを、テキスト・空白・埋め込み式を含めてそのまま保持し、周囲のコードだけを整形します。構文解析に失敗した場合や、整形前後で解析された構文が変わる場合は、入力を変更しません。そのため、不完全な選択範囲などは整形されない場合があります。完全なJSX／TypeScriptフォーマッターではありません。

選択範囲は行全体へ拡張し、重なった範囲は統合します。選択範囲がない場合、**Beautify Selection**はファイル全体を整形し、`end_with_newline`を反映します。

`beautify.ignore`は、VS Codeのドキュメント整形と範囲整形の両方に適用されます。一方、明示的に実行する**Beautify File**と**Beautify Selection**コマンドは、意図的に除外設定を無視します。

## 設定の優先順位

1. 対象ファイルからワークスペースルートまでの間にある、最も近い`.jsbeautifyrc`。
2. `beautify.config`に指定した設定オブジェクトまたは設定ファイルのパス。
3. ワークスペースルートより上の階層にある`.jsbeautifyrc`。
4. `~/.jsbeautifyrc`。
5. VS Codeのeditor／html／javascript設定と`.editorconfig`。

フォーマッター別の設定ブロックも使用できます。

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

## 言語の割り当て

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

## 開発

```bash
npm install
npm test
npm run test:integration # VS Codeのcode CLIが必要です。独立したテスト用ウィンドウを起動します。
npm run package
```

## 謝辞・元プロジェクトについて

本拡張は、HookyQRによって作成された[HookyQR/VSCodeBeautify](https://github.com/HookyQR/VSCodeBeautify)の実装・動作を基にしています。HookyQRおよび元プロジェクトの貢献者の皆様に感謝します。本プロジェクトの一部は、そのMITライセンスの実装に由来します。元の著作権表示とライセンス条項は[LICENSE](LICENSE)に保持しています。

整形エンジンには[js-beautify](https://github.com/beautifier/js-beautify)を使用しています。著作者・メンテナー・貢献者の皆様に感謝します。同梱する依存ライブラリは、それぞれの著作権表示とライセンスファイルを保持します。本プロジェクトのライセンスが、それらの表示を置き換えるものではありません。

本復刻版では、現行のVS Codeの起動イベントと新しいテスト環境を使用しています。独立して保守されるものであり、HookyQRやjs-beautifyのメンテナーとの提携・公認を意味するものではありません。

## ライセンス

[MIT](LICENSE)。正式なライセンス条項は、英語のLICENSEファイルを参照してください。

- 元のVSCodeBeautifyのコード：Copyright (c) 2016 HookyQR.
- 復刻版への貢献：Copyright (c) 2026 Beautify Revival contributors.
