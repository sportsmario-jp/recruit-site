# 採用サイト運用 - 新メンバー オンボーディングガイド

このガイドに沿って進めれば、Git未経験でも**1〜2時間で運用に参加**できます。
対象: Windows PC を使う採用担当者向け。

---

## ゴール

このガイド完了時、あなたは:
- 自分のPCから採用サイトを編集できる
- Claude に日本語で指示するだけで、店舗情報・文言を変更できる
- 変更が本番（recruit.sportsmario.co.jp）に自動反映されることを確認できる

---

## ステップ0: 桐原さんから受け取るもの

事前に**桐原さんから以下を受け取ってください**:

1. **AWS IAM 認証情報**（CodeCommit接続用）
   - ユーザー名（例: `recruit-staff-yamada`）
   - HTTPS Git認証情報 - ユーザー名 / パスワード
2. **Anthropic（Claude）API キー** または会社のClaude Code発行情報

これらが揃ったら次に進んでください。

---

## ステップ1: 必要なソフトウェアをインストール（30分程度）

### 1-1. Node.js
- ダウンロード: https://nodejs.org/ja/download/
- **LTS版**（左側の緑のボタン）をダウンロード
- インストーラーを実行（全て初期設定でOK）
- 確認: PowerShellを開いて `node -v` で `v20.x.x` 等が出ればOK

### 1-2. Git for Windows
- ダウンロード: https://git-scm.com/download/win
- **64-bit Git for Windows Setup** をクリック
- インストーラーを実行。以下のページだけ要確認:
  - 「Default editor」→ **VSCode** を選択（推奨）
  - 他は全て初期設定でOK
- 確認: PowerShellで `git --version` で `git version 2.x.x` が出ればOK

### 1-3. VSCode（任意だが推奨）
- ダウンロード: https://code.visualstudio.com/
- インストーラー実行、初期設定でOK

### 1-4. Claude Code
- 会社の Claude Code 配布方法に従ってインストール
- インストール後、PowerShellで `claude --version` が出ればOK

### 1-5. AWS CLI（任意）
- ダウンロード: https://aws.amazon.com/jp/cli/
- 通常の操作には不要ですが、トラブル時に便利

---

## ステップ2: 初期設定（15分程度）

### 2-1. Git の名前とメール設定

PowerShell で（**あなたの名前とメールに変更**）:

```powershell
git config --global user.name "Yamada Taro"
git config --global user.email "yamada@sports-mario.jp"
```

### 2-2. CodeCommit 認証情報の設定

Windowsの**資格情報マネージャー**で AWS の HTTPS Git 認証情報を登録します:

1. スタートメニューから「**資格情報マネージャー**」を起動
2. 「**Windows 資格情報**」をクリック
3. 「**汎用資格情報の追加**」をクリック
4. 以下を入力:
   - インターネットまたはネットワークのアドレス: `git-codecommit.ap-northeast-1.amazonaws.com`
   - ユーザー名: 桐原さんから受け取った AWS ユーザー名
   - パスワード: 桐原さんから受け取った AWS パスワード
5. 「OK」で保存

---

## ステップ3: リポジトリを取得（10分程度）

### 3-1. 作業フォルダを作る

PowerShell で:

```powershell
cd C:\
git clone https://git-codecommit.ap-northeast-1.amazonaws.com/v1/repos/recruit-site recruit-mock
cd recruit-mock
```

→ 初回はファイルダウンロードが走ります（1〜2分）

### 3-2. GitHub のリモートも追加（バックアップ用）

```powershell
git remote add origin https://github.com/sportsmario-jp/recruit-site.git
```

### 3-3. 動作確認

```powershell
git remote -v
```

→ `codecommit` と `origin` の2つが表示されればOK

### 3-4. 依存パッケージのインストール

```powershell
cd C:\recruit-mock
npm install
```

→ 1〜2分待つ

---

## ステップ4: Claude Code で初回作業（15分程度）

### 4-1. Claude Code を起動

```powershell
cd C:\recruit-mock
claude
```

→ Claude Code のプロンプトが起動

### 4-2. 動作確認の指示を投げる

Claude にこう打ってみてください:

```
このプロジェクトの概要を教えて
```

→ CLAUDE.md を読んで、プロジェクトの説明をしてくれます

### 4-3. 軽い編集を試す（ダミーで戻すだけ）

```
README.md に「テスト編集」の行を追加して、すぐ削除して。push までしないで。
```

→ Claude がファイル編集して見せてくれます

---

## ステップ5: 本物の編集を試す

「店舗の時給を変更する」「募集停止する」などの**実作業**を Claude に頼んでみてください。

具体的なプロンプト例は **`docs/COMMON_TASKS.md`** に集めてあります。

---

## トラブルシューティング

### `git clone` で「authentication failed」
→ ステップ2-2の資格情報マネージャー設定を見直してください。  
　 ユーザー名/パスワードが間違っているか、ホスト名が違う可能性。

### `npm install` でエラー
→ Node.js のバージョンを確認: `node -v` で `v18` 以上である必要あり。  
　 v16以下の場合は LTS版を再インストール。

### Claude Code で「コマンドが見つかりません」
→ Claude Code を再インストールするか、PATH を確認。  
　 PowerShell を再起動するだけで直ることも。

### `git push codecommit main` で失敗
→ 認証情報マネージャーの設定を確認。  
　 または `git pull codecommit main --rebase` で最新を取り込んでから再push。

### 「conflict」エラー
→ 他のメンバーが先にpushしていた可能性。Claude に  
　 「他のメンバーの変更を取り込んで、私の変更も含めてpushして」と頼めば自動対応します。

---

## 困った時の連絡先

- まず Claude に「こんなエラーが出た」と相談（だいたい解決します）
- 解決しない場合は桐原さんに連絡

---

## チェックリスト

すべて完了したらチェック:

- [ ] Node.js インストール完了（`node -v` で確認）
- [ ] Git インストール完了（`git --version` で確認）
- [ ] Claude Code 動作確認
- [ ] Git 名前・メール設定
- [ ] AWS 認証情報を資格情報マネージャーに登録
- [ ] `C:\recruit-mock` にリポジトリをクローン
- [ ] `npm install` 完了
- [ ] Claude を起動して「このプロジェクトの概要を教えて」が動く
- [ ] `docs/COMMON_TASKS.md` を読んだ

すべて ✅ になったら**運用デビュー**です。お疲れ様でした。
