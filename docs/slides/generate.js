#!/usr/bin/env node
/**
 * 採用サイト運用ガイド スライド生成
 * 出力: 採用サイト運用ガイド.pptx
 */
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"
pres.author = '株式会社スポーツマリオ';
pres.title = '採用サイト運用ガイド';

// === カラーパレット（Sports Mario brand） ===
const C = {
  green:      '7FCC30', // ブランドメイン
  darkGreen:  '1A4D2E', // タイトル背景
  darkerGreen:'0d2818',
  cream:      'F8FAF5', // コンテンツ背景
  black:      '1A1A1A',
  mediumGray: '666666',
  lightGray:  'CCCCCC',
  white:      'FFFFFF',
  yellow:     'FFEB3B', // アクセント
  red:        'E53935', // 注意
};

// === 共通レイアウト関数 ===

// フッターを描画（コンテンツスライドに）
function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.4, w: 10, h: 0.25,
    fill: { color: C.darkGreen },
    line: { type: 'none' },
  });
  slide.addText('スポーツマリオ 採用サイト 運用ガイド', {
    x: 0.4, y: 5.4, w: 5, h: 0.25,
    fontSize: 9, color: C.white, fontFace: 'Meiryo', valign: 'middle',
  });
  slide.addText(`${pageNum}`, {
    x: 9.3, y: 5.4, w: 0.5, h: 0.25,
    fontSize: 9, color: C.white, fontFace: 'Meiryo', align: 'right', valign: 'middle',
  });
}

// 上部の緑帯＋タイトル
function addHeader(slide, title, subtitle) {
  // 緑帯
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: C.green },
    line: { type: 'none' },
  });
  slide.addText(title, {
    x: 0.5, y: 0.25, w: 9, h: 0.65,
    fontSize: 28, bold: true, color: C.black,
    fontFace: 'Meiryo', valign: 'middle', margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.95, w: 9, h: 0.3,
      fontSize: 13, color: C.mediumGray,
      fontFace: 'Meiryo', valign: 'middle', margin: 0,
    });
  }
}

// === スライド 1: タイトル ===
{
  const s = pres.addSlide();
  s.background = { color: C.darkGreen };

  // 装飾: 右上に大きな半透明の緑円
  s.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -1.5, w: 5, h: 5,
    fill: { color: C.green, transparency: 70 },
    line: { type: 'none' },
  });

  // SM ロゴ風アイコン
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 0.55, w: 0.85, h: 0.85,
    fill: { color: C.green },
    line: { type: 'none' },
    rectRadius: 0.15,
  });
  s.addText('SM', {
    x: 0.7, y: 0.55, w: 0.85, h: 0.85,
    fontSize: 32, bold: true, color: C.white,
    fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0,
  });
  s.addText('SPORTS MARIO', {
    x: 1.7, y: 0.7, w: 5, h: 0.4,
    fontSize: 18, bold: true, color: C.white,
    fontFace: 'Arial', valign: 'middle', margin: 0, charSpacing: 4,
  });
  s.addText('採用サイト', {
    x: 1.7, y: 1.05, w: 5, h: 0.3,
    fontSize: 11, color: C.cream,
    fontFace: 'Meiryo', valign: 'middle', margin: 0,
  });

  // メインタイトル
  s.addText('採用サイト', {
    x: 0.6, y: 2.0, w: 9, h: 0.9,
    fontSize: 60, bold: true, color: C.white,
    fontFace: 'Meiryo', valign: 'middle', margin: 0,
  });
  s.addText('運用ガイド', {
    x: 0.6, y: 2.85, w: 9, h: 0.9,
    fontSize: 60, bold: true, color: C.green,
    fontFace: 'Meiryo', valign: 'middle', margin: 0,
  });

  // サブタイトル
  s.addText('Claude Code で日本語で編集できる、新しい運用体制', {
    x: 0.6, y: 4.0, w: 9, h: 0.4,
    fontSize: 16, color: C.cream,
    fontFace: 'Meiryo', margin: 0,
  });

  // フッター情報
  s.addText('株式会社スポーツマリオ', {
    x: 0.6, y: 5.0, w: 5, h: 0.3,
    fontSize: 11, color: C.green, bold: true,
    fontFace: 'Meiryo', margin: 0,
  });
  s.addText('v1.0 / 2026年6月', {
    x: 8, y: 5.0, w: 1.4, h: 0.3,
    fontSize: 10, color: C.lightGray,
    fontFace: 'Meiryo', align: 'right', margin: 0,
  });
}

// === スライド 2: このプロジェクトとは ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, 'このプロジェクトとは', '私たちが運用する採用サイト');

  // 公開URL カード
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 9, h: 1.0,
    fill: { color: C.white }, line: { type: 'none' },
    shadow: { type: 'outer', blur: 8, offset: 2, color: '000000', opacity: 0.08 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 0.08, h: 1.0,
    fill: { color: C.green }, line: { type: 'none' },
  });
  s.addText('🌐  公開URL', {
    x: 0.8, y: 1.65, w: 8, h: 0.3,
    fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo', margin: 0,
  });
  s.addText('recruit.sportsmario.co.jp', {
    x: 0.8, y: 1.95, w: 8, h: 0.55,
    fontSize: 28, bold: true, color: C.black, fontFace: 'Arial', margin: 0,
  });

  // 数字カード × 3
  const stats = [
    { num: '4', label: '採用区分', sub: '新卒/中途/A・P/SMSA' },
    { num: '10', label: '実店舗',  sub: '1都3県+湘南' },
    { num: '∞', label: '運用人数',  sub: 'チーム編集対応' },
  ];
  stats.forEach((stat, i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.85, w: 2.9, h: 2.1,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 8, offset: 2, color: '000000', opacity: 0.08 },
    });
    s.addText(stat.num, {
      x, y: 2.95, w: 2.9, h: 1.0,
      fontSize: 64, bold: true, color: C.green, fontFace: 'Arial',
      align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(stat.label, {
      x, y: 4.05, w: 2.9, h: 0.35,
      fontSize: 16, bold: true, color: C.black, fontFace: 'Meiryo',
      align: 'center', margin: 0,
    });
    s.addText(stat.sub, {
      x, y: 4.45, w: 2.9, h: 0.3,
      fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo',
      align: 'center', margin: 0,
    });
  });

  addFooter(s, 2);
}

// === スライド 3: 今日のゴール ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '今日のゴール', 'このセッション後にあなたができるようになること');

  const goals = [
    { num: '01', title: '採用サイトを編集できる', desc: '自分のPCから店舗情報・文言を直接変更' },
    { num: '02', title: 'Claude に日本語で頼める', desc: '「時給1300円に上げて」のような指示で完了' },
    { num: '03', title: '本番反映を確認できる', desc: 'recruit.sportsmario.co.jp で変更を確認' },
  ];
  goals.forEach((g, i) => {
    const y = 1.7 + i * 1.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9, h: 1.0,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
    });
    s.addShape(pres.shapes.OVAL, {
      x: 0.75, y: y + 0.18, w: 0.65, h: 0.65,
      fill: { color: C.green }, line: { type: 'none' },
    });
    s.addText(g.num, {
      x: 0.75, y: y + 0.18, w: 0.65, h: 0.65,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Arial',
      align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(g.title, {
      x: 1.65, y: y + 0.15, w: 7.5, h: 0.45,
      fontSize: 18, bold: true, color: C.black, fontFace: 'Meiryo', margin: 0,
    });
    s.addText(g.desc, {
      x: 1.65, y: y + 0.55, w: 7.5, h: 0.4,
      fontSize: 12, color: C.mediumGray, fontFace: 'Meiryo', margin: 0,
    });
  });

  addFooter(s, 3);
}

// === スライド 4: 全体フロー ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '全体フロー', '編集から本番反映までの流れ');

  // 4ステップのカード
  const steps = [
    { icon: '✏', title: 'あなたが\n編集', sub: 'Claude に依頼', color: C.green },
    { icon: '☁', title: 'AWS に\npush', sub: 'codecommit へ', color: C.darkGreen },
    { icon: '⚙', title: 'Amplify が\nビルド', sub: '自動デプロイ', color: C.darkGreen },
    { icon: '🌐', title: '本番\n反映', sub: '2〜5分後', color: C.green },
  ];

  steps.forEach((step, i) => {
    const x = 0.4 + i * 2.45;
    // カード
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.9, w: 2.15, h: 2.6,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 8, offset: 2, color: '000000', opacity: 0.08 },
    });
    // 番号バー
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.9, w: 2.15, h: 0.3,
      fill: { color: step.color }, line: { type: 'none' },
    });
    s.addText(`STEP ${i + 1}`, {
      x, y: 1.9, w: 2.15, h: 0.3,
      fontSize: 11, bold: true, color: C.white, fontFace: 'Arial',
      align: 'center', valign: 'middle', margin: 0,
    });
    // アイコン
    s.addText(step.icon, {
      x, y: 2.4, w: 2.15, h: 0.85,
      fontSize: 50, color: step.color, fontFace: 'Meiryo',
      align: 'center', valign: 'middle', margin: 0,
    });
    // タイトル
    s.addText(step.title, {
      x, y: 3.25, w: 2.15, h: 0.75,
      fontSize: 15, bold: true, color: C.black, fontFace: 'Meiryo',
      align: 'center', valign: 'middle', margin: 0,
    });
    // 説明
    s.addText(step.sub, {
      x, y: 4.05, w: 2.15, h: 0.35,
      fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo',
      align: 'center', valign: 'middle', margin: 0,
    });

    // 矢印（最後以外）
    if (i < steps.length - 1) {
      s.addText('▶', {
        x: x + 2.16, y: 2.9, w: 0.28, h: 0.5,
        fontSize: 18, bold: true, color: C.green,
        align: 'center', valign: 'middle', margin: 0,
      });
    }
  });

  // 下部のキーポイント
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.75, w: 9, h: 0.5,
    fill: { color: C.darkGreen }, line: { type: 'none' },
  });
  s.addText('💡  あなたがやるのは STEP 1 だけ。あとは全自動です。', {
    x: 0.5, y: 4.75, w: 9, h: 0.5,
    fontSize: 13, bold: true, color: C.white, fontFace: 'Meiryo',
    align: 'center', valign: 'middle', margin: 0,
  });

  addFooter(s, 4);
}

// === スライド 5: 事前に必要なもの ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '事前に必要なもの', 'セットアップ前に揃えておくもの');

  // 2x2グリッド
  const items = [
    { icon: '💻', title: 'Windows PC', desc: 'メモリ8GB以上推奨\nWindows 10/11' },
    { icon: '🔑', title: '管理者権限', desc: 'ソフトウェアを\nインストールできるアカウント' },
    { icon: '☁', title: 'AWS 認証情報', desc: '桐原さんから受領\n（ユーザー名+パスワード）' },
    { icon: '🤖', title: 'Claude API キー', desc: '会社契約の Claude Code\nライセンスを使用' },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 4.55;
    const y = 1.6 + row * 1.7;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.3, h: 1.5,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.25, y: y + 0.3, w: 0.9, h: 0.9,
      fill: { color: C.green, transparency: 80 }, line: { type: 'none' },
    });
    s.addText(item.icon, {
      x: x + 0.25, y: y + 0.3, w: 0.9, h: 0.9,
      fontSize: 32, align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(item.title, {
      x: x + 1.3, y: y + 0.2, w: 2.9, h: 0.4,
      fontSize: 16, bold: true, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
    s.addText(item.desc, {
      x: x + 1.3, y: y + 0.65, w: 2.9, h: 0.75,
      fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo',
      valign: 'top', margin: 0,
    });
  });

  addFooter(s, 5);
}

// === スライド 6: セットアップ STEP 1 - インストール ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, 'STEP 1：必要なソフトをインストール', '所要時間 約30分');

  const softwares = [
    { name: 'Node.js', desc: 'LTS版をダウンロード', url: 'nodejs.org/ja/' },
    { name: 'Git for Windows', desc: '初期設定でOK', url: 'git-scm.com/download/win' },
    { name: 'VSCode', desc: 'エディタ（推奨）', url: 'code.visualstudio.com' },
    { name: 'Claude Code', desc: '会社の配布方法に従う', url: '社内ドキュメント参照' },
  ];

  softwares.forEach((sw, i) => {
    const y = 1.7 + i * 0.83;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.72,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 4, offset: 1, color: '000000', opacity: 0.06 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.06, h: 0.72,
      fill: { color: C.green }, line: { type: 'none' },
    });
    s.addText(`${i + 1}`, {
      x: 0.7, y, w: 0.5, h: 0.72,
      fontSize: 22, bold: true, color: C.green, fontFace: 'Arial',
      align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(sw.name, {
      x: 1.3, y: y + 0.05, w: 3.5, h: 0.4,
      fontSize: 17, bold: true, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
    s.addText(sw.desc, {
      x: 1.3, y: y + 0.4, w: 3.5, h: 0.32,
      fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
    s.addText(sw.url, {
      x: 4.9, y, w: 4.5, h: 0.72,
      fontSize: 13, color: C.darkGreen, fontFace: 'Consolas',
      valign: 'middle', align: 'right', margin: 0,
    });
  });

  addFooter(s, 6);
}

// === スライド 7: STEP 2 - AWS 認証情報の登録 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, 'STEP 2：AWS 認証情報を Windows に登録', '所要時間 約5分');

  // 左：手順
  s.addText('手順', {
    x: 0.5, y: 1.6, w: 5, h: 0.35,
    fontSize: 14, bold: true, color: C.darkGreen, fontFace: 'Meiryo', margin: 0,
  });

  const steps = [
    'スタートメニュー → 「資格情報マネージャー」',
    '「Windows 資格情報」をクリック',
    '「汎用資格情報の追加」',
    '以下を入力 →',
    '「OK」で保存',
  ];
  steps.forEach((step, i) => {
    const y = 2.0 + i * 0.5;
    s.addShape(pres.shapes.OVAL, {
      x: 0.5, y: y + 0.05, w: 0.35, h: 0.35,
      fill: { color: C.green }, line: { type: 'none' },
    });
    s.addText(`${i + 1}`, {
      x: 0.5, y: y + 0.05, w: 0.35, h: 0.35,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Arial',
      align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(step, {
      x: 1.0, y, w: 4.2, h: 0.45,
      fontSize: 13, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
  });

  // 右：入力内容
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.6, y: 1.6, w: 4.0, h: 3.6,
    fill: { color: C.darkGreen }, line: { type: 'none' },
  });
  s.addText('入力内容', {
    x: 5.8, y: 1.75, w: 3.6, h: 0.4,
    fontSize: 14, bold: true, color: C.green, fontFace: 'Meiryo', margin: 0,
  });

  const inputs = [
    { label: 'インターネットアドレス', val: 'git-codecommit.\nap-northeast-1.\namazonaws.com' },
    { label: 'ユーザー名', val: '桐原さんから\n受領した値' },
    { label: 'パスワード', val: '桐原さんから\n受領した値' },
  ];
  inputs.forEach((inp, i) => {
    const y = 2.25 + i * 0.95;
    s.addText(inp.label, {
      x: 5.8, y, w: 3.6, h: 0.25,
      fontSize: 10, color: C.green, fontFace: 'Meiryo', margin: 0,
    });
    s.addText(inp.val, {
      x: 5.8, y: y + 0.25, w: 3.6, h: 0.65,
      fontSize: 11, color: C.white, fontFace: 'Consolas',
      valign: 'top', margin: 0,
    });
  });

  addFooter(s, 7);
}

// === スライド 8: STEP 3 - リポジトリ取得 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, 'STEP 3：リポジトリを取得', '所要時間 約5分');

  // PowerShell コマンド枠
  s.addText('PowerShell を開いて、以下のコマンドを順に実行', {
    x: 0.5, y: 1.5, w: 9, h: 0.3,
    fontSize: 12, color: C.mediumGray, fontFace: 'Meiryo', margin: 0,
  });

  const commands = [
    { cmd: 'cd C:\\', desc: 'C:ドライブのルートに移動' },
    { cmd: 'git clone https://git-codecommit.ap-northeast-1.amazonaws.com/v1/repos/recruit-site recruit-mock', desc: 'リポジトリをダウンロード（1〜2分）' },
    { cmd: 'cd recruit-mock', desc: 'プロジェクトに入る' },
    { cmd: 'git remote add origin https://github.com/sportsmario-jp/recruit-site.git', desc: 'GitHub もリモート追加（バックアップ用）' },
    { cmd: 'npm install', desc: '依存パッケージインストール（1〜2分）' },
  ];

  commands.forEach((c, i) => {
    const y = 1.95 + i * 0.62;
    // コマンドボックス
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9.0, h: 0.55,
      fill: { color: C.darkerGreen }, line: { type: 'none' },
    });
    s.addText(`${i + 1}.`, {
      x: 0.6, y: y + 0.05, w: 0.3, h: 0.25,
      fontSize: 9, color: C.green, fontFace: 'Arial', margin: 0,
    });
    s.addText(c.cmd, {
      x: 0.9, y: y + 0.04, w: 8.0, h: 0.28,
      fontSize: 11, color: C.white, fontFace: 'Consolas',
      valign: 'top', margin: 0,
    });
    s.addText(c.desc, {
      x: 0.9, y: y + 0.3, w: 8.0, h: 0.22,
      fontSize: 9, color: 'A0E060', fontFace: 'Meiryo', italic: true,
      valign: 'top', margin: 0,
    });
  });

  addFooter(s, 8);
}

// === スライド 9: STEP 4 - Claude Code 起動 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, 'STEP 4：Claude Code を起動', '最初の動作確認');

  // 起動コマンド
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 9, h: 0.85,
    fill: { color: C.darkerGreen }, line: { type: 'none' },
  });
  s.addText('PowerShell で', {
    x: 0.7, y: 1.6, w: 8.6, h: 0.3,
    fontSize: 10, color: 'A0E060', fontFace: 'Meiryo', italic: true, margin: 0,
  });
  s.addText('cd C:\\recruit-mock', {
    x: 0.7, y: 1.85, w: 8.6, h: 0.25,
    fontSize: 13, color: C.white, fontFace: 'Consolas', margin: 0,
  });
  s.addText('claude', {
    x: 0.7, y: 2.1, w: 8.6, h: 0.25,
    fontSize: 13, color: C.green, bold: true, fontFace: 'Consolas', margin: 0,
  });

  // 動作確認
  s.addText('動作確認 — Claude に話しかけてみる', {
    x: 0.5, y: 2.6, w: 9, h: 0.35,
    fontSize: 14, bold: true, color: C.darkGreen, fontFace: 'Meiryo', margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.0, w: 9, h: 0.7,
    fill: { color: C.white }, line: { type: 'none' },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.0, w: 0.08, h: 0.7,
    fill: { color: C.green }, line: { type: 'none' },
  });
  s.addText('💬', {
    x: 0.65, y: 3.05, w: 0.55, h: 0.6,
    fontSize: 22, align: 'center', valign: 'middle', margin: 0,
  });
  s.addText('「このプロジェクトの概要を教えて」', {
    x: 1.3, y: 3.0, w: 8.0, h: 0.7,
    fontSize: 16, bold: true, color: C.black, fontFace: 'Meiryo',
    valign: 'middle', margin: 0,
  });

  // 期待される動作
  s.addText('期待される反応', {
    x: 0.5, y: 3.95, w: 9, h: 0.3,
    fontSize: 12, color: C.mediumGray, fontFace: 'Meiryo', margin: 0,
  });
  const expects = [
    'CLAUDE.md を読み込んで、サイトの概要を返答',
    'デプロイ方法（codecommit push）に言及',
    '主要なファイル構成を説明',
  ];
  expects.forEach((e, i) => {
    s.addText(`✓  ${e}`, {
      x: 0.7, y: 4.25 + i * 0.32, w: 9, h: 0.3,
      fontSize: 12, color: C.darkGreen, fontFace: 'Meiryo', margin: 0,
    });
  });

  addFooter(s, 9);
}

// === スライド 10: 実演 1 — 時給変更 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '実演 1：時給を変更してみよう', '一番よくある作業');

  // 左：プロンプト
  s.addText('🗣  Claude に話しかける', {
    x: 0.5, y: 1.55, w: 4.5, h: 0.35,
    fontSize: 13, bold: true, color: C.darkGreen, fontFace: 'Meiryo', margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.95, w: 4.5, h: 1.2,
    fill: { color: C.white }, line: { type: 'none' },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.1 },
  });
  s.addText('錦糸町店の時給を 1300円に上げて。push まで自動でやって。', {
    x: 0.7, y: 2.05, w: 4.1, h: 1.0,
    fontSize: 14, color: C.black, fontFace: 'Meiryo',
    valign: 'middle', margin: 0,
  });

  // 右：Claude が自動でやること
  s.addText('⚙  Claude が自動でやること', {
    x: 5.2, y: 1.55, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: C.darkGreen, fontFace: 'Meiryo', margin: 0,
  });

  const tasks = [
    'data/shops.json を編集',
    'JSON 妥当性チェック',
    'ビルド実行（shops/*.html 再生成）',
    'コミット（日本語メッセージ）',
    'codecommit に push',
    'GitHub にも push',
  ];
  tasks.forEach((t, i) => {
    const y = 1.95 + i * 0.4;
    s.addShape(pres.shapes.OVAL, {
      x: 5.4, y: y + 0.07, w: 0.25, h: 0.25,
      fill: { color: C.green }, line: { type: 'none' },
    });
    s.addText('✓', {
      x: 5.4, y: y + 0.05, w: 0.25, h: 0.25,
      fontSize: 11, color: C.white, bold: true,
      align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(t, {
      x: 5.75, y, w: 3.7, h: 0.35,
      fontSize: 11, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
  });

  // 下部：結果
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.45, w: 9, h: 0.7,
    fill: { color: C.darkGreen }, line: { type: 'none' },
  });
  s.addText('⏱  2〜5分後 → recruit.sportsmario.co.jp に反映完了！', {
    x: 0.5, y: 4.45, w: 9, h: 0.7,
    fontSize: 16, bold: true, color: C.white, fontFace: 'Meiryo',
    align: 'center', valign: 'middle', margin: 0,
  });

  addFooter(s, 10);
}

// === スライド 11: 実演 2 — 募集停止 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '実演 2：募集の停止／再開', 'recruiting フラグで簡単切替');

  // 2 カラム: 停止 vs 再開
  const cases = [
    {
      title: '🛑  募集を一時停止',
      prompt: '亀有店の募集を一時停止して',
      result: '一覧で「現在募集休止中」バッジ\n＋ グレーアウト表示',
      color: '888888',
    },
    {
      title: '🟢  募集を再開',
      prompt: '亀有店の募集を再開。時給1250円スタートで',
      result: '通常表示に戻る\n時給も同時更新可能',
      color: C.green,
    },
  ];

  cases.forEach((c, i) => {
    const x = 0.5 + i * 4.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.55, w: 4.3, h: 3.5,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 8, offset: 2, color: '000000', opacity: 0.08 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.55, w: 4.3, h: 0.5,
      fill: { color: c.color }, line: { type: 'none' },
    });
    s.addText(c.title, {
      x: x + 0.2, y: 1.55, w: 4.0, h: 0.5,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
    s.addText('🗣  プロンプト例', {
      x: x + 0.2, y: 2.2, w: 4.0, h: 0.3,
      fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo', margin: 0,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: 2.55, w: 3.9, h: 0.95,
      fill: { color: C.cream }, line: { type: 'none' },
    });
    s.addText(c.prompt, {
      x: x + 0.35, y: 2.55, w: 3.7, h: 0.95,
      fontSize: 12, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
    s.addText('結果', {
      x: x + 0.2, y: 3.65, w: 4.0, h: 0.3,
      fontSize: 11, color: C.mediumGray, fontFace: 'Meiryo', margin: 0,
    });
    s.addText(c.result, {
      x: x + 0.2, y: 3.95, w: 4.0, h: 1.0,
      fontSize: 12, color: C.black, fontFace: 'Meiryo',
      valign: 'top', margin: 0,
    });
  });

  addFooter(s, 11);
}

// === スライド 12: 実演 3 — 新店舗追加 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '実演 3：新店舗を追加', 'まとめて情報を渡せばOK');

  s.addText('🗣  最初のプロンプト', {
    x: 0.5, y: 1.55, w: 9, h: 0.3,
    fontSize: 12, bold: true, color: C.darkGreen, fontFace: 'Meiryo', margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.9, w: 9, h: 1.65,
    fill: { color: C.white }, line: { type: 'none' },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
  });
  const promptLines = [
    '新店舗を追加したい。',
    '- 店舗名: スポーツマリオ 横浜店',
    '- 業態: SPORTS MARIO',
    '- 住所: 神奈川県横浜市西区高島2-19-12',
    '- 営業時間: 10:00〜21:00',
    '- 時給: 1250円〜',
  ];
  promptLines.forEach((line, i) => {
    s.addText(line, {
      x: 0.75, y: 2.0 + i * 0.25, w: 8.5, h: 0.25,
      fontSize: 11, color: C.black, fontFace: 'Meiryo', margin: 0,
    });
  });

  s.addText('💡  情報が足りない時は Claude が質問してくれます', {
    x: 0.5, y: 3.75, w: 9, h: 0.4,
    fontSize: 12, color: C.mediumGray, fontFace: 'Meiryo', italic: true, margin: 0,
  });

  // 下: 注意事項
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.3, w: 9, h: 0.8,
    fill: { color: 'FFF3E0' }, line: { type: 'none' },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.3, w: 0.08, h: 0.8,
    fill: { color: 'FF9800' }, line: { type: 'none' },
  });
  s.addText('⚠  店舗写真は後で差し替え：「images/shops/yokohama.jpg を新写真に差し替えて」', {
    x: 0.7, y: 4.3, w: 8.7, h: 0.4,
    fontSize: 11, bold: true, color: 'E65100', fontFace: 'Meiryo',
    valign: 'middle', margin: 0,
  });
  s.addText('画像ファイル名と保存場所を Claude に伝えれば、自動で配置・パス設定してくれます', {
    x: 0.7, y: 4.65, w: 8.7, h: 0.35,
    fontSize: 10, color: 'BF360C', fontFace: 'Meiryo',
    valign: 'middle', margin: 0,
  });

  addFooter(s, 12);
}

// === スライド 13: 頼み方のコツ ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '頼み方のコツ', '同じ作業でも、伝え方で結果が変わる');

  // 左: ✓ 良い例
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 4.4, h: 3.55,
    fill: { color: C.white }, line: { type: 'none' },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.55, w: 4.4, h: 0.5,
    fill: { color: C.green }, line: { type: 'none' },
  });
  s.addText('✓  通じる頼み方', {
    x: 0.7, y: 1.55, w: 4.1, h: 0.5,
    fontSize: 15, bold: true, color: C.white, fontFace: 'Meiryo',
    valign: 'middle', margin: 0,
  });

  const goodExamples = [
    '「下北沢店の時給を1300円に」',
    '「全店舗の募集を再開して」',
    '「6/17の説明会、何人いる？」',
    '「○○店の写真を差し替えて」',
  ];
  goodExamples.forEach((ex, i) => {
    s.addText(`• ${ex}`, {
      x: 0.7, y: 2.25 + i * 0.55, w: 4.1, h: 0.5,
      fontSize: 12, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
  });

  // 右: × NG 例
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 4.4, h: 3.55,
    fill: { color: C.white }, line: { type: 'none' },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.55, w: 4.4, h: 0.5,
    fill: { color: '888888' }, line: { type: 'none' },
  });
  s.addText('✗  通じにくい頼み方', {
    x: 5.3, y: 1.55, w: 4.1, h: 0.5,
    fontSize: 15, bold: true, color: C.white, fontFace: 'Meiryo',
    valign: 'middle', margin: 0,
  });

  const badExamples = [
    '「いい感じにして」',
    '「全部変えて」',
    '「直しといて」',
    '「あれの修正お願い」',
  ];
  badExamples.forEach((ex, i) => {
    s.addText(`• ${ex}`, {
      x: 5.3, y: 2.25 + i * 0.55, w: 4.1, h: 0.5,
      fontSize: 12, color: '888888', fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
  });

  // 下部キーポイント
  s.addText('💡  迷ったら一行で頼んで、Claudeが質問してきたら追加情報を渡す', {
    x: 0.5, y: 5.15, w: 9, h: 0.25,
    fontSize: 11, italic: true, color: C.darkGreen, fontFace: 'Meiryo',
    align: 'center', margin: 0,
  });

  addFooter(s, 13);
}

// === スライド 14: 困った時 ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '困った時の対処法', 'まず Claude に相談、それでもダメなら桐原さん');

  const helps = [
    {
      icon: '①',
      title: 'エラーメッセージをそのまま Claude に貼る',
      desc: 'ほとんどはこれで解決します',
      code: '「こんなエラーが出てる：\n[エラーメッセージをコピペ]\n解決お願い」',
    },
    {
      icon: '②',
      title: 'まずは pull して最新を取り込む',
      desc: '他の人の変更が来てたら conflict することも',
      code: '「他のメンバーの変更を取り込んで、私の変更も含めて push して」',
    },
    {
      icon: '③',
      title: '解決しなければ桐原さんに連絡',
      desc: 'Slack または直接',
      code: 'yusuke.kirihara@sports-mario.jp',
    },
  ];

  helps.forEach((h, i) => {
    const y = 1.55 + i * 1.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9, h: 1.05,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.08 },
    });
    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: y + 0.25, w: 0.55, h: 0.55,
      fill: { color: C.green }, line: { type: 'none' },
    });
    s.addText(h.icon, {
      x: 0.7, y: y + 0.25, w: 0.55, h: 0.55,
      fontSize: 18, bold: true, color: C.white, fontFace: 'Meiryo',
      align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(h.title, {
      x: 1.45, y: y + 0.1, w: 5.2, h: 0.4,
      fontSize: 14, bold: true, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
    s.addText(h.desc, {
      x: 1.45, y: y + 0.5, w: 5.2, h: 0.5,
      fontSize: 10, color: C.mediumGray, fontFace: 'Meiryo',
      valign: 'top', margin: 0,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.85, y: y + 0.13, w: 2.55, h: 0.8,
      fill: { color: C.darkerGreen }, line: { type: 'none' },
    });
    s.addText(h.code, {
      x: 6.95, y: y + 0.13, w: 2.4, h: 0.8,
      fontSize: 9, color: C.white, fontFace: 'Consolas',
      valign: 'middle', margin: 0,
    });
  });

  addFooter(s, 14);
}

// === スライド 15: 参考ドキュメント ===
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, '参考ドキュメント', 'すべて C:\\recruit-mock\\ に入っています');

  const docs = [
    { file: 'CLAUDE.md', desc: 'プロジェクト全体の文脈（Claude が自動で読みます）' },
    { file: 'README.md', desc: 'リポジトリの説明書' },
    { file: 'docs/ONBOARDING.md', desc: '新メンバー向け 詳細セットアップ手順' },
    { file: 'docs/COMMON_TASKS.md', desc: 'よく使う作業のプロンプト例集' },
    { file: 'docs/aws-iam-setup.md', desc: '管理者用：AWS IAM ユーザー作成手順' },
    { file: '.claude/skills/recruit-shop-edit/', desc: '店舗編集スキル（Claudeが自動使用）' },
  ];

  docs.forEach((d, i) => {
    const y = 1.55 + i * 0.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.48,
      fill: { color: C.white }, line: { type: 'none' },
      shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 },
    });
    s.addText('📄', {
      x: 0.7, y, w: 0.45, h: 0.48,
      fontSize: 18, align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(d.file, {
      x: 1.2, y: y + 0.05, w: 4.2, h: 0.4,
      fontSize: 13, bold: true, color: C.darkGreen, fontFace: 'Consolas',
      valign: 'middle', margin: 0,
    });
    s.addText(d.desc, {
      x: 5.5, y, w: 3.9, h: 0.48,
      fontSize: 11, color: C.black, fontFace: 'Meiryo',
      valign: 'middle', margin: 0,
    });
  });

  addFooter(s, 15);
}

// === スライド 16: お疲れ様でした ===
{
  const s = pres.addSlide();
  s.background = { color: C.darkGreen };

  // 装飾
  s.addShape(pres.shapes.OVAL, {
    x: -2, y: 3, w: 5, h: 5,
    fill: { color: C.green, transparency: 75 },
    line: { type: 'none' },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 7, y: -2, w: 5, h: 5,
    fill: { color: C.green, transparency: 80 },
    line: { type: 'none' },
  });

  s.addText('お疲れ様でした 🎉', {
    x: 0.5, y: 1.5, w: 9, h: 1.0,
    fontSize: 50, bold: true, color: C.white, fontFace: 'Meiryo',
    align: 'center', valign: 'middle', margin: 0,
  });

  s.addText('これであなたも採用サイトの編集担当', {
    x: 0.5, y: 2.7, w: 9, h: 0.6,
    fontSize: 22, color: C.green, fontFace: 'Meiryo',
    align: 'center', valign: 'middle', margin: 0,
  });

  // 次のステップ
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 3.7, w: 7, h: 1.2,
    fill: { color: C.white, transparency: 10 }, line: { type: 'none' },
  });
  s.addText('次のステップ', {
    x: 1.5, y: 3.75, w: 7, h: 0.35,
    fontSize: 12, color: C.green, fontFace: 'Meiryo',
    align: 'center', margin: 0,
  });
  s.addText('実際に何か1つ編集してみてください\n（時給変更、文言修正など、軽いもので）', {
    x: 1.5, y: 4.1, w: 7, h: 0.75,
    fontSize: 14, color: C.white, fontFace: 'Meiryo',
    align: 'center', valign: 'middle', margin: 0,
  });

  s.addText('株式会社スポーツマリオ', {
    x: 0.5, y: 5.15, w: 9, h: 0.25,
    fontSize: 10, color: C.cream, fontFace: 'Meiryo',
    align: 'center', margin: 0,
  });
}

// === 保存 ===
pres.writeFile({ fileName: '採用サイト運用ガイド.pptx' }).then((fileName) => {
  console.log(`✅ スライド生成完了: ${fileName}`);
});
