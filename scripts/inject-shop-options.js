#!/usr/bin/env node
/**
 * index.html のフォーム内店舗セレクトを shops.json から動的生成する
 * ビルド時に呼ばれる
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const DATA_PATH = path.join(ROOT, 'data', 'shops.json');

function main() {
  if (!fs.existsSync(INDEX_PATH) || !fs.existsSync(DATA_PATH)) return;

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const shops = (data.shops || []).filter((s) => s.active);

  // 店舗 <option> を生成
  const options =
    '<option value="">指定なし / 未定</option>\n' +
    shops
      .map(
        (s) => `              <option value="${s.id}">${s.name}</option>`
      )
      .join('\n');

  let html = fs.readFileSync(INDEX_PATH, 'utf8');

  // 応募フォーム内の店舗セレクトを置換
  // 以下のマーカー間を置換する
  const startMarker = '<select id="app-shopId" name="shopId">';
  const endMarker = '</select>';

  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    console.log('  ⏭  inject-shop-options: 店舗セレクトが見つかりません（スキップ）');
    return;
  }
  const endIdx = html.indexOf(endMarker, startIdx);
  if (endIdx === -1) return;

  const before = html.slice(0, startIdx + startMarker.length);
  const after = html.slice(endIdx);
  const newHtml = `${before}\n              ${options}\n            ${after}`;

  fs.writeFileSync(INDEX_PATH, newHtml, 'utf8');
  console.log(`  ✓ index.html の店舗セレクトを ${shops.length} 件で更新`);
}

main();
