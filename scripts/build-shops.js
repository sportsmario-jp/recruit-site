#!/usr/bin/env node
/**
 * shops.json → 店舗一覧ページ + 各店舗詳細ページを生成
 *
 * 出力:
 *   shops/index.html        店舗一覧ページ
 *   shops/<id>.html          各店舗詳細ページ
 *
 * 使い方:
 *   node scripts/build-shops.js
 *   npm run build:shops
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'shops.json');
const TEMPLATE_DIR = path.join(ROOT, 'templates');
const OUT_DIR = path.join(ROOT, 'shops');

// ---------- ユーティリティ ----------

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSalary(salary) {
  if (!salary) return '';
  const unit = salary.type === 'monthly' ? '月給' : '時給';
  const fmt = (n) => n.toLocaleString('ja-JP') + '円';
  let text = `${unit} `;
  if (salary.max) {
    text += `${fmt(salary.min)}〜${fmt(salary.max)}`;
  } else {
    text += `${fmt(salary.min)}〜`;
  }
  if (salary.note) text += `（${salary.note}）`;
  return text;
}

function formatJobType(type) {
  const map = {
    fulltime: '正社員',
    parttime: 'アルバイト・パート',
    contract: '契約社員',
  };
  return map[type] || type;
}

function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8');
}

function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    data[key] != null ? String(data[key]) : ''
  );
}

// ---------- 共通ヘッダー / フッター ----------

/**
 * 共通ヘッダー（TOPページと同じ構造）
 * @param {string} currentPage - 'list' | 'detail'（現在ページ種別）
 */
function renderHeader(currentPage) {
  // shops/ 配下から index.html への相対パスは常に ../index.html
  return `  <header class="site-header" id="header">
    <div class="header-inner">
      <a href="../index.html" class="logo">
        <img src="../images/logo.svg" alt="SPORTS MARIO" class="logo-img">
        <span class="logo-recruit-sub">新卒、キャリア、アルバイト、パート採用サイト</span>
      </a>
      <nav class="global-nav" id="globalNav">
        <ul class="nav-list">
          <li><a href="../index.html#numbers">NUMBERS</a></li>
          <li><a href="../index.html#vision">VISION</a></li>
          <li><a href="../index.html#reward">REWARD</a></li>
          <li><a href="../index.html#fff">FFF</a></li>
          <li><a href="../index.html#smsa">SMSA</a></li>
          <li><a href="../index.html#career">CAREER</a></li>
          <li><a href="../index.html#work">WORK</a></li>
          <li><a href="index.html"${currentPage === 'list' ? ' class="nav-current"' : ''}>SHOPS</a></li>
          <li><a href="../index.html#entry" class="nav-cta">ENTRY</a></li>
          <li><a href="../graduate.html" class="nav-cta nav-cta--grad">新卒採用</a></li>
        </ul>
      </nav>
      <button class="hamburger" id="hamburger" aria-label="メニューを開く">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function renderFooter() {
  return `  <footer class="site-footer">
    <div class="footer-inner">
      <img src="../images/logo-footer.svg" alt="スポーツマリオ" class="footer-logo">
      <p>&copy; Sports Mario Co., Ltd.</p>
    </div>
  </footer>`;
}

// ---------- ジョブHTML生成 ----------

function renderJob(job, shopId) {
  const benefits = job.benefits.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n');
  const requirements = job.requirements
    ? `<dt>応募資格</dt><dd><ul class="job-list">${job.requirements
        .map((r) => `<li>${escapeHtml(r)}</li>`)
        .join('')}</ul></dd>`
    : '';
  // 職種→応募区分マッピング
  const categoryMap = { fulltime: '中途・キャリア採用', parttime: 'アルバイト・パート', contract: '中途・キャリア採用' };
  const category = encodeURIComponent(categoryMap[job.type] || '');
  const entryUrl = `../index.html?shop=${escapeHtml(shopId)}&category=${category}#application-form-wrap`;
  // recruiting: false の場合は募集停止表示
  const isRecruiting = job.recruiting !== false;
  const entryButton = isRecruiting
    ? `<a href="${entryUrl}" class="job-entry-btn">この職種に応募する →</a>`
    : `<span class="job-entry-btn job-entry-btn--closed">現在この職種は募集しておりません</span>`;
  return `
    <div class="job-card job-card--${escapeHtml(job.type)}${isRecruiting ? '' : ' job-card--closed'}">
      <div class="job-card__header">
        <span class="job-type-badge">${escapeHtml(formatJobType(job.type))}</span>
        <h3 class="job-position">${escapeHtml(job.position)}</h3>
      </div>
      <dl class="job-details">
        <dt>給与</dt><dd>${escapeHtml(formatSalary(job.salary))}</dd>
        <dt>勤務時間</dt><dd>${escapeHtml(job.hours)}</dd>
        <dt>待遇・福利厚生</dt><dd><ul class="job-list">${benefits}</ul></dd>
        ${requirements}
      </dl>
      ${entryButton}
    </div>`;
}

// ---------- 店舗詳細ページ生成 ----------

function renderShopPage(shop, brands) {
  const brand = brands[shop.brand] || { label: shop.brandLabel, color: '#00c853' };
  const jobsHtml = shop.jobs.map(job => renderJob(job, shop.id)).join('\n');
  const appealHtml = shop.appeal
    .map((a) => `<li>${escapeHtml(a)}</li>`)
    .join('\n');

  const title = (shop.seo && shop.seo.title) || `${shop.name} | 採用情報 | スポーツマリオ`;
  const description =
    (shop.seo && shop.seo.description) || shop.description.slice(0, 120);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../shops.css">
</head>
<body class="shop-detail-page">
${renderHeader('detail')}

  <main class="shop-main">
    <section class="shop-hero" style="--brand-color: ${brand.color};">
      <div class="shop-hero__inner">
        <div class="shop-brand-badge">${escapeHtml(brand.label)}</div>
        <h1 class="shop-title">${escapeHtml(shop.name)}</h1>
        <p class="shop-tagline">${escapeHtml(brand.tagline || '')}</p>
      </div>
    </section>

    <section class="shop-info">
      <div class="shop-info__inner">
        <h2>店舗について</h2>
        <p class="shop-description">${escapeHtml(shop.description)}</p>

        <div class="shop-meta">
          <dl>
            <dt>住所</dt><dd>${escapeHtml(shop.address)}</dd>
            <dt>アクセス</dt><dd>${escapeHtml(shop.access)}</dd>
            <dt>営業時間</dt><dd>${escapeHtml(shop.businessHours)}</dd>
            ${shop.holidays ? `<dt>定休日</dt><dd>${escapeHtml(shop.holidays)}</dd>` : ''}
            ${shop.phone ? `<dt>電話番号</dt><dd>${escapeHtml(shop.phone)}</dd>` : ''}
          </dl>
        </div>

        <h2>この店舗の魅力</h2>
        <ul class="shop-appeal">
          ${appealHtml}
        </ul>
      </div>
    </section>

    <section class="shop-jobs" id="jobs">
      <div class="shop-jobs__inner">
        <h2>募集職種</h2>
        <div class="job-cards">
          ${jobsHtml}
        </div>
      </div>
    </section>

  </main>

${renderFooter()}
  <script src="../script.js"></script>
</body>
</html>
`;
}

// ---------- 店舗一覧ページ生成 ----------

function renderShopsIndex(shops, brands) {
  const activeShops = shops.filter((s) => s.active);

  // 業態別にグループ化
  const grouped = {};
  for (const shop of activeShops) {
    if (!grouped[shop.brand]) grouped[shop.brand] = [];
    grouped[shop.brand].push(shop);
  }

  const sections = Object.entries(grouped)
    .map(([brandKey, shopsInBrand]) => {
      const brand = brands[brandKey] || { label: brandKey, color: '#00c853' };
      const cards = shopsInBrand
        .map(
          (shop) => `
        <a href="${escapeHtml(shop.id)}.html" class="shop-card" style="--brand-color: ${brand.color};">
          <div class="shop-card__image" style="background-image: url('../${escapeHtml(shop.images.hero)}');">
            <span class="shop-card__brand">${escapeHtml(brand.label)}</span>
          </div>
          <div class="shop-card__body">
            <h3 class="shop-card__name">${escapeHtml(shop.name)}</h3>
            <p class="shop-card__access">${escapeHtml(shop.access)}</p>
            <div class="shop-card__jobs">
              ${shop.jobs
                .map(
                  (j) =>
                    `<span class="job-tag job-tag--${escapeHtml(j.type)}">${escapeHtml(formatJobType(j.type))}</span>`
                )
                .join('')}
            </div>
            <span class="shop-card__more">詳細を見る →</span>
          </div>
        </a>`
        )
        .join('\n');
      return `
      <section class="brand-section" style="--brand-color: ${brand.color};">
        <div class="brand-section__header">
          <h2 class="brand-section__title">${escapeHtml(brand.label)}</h2>
          <p class="brand-section__tagline">${escapeHtml(brand.tagline || '')}</p>
        </div>
        <div class="shop-grid">
          ${cards}
        </div>
      </section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>店舗一覧 | 採用情報 | スポーツマリオ</title>
  <meta name="description" content="スポーツマリオの募集店舗一覧。STAND ON、RUN & FITNESS、BASEBALL MARIO、MARIO SELECTなど、各店舗の募集要項をご確認いただけます。">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../shops.css">
</head>
<body class="shops-index-page">
${renderHeader('list')}

  <main>
    <section class="shops-hero">
      <div class="shops-hero__inner">
        <h1>募集店舗一覧</h1>
        <p>各店舗の特色と募集要項をご確認いただけます。気になる店舗から直接応募いただけます。</p>
      </div>
    </section>

    ${sections}
  </main>

${renderFooter()}
  <script src="../script.js"></script>
</body>
</html>
`;
}

// ---------- メイン処理 ----------

function main() {
  console.log('🏪 shops.json からページを生成します...');

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`❌ データファイルが見つかりません: ${DATA_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('❌ shops.json の JSON パースに失敗しました:', e.message);
    process.exit(1);
  }

  const { shops = [], brands = {} } = data;
  if (shops.length === 0) {
    console.warn('⚠️  店舗データが空です');
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // 各店舗詳細ページ
  let generated = 0;
  for (const shop of shops) {
    if (!shop.active) {
      console.log(`  ⏭  スキップ（非アクティブ）: ${shop.id}`);
      continue;
    }
    const html = renderShopPage(shop, brands);
    const outPath = path.join(OUT_DIR, `${shop.id}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  ✓ ${shop.id}.html`);
    generated++;
  }

  // 店舗一覧ページ
  const indexHtml = renderShopsIndex(shops, brands);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`  ✓ index.html`);

  console.log(`✅ 完了: ${generated} 店舗 + 一覧ページ を生成しました`);
}

main();
