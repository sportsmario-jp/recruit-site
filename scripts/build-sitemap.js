#!/usr/bin/env node
/**
 * sitemap.xml を生成する。
 * AWS Amplify ビルド時に build-shops.js の後に実行する想定（amplify.yml参照）。
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://recruit.sportsmario.co.jp';
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'sitemap.xml');

const today = new Date().toISOString().slice(0, 10);

const shopsData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'shops.json'), 'utf8')
);

const staticUrls = [
  { loc: '/',                  changefreq: 'weekly',  priority: '1.0' },
  { loc: '/graduate.html',     changefreq: 'monthly', priority: '0.9' },
  { loc: '/interview-01.html', changefreq: 'monthly', priority: '0.7' },
  { loc: '/interview-02.html', changefreq: 'monthly', priority: '0.7' },
  { loc: '/interview-03.html', changefreq: 'monthly', priority: '0.7' },
  { loc: '/shops/',            changefreq: 'weekly',  priority: '0.9' },
];

const shopUrls = shopsData.shops.map((shop) => ({
  loc: `/shops/${shop.id}.html`,
  changefreq: 'weekly',
  priority: '0.8',
}));

const allUrls = [...staticUrls, ...shopUrls];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allUrls.map(
    (u) =>
      `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  ),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(OUTPUT, xml, 'utf8');
console.log(`🗺  sitemap.xml を生成しました (${allUrls.length} URL)`);
