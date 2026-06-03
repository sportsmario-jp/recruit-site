# 旧採用サイトから新採用サイトへの301リダイレクト 設置手順

## 前提条件
- 新採用サイト（recruit.sportsmario.co.jp / AWS Amplify）が稼働中であること
- SSL証明書が有効化済みであること
- XServerファイルマネージャーまたはFTP/SSH接続できること

## 概要

旧採用サイト（`sportsmario.co.jp/recruit/` 配下、WordPress）へのアクセスを、新採用サイト（`recruit.sportsmario.co.jp/`）の該当ページへ301リダイレクトする。

- 設定ファイル: `/recruit/.htaccess`（Apacheのmod_rewriteを使用）
- リダイレクトルール: `docs/htaccess-redirect.txt` 参照

## 設置手順

### ステップ1: 現在の .htaccess をバックアップ

XServerファイルマネージャーで `/sportsmario.co.jp/public_html/recruit/.htaccess` を開き、内容をローカルに保存（バックアップ）する。

ファイル名: `htaccess-backup-2026-05-XX.txt`

### ステップ2: リダイレクトルールを既存 .htaccess の冒頭に追加

`docs/htaccess-redirect.txt` の中身をコピーし、既存 `.htaccess` の **最上部**（`# BEGIN WordPress` ブロックよりも前）に貼り付ける。

完成形は以下のような構成:

```apache
# === 新採用サイトへのリダイレクト（ここから追記） ===
RewriteEngine On
RewriteBase /recruit/

RewriteRule ^177/?$  https://recruit.sportsmario.co.jp/shops/kinshicho.html [R=301,L]
... (省略)
# === ここまで追記 ===

# BEGIN WordPress
... (既存のWordPress設定はそのまま残す)
# END WordPress
```

### ステップ3: 動作確認

ブラウザのシークレットウィンドウで以下URLにアクセスし、新サイトへリダイレクトされることを確認。

| 旧URL | 期待される新URL |
|---|---|
| https://sportsmario.co.jp/recruit/ | https://recruit.sportsmario.co.jp/ |
| https://sportsmario.co.jp/recruit/177/ | https://recruit.sportsmario.co.jp/shops/kinshicho.html |
| https://sportsmario.co.jp/recruit/902/ | https://recruit.sportsmario.co.jp/shops/shonan-gate.html |
| https://sportsmario.co.jp/recruit/entry2026graduate/ | https://recruit.sportsmario.co.jp/graduate.html |
| https://sportsmario.co.jp/recruit/business/ | https://recruit.sportsmario.co.jp/shops/ |
| https://sportsmario.co.jp/recruit/career/ | https://recruit.sportsmario.co.jp/#entry |
| https://sportsmario.co.jp/recruit/foo/ | https://recruit.sportsmario.co.jp/ |

curlコマンドでも確認可:
```bash
curl -sI https://sportsmario.co.jp/recruit/177/ | head -3
# 期待: HTTP/2 301
# 期待: location: https://recruit.sportsmario.co.jp/shops/kinshicho.html
```

### ステップ4: 旧サイトのWP領域削除（数週間後）

リダイレクトが安定し、Google Search Consoleで旧URLが新URLに置き換わったことを確認したら、`/recruit/` 配下のWordPressテーマファイルを物理削除する。

`.htaccess` のリダイレクトルールはそのまま残しておく（万一の旧URL流入対策）。

## トラブルシューティング

### 「無限リダイレクト」になる
- `.htaccess` が二重に読み込まれていないか確認
- 旧サイトと新サイトで同じドメイン下にあると起こる場合があるが、今回はサブドメインで分離されているため通常は発生しない

### 一部のURLでリダイレクトが効かない
- `.htaccess` の評価順序を確認（個別ルール → カテゴリ → フォールバックの順）
- `RewriteRule` の正規表現と`/`末尾の組み合わせを確認

### 画像やCSSが404になる
- 旧サイトテーマの画像（`/recruit/wp-recruit/...` 配下）はフォールバックルールで除外している
- もし新サイトから旧画像を参照している箇所があれば、新サイトに画像を移行するか参照を削除する

## ロールバック手順

問題が発生した場合:
1. ステップ1のバックアップファイル `htaccess-backup-2026-05-XX.txt` の内容で `/recruit/.htaccess` を上書き
2. 即座に旧サイトが元通り表示される
