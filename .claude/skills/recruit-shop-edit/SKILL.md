---
name: recruit-shop-edit
description: >
  スポーツマリオ採用サイト（C:\recruit-mock）の店舗情報や募集ポジションを編集・追加・削除・非表示化するスキル。
  「店舗情報を変更」「時給変更」「店舗追加」「募集停止」「店舗写真差替え」「営業時間変更」「店舗名変更」
  「住所変更」「新店舗オープン」「◯◯店の募集を締め切る」「募集再開」など、採用サイトの店舗関連の編集依頼が来た場合は
  必ずこのスキルを使う。data/shops.json を編集し、ビルドスクリプトでHTMLを再生成し、CodeCommitとGitHubにpushする。
---

# 店舗情報編集スキル（recruit-shop-edit）

スポーツマリオ採用サイト（`https://recruit.sportsmario.co.jp`）の店舗情報を編集する手順を定義したスキル。
複数の採用担当者が誰でも同じ品質で店舗情報を変更できることを目的とする。

## 前提

- 作業ディレクトリ: `C:\recruit-mock`
- **Gitリモート（2つ運用）**:
  - `codecommit` = AWS CodeCommit（本番デプロイ元・必須）
  - `origin` = GitHub（バックアップ）
- **ホスティング**: AWS Amplify Hosting（CodeCommit連携で自動デプロイ、約2〜5分）
- 店舗情報の一元管理ファイル: `data/shops.json`
- スキーマ定義: `data/shops.schema.md`
- ビルドスクリプト: `scripts/build-shops.js`
- 店舗外ポジション（EC事業部・本部等）: `data/shops.json` の `nonStorePositions` 配列

## 作業フロー（基本・必ずこの順で実行）

1. **最新状態を取得**: `git pull codecommit main`（複数人運用のため必須）
2. **`data/shops.json` を読み込む**
3. **編集内容を shops.json に反映**
4. **JSONの妥当性チェック**: `node -e "JSON.parse(require('fs').readFileSync('data/shops.json','utf8'))"`
5. **ビルドを実行**: `node scripts/build-shops.js`
6. **生成結果を目視確認**: `shops/` 配下のHTMLが正しく更新されたか
7. **コミット**: 具体的な変更内容を日本語で記述
8. **デプロイ**: **`npm run deploy`** を実行（= `git push codecommit main && git push origin main`）。codecommit=本番反映（Amplify自動デプロイ）、origin=GitHubバックアップ。**この1コマンドで両方pushされる**
9. **報告**: 変更内容と本番反映予定時刻（約2〜5分後）をユーザーに伝える

## 依頼パターン別の対応

### パターンA: 店舗情報の更新（時給・住所・営業時間等）

例: 「下北沢店の時給を1300円に変更」

1. `shops.json` で該当店舗（`id` または `name` で特定）を探す
2. 該当フィールドを更新
   - 時給: `jobs[].salary.min` および必要なら `max`
   - 住所: `address`
   - 営業時間: `businessHours`
   - 電話: `phone`
3. `meta.lastUpdated` を今日の日付に更新
4. 標準フロー 4〜10 を実行

### パターンB: 新店舗追加

例: 「新宿に新店舗を追加」

1. 必須フィールドをユーザーから収集（不足があれば質問）:
   - 店舗名 / 業態（standon/run-fitness/baseball-mario/sportsmario）
   - 住所 / アクセス
   - 営業時間
   - 店舗説明（2〜3文）
   - 魅力ポイント（3〜5個）
   - 募集職種と給与
2. `id` を決定（英数字ハイフン、例: `shinjuku-new`）
3. `shops.json` の `shops` 配列末尾に追加
4. 画像は初期値 `images/placeholder.jpg` を使用（後で差し替え）
5. 標準フロー 4〜10 を実行

### パターンC: 募集停止・再開

例: 「◯◯店の募集を締め切る」「○○店の募集を再開する」

1. 該当店舗・該当ジョブ（parttime 等）の `recruiting` フラグを変更
   - 停止: `recruiting: false` → 一覧で「現在募集休止中」バッジ＋グレーアウト
   - 再開: `recruiting: true` → 通常表示に戻る
   - ⚠️ **`shops` 配列から削除しない**（停止状態でも残す）
2. 標準フロー 4〜10 を実行

### パターンD: 店舗の完全削除

例: 「◯◯店を完全に削除して」

1. ユーザーに**本当に削除してよいか確認**（削除後は復元不可）
2. 確認が取れたら `shops` 配列から該当店舗を削除
3. 旧URLへの301リダイレクトが必要な場合は別途相談
4. 標準フロー 4〜10 を実行

### パターンE: 店舗写真の差し替え

例: 「下北沢店の写真を新しいものに」

1. 新しい画像ファイルを `images/shops/<id>.jpg` に配置
   - ユーザーに画像ファイルの場所を聞く
   - Bashで `cp` してコピー
2. `shops.json` の対応 `image` パスを確認・更新
3. 標準フロー 4〜10 を実行
4. 推奨画像サイズ: 1600×900px、形式: JPG（容量200KB以下目安）
5. 圧縮が必要なら `npx sharp-cli --quality 80 --width 1600` でリサイズ

### パターンF: 業態変更・店舗名変更

例: 「STAND ON 下北沢店を別業態に変更」

1. `name` を変更
2. 業態変更を伴う場合は `brand` も更新
3. ⚠️ **`id` は変更しない**（URLが変わりリンク切れする）
4. 標準フロー 4〜10 を実行

### パターンG: 店舗外ポジション（EC事業部・本部等）の追加/停止

例: 「EC顧客対応の募集を再開」「本部経理の募集枠を追加」

1. `shops.json` の `nonStorePositions` 配列を編集
2. 募集再開: `recruiting: true`
3. 募集停止: `recruiting: false`
4. 新規追加: 既存項目を参考に同じ構造で追加
5. 標準フロー 4〜10 を実行

## データ構造の要点

`data/shops.schema.md` に詳細があるが、重要なポイント:

- 給与の型: `monthly`（月給）/ `hourly`（時給）
- 雇用区分: `fulltime`（正社員）/ `parttime`（アルバイト・パート）
- 業態: `standon` / `run-fitness` / `baseball-mario` / `sportsmario`
- 金額は**円単位の数値**（例: 1200, 220000）
- appeal、benefits、requirements は**文字列の配列**
- `recruiting`: true/false（募集中フラグ、後付けで追加された重要フィールド）

## コミットメッセージ規約

以下のプレフィックスを使う:

- `feat:` 新店舗追加・新機能
- `update:` 既存店舗の情報更新
- `fix:` 誤記・バグ修正
- `remove:` 店舗削除
- `chore:` 設定ファイル等の更新

例:
```
update: 下北沢店の時給を1300円に変更
feat: 新宿店を追加（STAND ON、3職種募集）
fix: 錦糸町店の電話番号誤記を修正
update: 草加店の募集を一時停止（recruiting: false）
```

コミット末尾に以下を含める:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 注意事項・安全ルール

1. **必ず `git pull codecommit main` してから作業開始**（複数人運用のため）
2. **JSONの構文エラーは即座にビルド失敗**するので、カンマ・クォート・ブラケットに注意
3. **`id` の変更は絶対にしない**（URLが変わる）
4. **削除は慎重に**: 一度削除すると Git history からは復元できるが、運用上は復旧が面倒
5. **画像ファイルは事前に `images/shops/` に配置**してからパスを記述
6. **ビルド失敗時はコミット・プッシュしない**（Amplifyが失敗デプロイを検知する）
7. **機密情報（社外秘の数値等）を shops.json に書かない**（GitHubはpublic）
8. **pushは `npm run deploy` を使う**（codecommit=本番 と origin=バックアップ の両方に一括push）。個別にやる場合も **`git push origin main` 単独で終わらせない**（本番はcodecommit経由のみ）

## トラブルシューティング

### JSONパースエラー
```
❌ shops.json の JSON パースに失敗しました
```
→ カンマの付け忘れ・余分、クォート不整合、ブラケット不一致を確認。
→ `node -e "JSON.parse(require('fs').readFileSync('data/shops.json','utf8'))"` でチェック。

### ビルドは成功したが Amplify で表示されない
→ AWS Amplify Console でビルドログを確認:
   https://console.aws.amazon.com/amplify/
→ 通常 2〜5分でデプロイ完了

### 画像が表示されない
→ 画像パスは `images/shops/` からの相対パスで記述。
→ ファイル名の大小文字に注意（Amplifyは大文字小文字を区別する）

### CodeCommitへのpushが失敗（認証エラー）
→ AWS の IAM 認証情報を確認:
   - Windows 資格情報マネージャー → Git の HTTPS 認証情報
   - または `git config --global credential.helper` を確認

## 関連ファイル

- `data/shops.json` — 店舗データ（編集対象）
- `data/shops.schema.md` — スキーマ詳細
- `scripts/build-shops.js` — HTML生成スクリプト
- `scripts/build-sitemap.js` — sitemap.xml 生成
- `amplify.yml` — AWS Amplifyビルド設定
- `package.json` — npm scripts（`npm run build` で実行可）

## 完了時の報告フォーマット

作業完了時は以下のように報告する:

```
✅ 店舗情報を更新しました

- 変更内容: 下北沢店の時給を 1200円 → 1300円 に変更
- 変更ファイル: data/shops.json
- コミット: update: 下北沢店の時給を1300円に変更 (abc1234)
- 本番反映: 約2〜5分後
- 確認URL: https://recruit.sportsmario.co.jp/shops/shimokitazawa.html
```
