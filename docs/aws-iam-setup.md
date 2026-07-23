# AWS IAM ユーザー作成手順（管理者向け）

新メンバーがCodeCommitリポジトリにアクセスできるようにするため、
管理者（桐原さん）が AWS で IAM ユーザーを作成する手順です。

## 所要時間
1人あたり 約10分

## 前提
- AWSコンソールへのログイン権限（オーナーまたはIAM管理権限）
- AWS リージョン: ap-northeast-1（東京）

---

## ステップ1: IAMユーザーを作成

### 1-1. AWS IAM コンソールを開く
https://console.aws.amazon.com/iam/

### 1-2. 「ユーザー」→「ユーザーの作成」

### 1-3. ユーザー名を入力
推奨フォーマット: `recruit-staff-<苗字ローマ字>`  
例: `recruit-staff-yamada`、`recruit-staff-sato`

「次へ」をクリック

### 1-4. 権限の設定

**「ポリシーを直接アタッチする」** を選択。

検索ボックスに `CodeCommit` と入力 → 以下にチェック:
- ✅ `AWSCodeCommitPowerUser`
   （リポジトリの読み書きができるがリポジトリ自体の削除はできない権限）

「次へ」→ 「ユーザーの作成」

---

## ステップ2: HTTPS Git認証情報を発行

新メンバーがHTTPSでcloneできるようにします（SSHキー不要、簡単）。

### 2-1. 作成したユーザーをクリック

### 2-2. 「セキュリティ認証情報」タブ

### 2-3. 「AWS CodeCommit の HTTPS Git認証情報」セクションへスクロール

「**認証情報を生成**」をクリック

### 2-4. 表示される認証情報をメモ

以下が表示されます（**この画面でしか表示されないので必ずコピー**）:
- ユーザー名: `recruit-staff-yamada-at-XXXXXXXX`
- パスワード: `XXXXXXXXXXXXXX==`

「**認証情報をダウンロード**」をクリックして CSV保存もしておく（バックアップ）。

---

## ステップ3: 新メンバーに認証情報を渡す

**安全な経路で**渡してください:
- ✅ 1Password 等のパスワード共有ツール
- ✅ 対面（メモ書き）
- ✅ Slack DM の暗号化送信機能
- ❌ 平文メール（推奨しない）
- ❌ チャットの公開チャンネル（絶対NG）

渡す情報:
1. AWS IAM ユーザー名（参考用、メモ等で残す）
2. **HTTPS Git認証情報**:
   - ユーザー名（`recruit-staff-yamada-at-XXXXXXXX`）
   - パスワード
3. このドキュメント `docs/ONBOARDING.md` の URL またはコピー

---

## ステップ4: 新メンバーの初回push確認

新メンバーが `docs/ONBOARDING.md` に沿ってセットアップし、テスト編集→pushを実行できれば成功。

確認方法:
1. AWS CodeCommit コンソール: https://console.aws.amazon.com/codesuite/codecommit/repositories
2. リポジトリ `recruit-site` を開く
3. 「コミット」タブで最新のコミット作者を確認
4. 新メンバーの名前/メールが表示されていればOK

---

## 退職・離任時の対応

### 即座に実施
1. IAM コンソール → 対象ユーザー → 「セキュリティ認証情報」タブ
2. 「AWS CodeCommit の HTTPS Git認証情報」を **「アクティブ」→「非アクティブ」** に変更
3. または「**ユーザーの削除**」で完全削除

これで対象ユーザーは即座にCodeCommitにpushできなくなります。

---

## トラブルシューティング

### 新メンバーが「authentication failed」と言ってきた
- 認証情報のコピペミスがないか確認（特に末尾の `=` 記号）
- HTTPS Git認証情報が「アクティブ」になっているか確認
- 資格情報マネージャーへの登録ホストが `git-codecommit.ap-northeast-1.amazonaws.com` になっているか

### CodeCommit の追加権限を与えたい場合
通常の運用には `AWSCodeCommitPowerUser` で十分ですが、もし以下が必要なら:
- リポジトリ作成権限: `AWSCodeCommitFullAccess`
- 読み取り専用にしたい: `AWSCodeCommitReadOnly`

---

## 既存メンバー一覧（参考）

| 担当 | IAMユーザー名 | 発行日 |
|---|---|---|
| 桐原 裕輔（管理者） | `Cline_IAM` / `kirihara` | 2025-02-07 |
| 北島 | `recruit-staff-kitajima` | 2026-06-09 |
| 渡木 | `recruit-staff-wataki` | 2026-06-09 |
| 神山 | `recruit-staff-kamiyama` | 2026-06-09 |

---

## 関連コスト

- **IAM ユーザー作成**: 無料
- **CodeCommit リポジトリ**: アクティブユーザー5名まで無料、それ以上は $1/月/人
- **データ転送**: 通常運用では月 1GB 以下なので実質無料
