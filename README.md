# スポーツマリオ 採用サイト

SMSA（Sports Mario Staff Ambassador）を含む、スポーツマリオの採用サイトソースコードです。

- **公開URL（予定）**: https://recruit.sportsmario.co.jp
- **ホスティング**: Netlify（GitHub連携による自動デプロイ）
- **管理組織**: [sportsmario-jp](https://github.com/sportsmario-jp)

## 採用区分

- 新卒採用
- 中途採用（キャリア）
- アルバイト・パート
- SMSA（Sports Mario Staff Ambassador）

## ディレクトリ構成

```
recruit-mock/
├── index.html              # トップページ（縦長1ページ構成）
├── interview-01.html       # インタビューページ（3人分）
├── interview-02.html
├── interview-03.html
├── styles.css              # 共通スタイル
├── interview.css           # インタビューページ用スタイル
├── script.js               # 共通JavaScript
├── images/                 # 画像素材
└── start-server.bat        # ローカルプレビュー起動スクリプト
```

## ローカルで確認する方法

### 1. リポジトリをクローン（初回のみ）

```
gh repo clone sportsmario-jp/recruit-site
cd recruit-site
```

### 2. ローカルサーバー起動

```
npx http-server -p 8080
```

ブラウザで http://localhost:8080 を開く。

## 更新作業の流れ

1. Claude Code で作業（店舗情報の更新、文言修正、画像差替え等）
2. 変更内容は自動で Git にコミット・プッシュ
3. GitHub に push されると Netlify が自動で本番にデプロイ（約1〜2分）

## 担当者

- 桐原 祐輔（yusuke.kirihara@sports-mario.jp）
- 他3名（追加予定）

## 関連ドキュメント

- 素材撮影依頼書：社内共有（Googleドライブ）
- 賃金規程・ベースアップ試算：社内共有（機密）
