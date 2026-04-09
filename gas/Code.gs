/**
 * スポーツマリオ採用サイト 応募フォーム Webhook
 *
 * 仕組み:
 *   1. 新サイトから POST で応募データが届く (doPost)
 *   2. スプレッドシート「応募データ」シートに1行追加
 *   3. 「設定」シートから通知先メール一覧を読み、Gmailで採用担当者に通知
 *   4. 応募者本人にも自動返信メールを送信
 *   5. クライアントに {status: "ok"} を返す
 *
 * 初回セットアップ:
 *   1. このコードを貼り付けた Apps Script プロジェクトを、対象スプレッドシートに紐付けて作成
 *   2. CONFIG.SHEET_ID に対象スプレッドシートの ID を記入
 *   3. initSheets() を1回実行してシートを自動作成
 *   4. デプロイ > 新しいデプロイ > 種類: ウェブアプリ
 *      - 実行するユーザー: 自分
 *      - アクセスできるユーザー: 全員（匿名アクセスを許可）
 *   5. 発行された Web App URL を recruit-site リポジトリの js/config.js に記入
 *
 * 宛先追加:
 *   スプレッドシートの「設定」シートを開き、「通知先メール」の下に追加するだけ
 *   （コード修正不要）
 */

// ========= 設定 =========
const CONFIG = {
  // スプレッドシートID（URL の /d/ と /edit の間の文字列）
  // 例: https://docs.google.com/spreadsheets/d/【この部分】/edit
  SHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

  // 応募データ記録シート名
  APPLICATIONS_SHEET: '応募データ',

  // 設定シート名（宛先管理等）
  SETTINGS_SHEET: '設定',

  // 会社名・サイト名（メール本文で使用）
  COMPANY_NAME: '株式会社スポーツマリオ',
  SITE_NAME: 'スポーツマリオ採用サイト',
  SITE_URL: 'https://recruit.sportsmario.co.jp',

  // 送信元メール表示名
  SENDER_NAME: 'スポーツマリオ採用担当',
};

// ========= エントリーポイント =========

/**
 * HTTP POST ハンドラ（応募フォームから呼ばれる）
 */
function doPost(e) {
  try {
    // リクエストボディをパース
    const payload = JSON.parse(e.postData.contents);

    // 必須フィールドチェック
    const required = ['name', 'email', 'phone', 'category'];
    for (const key of required) {
      if (!payload[key] || String(payload[key]).trim() === '') {
        return jsonResponse({ status: 'error', message: `${key} は必須です` }, 400);
      }
    }

    // メール形式の簡易バリデーション
    if (!isValidEmail(payload.email)) {
      return jsonResponse({ status: 'error', message: 'メールアドレスの形式が正しくありません' }, 400);
    }

    // スプレッドシートに追記
    const row = appendApplication(payload);

    // 採用担当者に通知メール送信
    notifyStaff(payload, row);

    // 応募者に自動返信メール送信
    sendAutoReply(payload);

    return jsonResponse({ status: 'ok', message: '応募を受け付けました' });
  } catch (err) {
    console.error(err);
    return jsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

/**
 * GET ハンドラ（動作確認用）
 */
function doGet(e) {
  return jsonResponse({
    status: 'ok',
    message: 'Sports Mario Recruit Webhook is running',
    timestamp: new Date().toISOString(),
  });
}

// ========= スプレッドシート操作 =========

/**
 * 応募データをスプレッドシートに追記
 */
function appendApplication(payload) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPLICATIONS_SHEET) || initApplicationsSheet(ss);

  const timestamp = new Date();
  const row = [
    timestamp,                                    // A: 受付日時
    payload.category || '',                       // B: 応募区分
    payload.shopId || '',                         // C: 応募店舗ID
    payload.name || '',                           // D: 氏名
    payload.nameKana || '',                       // E: ふりがな
    payload.email || '',                          // F: メール
    payload.phone || '',                          // G: 電話番号
    payload.age || '',                            // H: 年齢
    payload.gender || '',                         // I: 性別
    payload.prefecture || '',                     // J: 都道府県
    payload.currentStatus || '',                  // K: 現況
    payload.graduationYear || '',                 // L: 卒業予定年（新卒用）
    payload.school || '',                         // M: 学校名（新卒用）
    payload.snsUrl || '',                         // N: SNS（SMSA用）
    payload.followers || '',                      // O: フォロワー数（SMSA用）
    payload.message || '',                        // P: 志望動機・メッセージ
    payload.source || '',                         // Q: 流入元（あなたを知ったきっかけ）
    payload.userAgent || '',                      // R: User Agent
  ];

  sheet.appendRow(row);
  return sheet.getLastRow();
}

/**
 * 通知先メールアドレス一覧を取得（設定シートから）
 */
function getNotifyEmails() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET) || initSettingsSheet(ss);

  // A2:A100 までを通知先リストとして読み取る
  const values = sheet.getRange('A2:A100').getValues();
  return values
    .map((row) => String(row[0] || '').trim())
    .filter((email) => email && isValidEmail(email));
}

// ========= メール送信 =========

/**
 * 採用担当者に通知メール送信
 */
function notifyStaff(payload, rowNumber) {
  const recipients = getNotifyEmails();
  if (recipients.length === 0) {
    console.warn('通知先メールが設定されていません');
    return;
  }

  const subject = `【採用応募】${payload.category} - ${payload.name} 様`;
  const body = [
    `${CONFIG.SITE_NAME} より新しい応募が届きました。`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    `受付日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
    `応募区分: ${payload.category || '-'}`,
    payload.shopId ? `応募店舗: ${payload.shopId}` : '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '【応募者情報】',
    `氏名: ${payload.name || '-'}${payload.nameKana ? `（${payload.nameKana}）` : ''}`,
    `メール: ${payload.email || '-'}`,
    `電話番号: ${payload.phone || '-'}`,
    payload.age ? `年齢: ${payload.age}` : '',
    payload.gender ? `性別: ${payload.gender}` : '',
    payload.prefecture ? `都道府県: ${payload.prefecture}` : '',
    payload.currentStatus ? `現況: ${payload.currentStatus}` : '',
    payload.graduationYear ? `卒業予定: ${payload.graduationYear}` : '',
    payload.school ? `学校: ${payload.school}` : '',
    payload.snsUrl ? `SNS URL: ${payload.snsUrl}` : '',
    payload.followers ? `フォロワー数: ${payload.followers}` : '',
    '',
    '【志望動機・メッセージ】',
    payload.message || '（記入なし）',
    '',
    payload.source ? `【当社を知ったきっかけ】\n${payload.source}` : '',
    '',
    '━━━━━━━━━━━━━━━━━━',
    `スプレッドシート行番号: ${rowNumber}`,
    `管理画面: https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/edit`,
    '━━━━━━━━━━━━━━━━━━',
  ]
    .filter((line) => line !== null && line !== undefined)
    .join('\n');

  GmailApp.sendEmail(recipients.join(','), subject, body, {
    name: CONFIG.SENDER_NAME,
    replyTo: payload.email,
  });
}

/**
 * 応募者本人に自動返信メールを送信
 */
function sendAutoReply(payload) {
  const subject = `【${CONFIG.COMPANY_NAME}】応募を受け付けました`;
  const body = [
    `${payload.name} 様`,
    '',
    `この度は、${CONFIG.COMPANY_NAME}の採用にご応募いただきまして、誠にありがとうございます。`,
    '',
    '以下の内容でご応募を受け付けました。',
    '',
    '━━━━━━━━━━━━━━━━━━',
    `応募区分: ${payload.category || '-'}`,
    `お名前: ${payload.name || '-'}`,
    `メールアドレス: ${payload.email || '-'}`,
    `電話番号: ${payload.phone || '-'}`,
    '━━━━━━━━━━━━━━━━━━',
    '',
    '採用担当より、2〜5営業日以内にご連絡を差し上げます。',
    '今しばらくお待ちくださいませ。',
    '',
    'なお、本メールは自動送信されています。',
    'ご返信いただいてもお答えできませんのでご了承ください。',
    'お問い合わせは下記までお願いいたします。',
    '',
    '━━━━━━━━━━━━━━━━━━',
    CONFIG.COMPANY_NAME,
    '採用担当',
    CONFIG.SITE_URL,
    '━━━━━━━━━━━━━━━━━━',
  ].join('\n');

  GmailApp.sendEmail(payload.email, subject, body, {
    name: CONFIG.SENDER_NAME,
  });
}

// ========= 初期化処理 =========

/**
 * シートの初期化（初回セットアップ時に手動実行）
 *
 * Apps Scriptエディタで関数を選択して▶実行ボタンを押す
 */
function initSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  initApplicationsSheet(ss);
  initSettingsSheet(ss);
  SpreadsheetApp.flush();
  console.log('✅ シート初期化完了');
}

function initApplicationsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.APPLICATIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.APPLICATIONS_SHEET);
  }

  const headers = [
    '受付日時',
    '応募区分',
    '店舗ID',
    '氏名',
    'ふりがな',
    'メール',
    '電話番号',
    '年齢',
    '性別',
    '都道府県',
    '現況',
    '卒業予定年',
    '学校名',
    'SNS URL',
    'フォロワー数',
    '志望動機',
    '流入元',
    'User Agent',
  ];

  // ヘッダー行を書き込み（既に書かれていても上書き）
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f0f0f')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);

  return sheet;
}

function initSettingsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SETTINGS_SHEET);
  }

  // 既存データを確認
  if (sheet.getLastRow() === 0) {
    sheet.getRange('A1').setValue('通知先メール').setFontWeight('bold').setBackground('#7FCC30');
    sheet.getRange('A2').setValue('yusuke.kirihara@sports-mario.jp');
    sheet.getRange('C1').setValue('使い方');
    sheet
      .getRange('C2')
      .setValue('A列に通知を受け取りたいメールアドレスを1行1つずつ追加してください。')
      .setWrap(true);
    sheet.getRange('C3').setValue('コード修正不要で即反映されます。');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 3);
  }

  return sheet;
}

// ========= ユーティリティ =========

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

function jsonResponse(obj, statusCode) {
  // GAS のウェブアプリは statusCode を直接制御できないので、
  // エラーは {status: 'error'} として200で返す
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
