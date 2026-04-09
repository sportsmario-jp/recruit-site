/**
 * フロントエンド設定ファイル
 *
 * GAS Web App URL を設定する場所。
 * デプロイ手順: gas/README.md 参照
 */
window.SMSA_CONFIG = {
  // Google Apps Script Web App URL
  // デプロイ後にここを書き換えてください
  // 形式: 'https://script.google.com/macros/s/XXXXXXXXXXXXXX/exec'
  FORM_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyJ_QP4YIIYIV1dstwmdSIhlg1Hq0AGu0QFEmc6XOYx5oQgUefx6tufk_-Nn7xoV1_Ijw/exec',

  // フォーム送信後の挙動
  SUCCESS_MESSAGE: 'ご応募ありがとうございました。担当者より2〜5営業日以内にご連絡いたします。',
  ERROR_MESSAGE: '送信中にエラーが発生しました。時間をおいて再度お試しいただくか、直接お電話でお問い合わせください。',

  // スパム対策: 最低入力時間（ミリ秒）— これより早い送信はボット判定
  MIN_FILL_TIME_MS: 3000,
};
