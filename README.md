# vscode-grep-encoding-search

VS Code標準の検索はUTF-8のみですが、この拡張機能では**任意の1つの文字コードを指定**してサイドバーの検索機能からGrep検索が可能です。
**コマンドパレットで文字コードを設定し、サイドバー検索でその文字コードが自動的に使われます。**

---

## 特長

* サイドバーの検索UIそのままで、指定した文字コードで検索が可能
* Shift\_JISやEUC-JPなど日本語のレガシー文字コードもサポート
* コマンドパレットで文字コード設定 → 以降はその文字コードで検索

---

## インストール

1. このリポジトリをクローン、またはVSCode拡張機能としてインストール
2. VSCodeを再起動

```sh
git clone https://github.com/yourusername/vscode-grep-encoding-search.git
cd vscode-grep-encoding-search
npm install
npm run build
```

---

## 使い方

### 1. 文字コードを設定

* コマンドパレット（`Ctrl+Shift+P`）で
  `Grep: Set Search Encoding`
  を実行
* 文字コード（例: `Shift_JIS`, `EUC-JP`, `UTF-8` など）を入力

### 2. サイドバーの検索で通常通り検索

* サイドバー（Ctrl+Shift+F）から検索
* 指定した文字コードで全ファイルを読み込んで検索します

---

## 設定例

VS Codeの `settings.json` でデフォルト文字コードを指定できます。

```json
"grepEncodingSearch.defaultEncoding": "Shift_JIS"
```

---

## サポートしている文字コード

* UTF-8
* Shift\_JIS
* EUC-JP
* ISO-2022-JP
* ほか [iconv-lite](https://github.com/ashtuchkin/iconv-lite) の対応エンコーディング

---

## 注意事項

* 一度に指定できる文字コードは1つのみです（再度コマンドパレットで変更可能）
* 検索対象ファイルが指定文字コード以外の場合は正常に検索できません
* 検索対象が多い場合、検索速度が遅くなる場合があります
* バイナリファイル等は除外してください

---

## コントリビュート

バグ報告や機能要望、プルリク歓迎です！
[GitHub Issue](https://github.com/yourusername/vscode-grep-encoding-search/issues) からどうぞ。

---

## ライセンス

MIT License

---

## 開発メモ

* Node.js + TypeScript
* `iconv-lite`でファイルエンコーディングを変換
* サイドバー検索コマンドをフックして実装
