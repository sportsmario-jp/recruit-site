# Google Apps Script 導入手順

応募フォームのバックエンドを Google Apps Script + スプレッドシートで構築する手順です。
**Claude Code では代行できない操作（Googleアカウントでの操作）** なので、担当者が手動で行う必要があります。

所要時間: **約15分**

---

## 完成イメージ

```
[新サイトの応募フォーム]
       ↓ POST（JSON）
[Google Apps Script Web App]
       ↓
  ┌───┴───┐
  ↓         ↓
[スプレッドシート]   [Gmail通知]
 - 応募データ        - 採用担当者へ
 - 設定シート         - 応募者へ自動返信
```

---

## 事前準備

- Googleアカウント（`yusuke.kirihara@sports-mario.jp` 等の会社アカウント推奨）にログイン済みであること

---

## ステップ1: スプレッドシート作成（2分）

1. 新しいタブで https://sheets.new を開く
   - または https://drive.google.com → 新規 → Googleスプレッドシート
2. 左上の「無題のスプレッドシート」をクリックして名前を変更:
   - 推奨名: **`SMSA採用応募データ`**
3. 作成したスプレッドシートの**URLを確認**し、`/d/` と `/edit` の間の文字列をコピーしておく（これが `SHEET_ID`）
   - 例: `https://docs.google.com/spreadsheets/d/【ここをコピー】/edit#gid=0`

---

## ステップ2: Apps Script プロジェクト作成（1分）

1. スプレッドシートの上部メニューから **「拡張機能」→「Apps Script」** をクリック
2. 新しいタブで Apps Script エディタが開く
3. 左上の「無題のプロジェクト」をクリックして名前を変更:
   - 推奨名: **`SMSA応募フォームWebhook`**

---

## ステップ3: コードを貼り付け（2分）

1. エディタに最初から入っている `function myFunction()` を**全て削除**
2. リポジトリの **`gas/Code.gs`** の中身を全てコピー
   - GitHub: https://github.com/sportsmario-jp/recruit-site/blob/main/gas/Code.gs
   - またはローカルの `C:\recruit-mock\gas\Code.gs`
3. Apps Script エディタに貼り付け
4. 上部の **`CONFIG.SHEET_ID`** の値を、ステップ1でコピーしたスプレッドシートIDに書き換え:
   ```javascript
   const CONFIG = {
     SHEET_ID: '1a2b3c4d5e6f_ここに実際のIDを貼り付け_xyz',
     ...
   };
   ```
5. 💾 **Ctrl+S** で保存

---

## ステップ4: 初期化関数の実行（3分）

シート（応募データ、設定）を自動作成します。

1. Apps Script エディタの上部で、関数選択ドロップダウン（初期は `doPost`）を **`initSheets`** に変更
2. **▶ 実行** ボタンをクリック
3. **初回のみ権限確認ダイアログ**が出ます。以下の手順で承認:
   - 「承認が必要です」→ **「権限を確認」**
   - Googleアカウント選択画面 → 使用するアカウントを選択
   - 「Google はこのアプリを確認していません」→ **「詳細」** をクリック
   - 「（プロジェクト名）（安全ではないページ）に移動」をクリック
   - 権限一覧が表示される → **「許可」** をクリック
4. 実行ログに **`✅ シート初期化完了`** と出れば成功
5. スプレッドシートに戻ると、**「応募データ」** と **「設定」** の2つのシートが作成されているはず
6. **「設定」シートのA2に `mario@sportsmario.co.jp` が初期値として入っている**ことを確認

---

## ステップ5: Web App としてデプロイ（3分）

外部からのHTTPリクエストを受け付けられるように公開します。

1. Apps Script エディタの右上の **「デプロイ」** → **「新しいデプロイ」**
2. 左の歯車アイコン **「種類の選択」** → **「ウェブアプリ」** を選択
3. 以下を設定:
   | 項目 | 値 |
   |---|---|
   | 説明 | `応募フォーム v1` |
   | 次のユーザーとして実行 | **自分（`yusuke.kirihara@sports-mario.jp`）** |
   | アクセスできるユーザー | **全員** |
4. **「デプロイ」** ボタンをクリック
5. 初回は再度権限確認が出る場合あり → 承認
6. **ウェブアプリのURL** が表示される
   - 形式: `https://script.google.com/macros/s/XXXXXXXXXXXXXX/exec`
   - この URL を**コピーしておく**（後でサイト側に設定する）
7. **「完了」** をクリック

---

## ステップ6: 動作確認（1分）

Web App が正常に動いているか確認します。

1. ステップ5でコピーした URL をブラウザで開く
2. 以下のような JSON が表示されれば成功:
   ```json
   {"status":"ok","message":"Sports Mario Recruit Webhook is running","timestamp":"..."}
   ```

---

## ステップ7: サイト側に URL を設定（2分）

Web App URL を新サイト側の設定ファイルに反映します。

### Claude Code に依頼する場合（推奨）

桐原さんから Claude Code にこう伝えるだけでOK:

> GAS Web App URLを設定してください。URLは
> `https://script.google.com/macros/s/XXXXX/exec`
> です。

→ Claude Code が `js/config.js` を編集し、Git commit & push します。

### 手動で設定する場合

`C:\recruit-mock\js\config.js` を編集:

```javascript
window.SMSA_CONFIG = {
  // Google Apps Script Web App URL（ここに貼り付け）
  FORM_ENDPOINT: 'https://script.google.com/macros/s/XXXXXXXXXXXXXX/exec',
};
```

コミット & プッシュ:
```bash
cd C:\recruit-mock
git add js/config.js
git commit -m "chore: GAS Web App URL を設定"
git push
```

---

## 運用: 宛先の追加・変更

**コード修正は不要です。** スプレッドシートの「設定」シートを開き、A列に追加するだけ:

| A列（通知先メール） |
|---|
| mario@sportsmario.co.jp |
| yusuke.kirihara@sports-mario.jp ← 追加 |
| another-staff@sports-mario.jp ← 追加 |

次の応募からすぐに全員に通知されます。

---

## 送信元（FROM）アドレスの設定

応募者への自動返信メールと、担当者への通知メールの **FROM** は、デフォルトでは
GAS実行者の Google アカウント（`yusuke.kirihara@sports-mario.jp`）になります。

`mario@sportsmario.co.jp` を FROM にするには、**事前に Gmail のエイリアス登録が必須** です。
登録なしで `CONFIG.FROM_EMAIL` を指定すると送信時にエラーになります。

### 手順

1. `yusuke.kirihara@sports-mario.jp` で Gmail にログイン
2. 右上の歯車 → **「すべての設定を表示」**
3. **「アカウントとインポート」** タブ
4. **「他のメールアドレスを追加」** → ポップアップで以下を入力
   - 名前: `スポーツマリオ採用担当`
   - メールアドレス: `mario@sportsmario.co.jp`
   - **「エイリアスとして扱います」** にチェック
5. 「次のステップ」 → 確認メールが `mario@sportsmario.co.jp` に届く
6. メール内のリンクをクリックして承認
7. Gmail 設定画面に戻り、エイリアスが追加されたことを確認

### 動作確認

エイリアス登録後、GAS エディタで `notifyStaff` または `sendAutoReply` をテスト実行し、
受信メールの From が `スポーツマリオ採用担当 <mario@sportsmario.co.jp>` になっていれば OK。

### エイリアスを使いたくない場合

`gas/Code.gs` の `CONFIG.FROM_EMAIL` を空文字 `''` に変更してデプロイし直すと、
実行者アカウントがそのまま FROM として使われます。

---

## 応募データの確認

スプレッドシートの **「応募データ」シート** を開くだけ:

- 全件の応募情報が時系列で並ぶ
- CSVエクスポート可能（ファイル → ダウンロード → CSV）
- フィルタ・並べ替えも可能

---

## コードを更新したい場合

GAS のコードを変更した場合:

1. Apps Script エディタでコードを編集・保存
2. **「デプロイ」→「デプロイを管理」**
3. 既存のデプロイ（鉛筆アイコン）を編集
4. バージョンを「新しいバージョン」に変更
5. 「デプロイ」ボタンをクリック

⚠️ **URL は変わりません**（初回のURLをそのまま使い続けられます）。

---

## トラブルシューティング

### 「スクリプトが完了しましたが、何も返されませんでした」

→ `initSheets()` 実行時の正常メッセージ。問題ありません。

### 権限確認で「このアプリは確認されていません」警告

→ Google Workspace の内部アプリとして自分で作成したため、確認が不要です。
   「詳細」→「（プロジェクト名）（安全ではないページ）に移動」で進めてOK。

### メールが送信されない

→ Gmail の1日の送信上限（無料版: 100通/日、Workspace版: 1500通/日）を確認。

### スプレッドシートに書き込まれない

→ `CONFIG.SHEET_ID` が正しく設定されているか確認。
   Apps Script のログ（「実行数」メニュー）でエラー内容確認。

### 応募フォームからエラーが返る

→ ブラウザの開発者ツール（F12）の Console でエラーを確認し、Claude Code に相談。

---

## セキュリティ備考

- Web App は `アクセスできるユーザー: 全員` 設定なので、URL を知っていれば誰でもPOSTできる状態です
- スパム対策として、フロントエンド側で:
  - 最低入力時間（ボット判定）
  - honeypot フィールド（隠しフィールド）
  - reCAPTCHA v3（オプション）
  を実装済み/実装予定です
- スプレッドシート本体は Google アカウントの共有設定通りで、外部からは見えません
- 機密情報（API Key等）はコード内にハードコードしない方針です
