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

  // 送信元メールアドレス（FROM）
  // GAS実行者アカウント(yusuke.kirihara@sports-mario.jp)の Gmail で
  // 「設定 > アカウントとインポート > 名前: 他のメールアドレスを追加」から
  // corporate.division@sports-mario.jp を Send-as エイリアス登録した上で利用する。
  // 同一ドメインなのでSMTP情報入力は不要、確認メールのリンククリックで完了。
  // 未登録の状態でこの値を指定するとメール送信時にエラーになるため、
  // 登録完了までは空文字にしておくと実行者アドレスがそのまま使われる。
  FROM_EMAIL: 'corporate.division@sports-mario.jp',

  // ===== WEB会社説明会（Google Calendar 連携） =====
  // 桐原さん個人カレンダー（イベント設置先）
  SEMINAR_CALENDAR_ID: 'yusuke.kirihara@sports-mario.jp',
  // 説明会の Google Meet URL（毎週同じURLで運用）
  SEMINAR_MEET_URL: 'https://meet.google.com/uiz-cdhs-vnw',
  // カレンダーイベントを検索するためのタイトル一部
  // "SMSA WEB会社説明会（2027卒）" を含む水曜イベントを探す
  SEMINAR_EVENT_TITLE_KEYWORD: 'SMSA',
  // 説明会の開始時刻（時:分）と所要時間（分）
  SEMINAR_START_HOUR: 15,
  SEMINAR_DURATION_MIN: 60,
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

    // 説明会希望日があればカレンダーにゲスト追加（新卒のみ）
    const seminarInfo = addApplicantToSeminar(payload);

    // 採用担当者に通知メール送信
    notifyStaff(payload, row, seminarInfo);

    // 応募者に自動返信メール送信
    sendAutoReply(payload, seminarInfo);

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
    payload.seminarDate || '',                    // S: 説明会希望日（新卒用）
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

// ========= Google Calendar 連携 =========

/**
 * 応募者を該当週のWEB説明会カレンダーイベントにゲスト追加する
 * - payload.category === '新卒採用' かつ payload.seminarDate がある場合のみ実行
 * - 該当日の15:00〜16:00 のSMSA説明会イベントを見つけてゲスト追加
 * 戻り値: { added: boolean, count: number, error?: string }
 */
function addApplicantToSeminar(payload) {
  // 説明会希望日が未指定なら何もしない
  if (!payload.seminarDate) return { added: false, count: 0 };
  if (payload.category !== '新卒採用') return { added: false, count: 0 };
  if (!payload.email) return { added: false, count: 0 };

  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.SEMINAR_CALENDAR_ID);
    if (!calendar) {
      console.warn('カレンダーが見つかりません: ' + CONFIG.SEMINAR_CALENDAR_ID);
      return { added: false, count: 0, error: 'calendar not found' };
    }

    // 説明会希望日（YYYY-MM-DD）から該当日の開始/終了時刻を生成
    const [y, m, d] = payload.seminarDate.split('-').map(Number);
    const start = new Date(y, m - 1, d, CONFIG.SEMINAR_START_HOUR, 0, 0);
    const end = new Date(start.getTime() + CONFIG.SEMINAR_DURATION_MIN * 60 * 1000);

    // 該当時間帯のイベントを取得し、タイトルに SMSA を含むものを探す
    const events = calendar.getEvents(start, end);
    const target = events.find((e) =>
      e.getTitle().indexOf(CONFIG.SEMINAR_EVENT_TITLE_KEYWORD) >= 0
    );

    if (!target) {
      console.warn('該当する説明会イベントが見つかりません: ' + payload.seminarDate);
      return { added: false, count: 0, error: 'event not found' };
    }

    // 既にゲスト登録済みかチェック
    const existingGuests = target.getGuestList().map((g) => g.getEmail().toLowerCase());
    if (!existingGuests.includes(payload.email.toLowerCase())) {
      target.addGuest(payload.email);
    }

    // 最新のゲスト数を取得
    const guestCount = target.getGuestList().length;
    return { added: true, count: guestCount };
  } catch (err) {
    console.error('カレンダー連携エラー: ' + err.toString());
    return { added: false, count: 0, error: err.toString() };
  }
}

// ========= メール送信 =========

/**
 * 採用担当者に通知メール送信
 */
function notifyStaff(payload, rowNumber, seminarInfo) {
  const recipients = getNotifyEmails();
  if (recipients.length === 0) {
    console.warn('通知先メールが設定されていません');
    return;
  }

  // 説明会カレンダー登録結果の表示用文言
  let seminarStatusLine = null;
  if (payload.seminarDate) {
    if (seminarInfo && seminarInfo.added) {
      seminarStatusLine = `カレンダー: ✓ ゲスト登録済み（現在 ${seminarInfo.count} 名）`;
    } else if (seminarInfo && seminarInfo.error) {
      seminarStatusLine = `カレンダー: ✗ 登録失敗（${seminarInfo.error}）手動で対応してください`;
    }
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
    payload.graduationYear ? `卒業予定: ${payload.graduationYear}` : null,
    payload.school ? `学校: ${payload.school}` : null,
    payload.seminarDate ? `説明会希望日: ${payload.seminarDate}（水）15:00〜` : null,
    seminarStatusLine,
    payload.snsUrl ? `SNS URL: ${payload.snsUrl}` : null,
    payload.followers ? `フォロワー数: ${payload.followers}` : null,
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

  const staffOptions = {
    name: CONFIG.SENDER_NAME,
    replyTo: payload.email,
  };
  if (CONFIG.FROM_EMAIL) staffOptions.from = CONFIG.FROM_EMAIL;
  GmailApp.sendEmail(recipients.join(','), subject, body, staffOptions);
}

/**
 * 応募者本人に自動返信メールを送信
 */
function sendAutoReply(payload, seminarInfo) {
  const subject = `【${CONFIG.COMPANY_NAME}】応募を受け付けました`;

  // 説明会希望日が指定されていれば、Meet URL を含むセクションを差し込む
  const seminarSection = payload.seminarDate
    ? [
        '',
        '【WEB会社説明会のご案内】',
        `日時: ${payload.seminarDate}（水）15:00〜16:00`,
        'お時間になりましたら、下記URLからご参加ください。',
        '（開始5分前のアクセスを推奨します）',
        '',
        '▶ Google Meet',
        CONFIG.SEMINAR_MEET_URL,
        '',
        '・服装自由、顔出し任意',
        '・所要時間 約60分',
        '・カレンダー予定もお送りしました（招待メールをご確認ください）',
      ]
    : [];

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
    payload.seminarDate ? `説明会希望日: ${payload.seminarDate}（水）15:00〜` : null,
    '━━━━━━━━━━━━━━━━━━',
    ...seminarSection,
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
  ]
    .filter((line) => line !== null && line !== undefined)
    .join('\n');

  const replyOptions = {
    name: CONFIG.SENDER_NAME,
  };
  if (CONFIG.FROM_EMAIL) {
    replyOptions.from = CONFIG.FROM_EMAIL;
    replyOptions.replyTo = CONFIG.FROM_EMAIL;
  }
  GmailApp.sendEmail(payload.email, subject, body, replyOptions);
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
    '説明会希望日',
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
    sheet.getRange('A2').setValue('corporate.division@sports-mario.jp');
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
