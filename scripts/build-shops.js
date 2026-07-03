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
          <li><a href="../index.html#numbers">NUMBERS<span class="nav-sub">数字で見る</span></a></li>
          <li><a href="../index.html#vision">VISION<span class="nav-sub">ビジョン</span></a></li>
          <li><a href="../index.html#reward">REWARD<span class="nav-sub">報酬制度</span></a></li>
          <li><a href="../index.html#fff">FFF<span class="nav-sub">働く楽しさ</span></a></li>
          <li><a href="../index.html#smsa">SMSA<span class="nav-sub">インフルエンサー</span></a></li>
          <li><a href="../index.html#career">CAREER<span class="nav-sub">キャリア</span></a></li>
          <li><a href="../index.html#work">WORK<span class="nav-sub">仕事内容</span></a></li>
          <li><a href="../index.html#people">PEOPLE<span class="nav-sub">社員紹介</span></a></li>
          <li><a href="index.html"${currentPage === 'list' ? ' class="nav-current"' : ''}>SHOPS<span class="nav-sub">募集店舗</span></a></li>
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
    <div class="container">
      <div class="footer-inner">
        <div class="footer-logo">
          <img src="../images/logo-footer.svg" alt="SPORTS MARIO" class="footer-logo-img">
        </div>
        <nav class="footer-nav">
          <a href="https://sportsmario.co.jp/" target="_blank" rel="noopener">コーポレートサイト</a>
          <a href="https://www.sportsmario.net/" target="_blank" rel="noopener">公式通販サイト</a>
          <a href="https://www.instagram.com/sportsmario_official/" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.sportsmario.net/p/about/privacy-policy" target="_blank" rel="noopener">プライバシーポリシー</a>
        </nav>
        <p class="footer-copy">&copy; 2026 Sports Mario Inc. All Rights Reserved.</p>
      </div>
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
  // recruiting: false の場合は募集休止表示
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
  // 正社員(fulltime)は本部採用のため店舗ページには表示しない
  const jobsHtml = shop.jobs
    .filter((job) => job.type !== 'fulltime')
    .map(job => renderJob(job, shop.id))
    .join('\n');
  const appealHtml = shop.appeal
    .map((a) => `<li>${escapeHtml(a)}</li>`)
    .join('\n');

  // ヒーロー背景: 実写真がある場合は暗いオーバーレイ付きで適用、無ければCSS既定のグラデ
  const hasHeroPhoto = shop.images.hero && !shop.images.hero.includes('placeholder');
  const heroStyle = hasHeroPhoto
    ? `--brand-color: ${brand.color}; background: linear-gradient(rgba(15,15,15,0.55), rgba(15,15,15,0.78)), url('../${escapeHtml(shop.images.hero)}') center/cover no-repeat;`
    : `--brand-color: ${brand.color};`;

  const title = (shop.seo && shop.seo.title) || `${shop.name} | 採用情報 | スポーツマリオ`;
  const description =
    (shop.seo && shop.seo.description) || shop.description.slice(0, 120);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-PQPSNWBC');</script>
  <!-- End Google Tag Manager -->

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Favicon -->
  <link rel="icon" href="../images/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="../images/apple-touch-icon.png">

  <!-- OGP / Twitter Card -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://recruit.sportsmario.co.jp/shops/${escapeHtml(shop.id)}.html">
  <meta property="og:image" content="https://recruit.sportsmario.co.jp/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="スポーツマリオ採用情報">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://recruit.sportsmario.co.jp/images/og-image.jpg">

  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../shops.css">
</head>
<body class="shop-detail-page">
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PQPSNWBC"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
${renderHeader('detail')}

  <main class="shop-main">
    <section class="shop-hero${hasHeroPhoto ? ' shop-hero--photo' : ''}" style="${heroStyle}">
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
        <h2>この店舗のアルバイト・パート募集</h2>
        <div class="job-cards">
          ${jobsHtml}
        </div>
        <aside class="fulltime-notice">
          <p class="fulltime-notice__title">💼 正社員でのご応募について</p>
          <p class="fulltime-notice__text">正社員は<strong>本部採用</strong>のため、店舗単位での募集はおこなっていません。勤務地はご本人の希望を考慮した上で配属となります。</p>
          <div class="fulltime-notice__links">
            <a href="../graduate.html" class="fulltime-notice__link fulltime-notice__link--grad">新卒採用（2027年度）→</a>
            <a href="../index.html#entry" class="fulltime-notice__link fulltime-notice__link--career">中途・キャリア採用（通年）→</a>
          </div>
        </aside>
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

function renderNonStoreCard(pos) {
  const recruiting = pos.recruiting !== false;
  const statusBadge = recruiting
    ? ''
    : '<span class="shop-card__status">現在募集休止中</span>';
  const requirements = (pos.requirements || []).length
    ? `<dt>応募資格</dt><dd>${pos.requirements.map((r) => escapeHtml(r)).join('、')}</dd>`
    : '';
  const benefits = (pos.benefits || []).length
    ? `<dt>待遇</dt><dd>${pos.benefits.map((b) => escapeHtml(b)).join('、')}</dd>`
    : '';
  const category = encodeURIComponent('アルバイト・パート');
  const entryUrl = `../index.html?shop=${escapeHtml(pos.id)}&category=${category}#application-form-wrap`;
  const entryBtn = recruiting
    ? `<a href="${entryUrl}" class="job-entry-btn">この職種に応募する →</a>`
    : `<span class="job-entry-btn job-entry-btn--closed">現在この職種は募集を休止しています</span>`;
  return `
      <article class="non-store-card" data-recruiting="${recruiting}" data-dept="${escapeHtml(pos.department)}">
        ${statusBadge}
        <span class="non-store-card__dept">${escapeHtml(pos.departmentLabel)}</span>
        <h3 class="non-store-card__title">${escapeHtml(pos.position)}</h3>
        <dl class="non-store-card__meta">
          <dt>勤務地</dt><dd>${escapeHtml(pos.location)}</dd>
          <dt>給与</dt><dd>${escapeHtml(formatSalary(pos.salary))}</dd>
          <dt>勤務時間</dt><dd>${escapeHtml(pos.hours)}</dd>
          ${requirements}
          ${benefits}
        </dl>
        ${pos.description ? `<p class="non-store-card__desc">${escapeHtml(pos.description)}</p>` : ''}
        ${entryBtn}
      </article>`;
}

function renderShopsIndex(shops, brands, nonStorePositions = []) {
  const activeShops = shops.filter((s) => s.active);
  const activePositions = nonStorePositions.filter((p) => p.active !== false);

  // 店舗ごとに「アルバイト/パート枠で募集中の職種があるか」を判定
  const isShopRecruiting = (shop) =>
    shop.jobs.some((j) => j.type !== 'fulltime' && j.recruiting !== false);

  const recruitingCount = activeShops.filter(isShopRecruiting).length;
  const totalCount = activeShops.length;

  // 業態別にグループ化
  const grouped = {};
  for (const shop of activeShops) {
    if (!grouped[shop.brand]) grouped[shop.brand] = [];
    grouped[shop.brand].push(shop);
  }

  const sections = Object.entries(grouped)
    .map(([brandKey, shopsInBrand]) => {
      const brand = brands[brandKey] || { label: brandKey, color: '#00c853' };
      const brandHasRecruiting = shopsInBrand.some(isShopRecruiting);
      const cards = shopsInBrand
        .map((shop) => {
          const recruiting = isShopRecruiting(shop);
          const statusBadge = recruiting
            ? ''
            : '<span class="shop-card__status">現在募集休止中</span>';
          return `
        <a href="${escapeHtml(shop.id)}.html" class="shop-card" data-recruiting="${recruiting}" style="--brand-color: ${brand.color};">
          ${statusBadge}
          <div class="shop-card__image" style="background-image: url('../${escapeHtml(shop.images.hero)}');">
            <span class="shop-card__brand">${escapeHtml(brand.label)}</span>
          </div>
          <div class="shop-card__body">
            <h3 class="shop-card__name">${escapeHtml(shop.name)}</h3>
            <p class="shop-card__access">${escapeHtml(shop.access)}</p>
            <div class="shop-card__jobs">
              ${shop.jobs
                .filter((j) => j.type !== 'fulltime')
                .map(
                  (j) =>
                    `<span class="job-tag job-tag--${escapeHtml(j.type)}${j.recruiting === false ? ' job-tag--closed' : ''}">${escapeHtml(formatJobType(j.type))}${j.recruiting === false ? '（休止中）' : ''}</span>`
                )
                .join('')}
            </div>
            <span class="shop-card__more">詳細を見る →</span>
          </div>
        </a>`;
        })
        .join('\n');
      return `
      <section class="brand-section" data-has-recruiting="${brandHasRecruiting}" style="--brand-color: ${brand.color};">
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

  const filterUi = `
    <div class="shops-filter" data-recruiting-count="${recruitingCount}" data-total-count="${totalCount}">
      <div class="shops-filter__counts">
        <span class="shops-filter__count-main">募集中 <strong>${recruitingCount}</strong> 店舗</span>
        <span class="shops-filter__count-total">／ 全 ${totalCount} 店舗</span>
      </div>
      <div class="shops-filter__toggle" role="tablist">
        <button type="button" class="shops-filter__btn shops-filter__btn--active" data-filter="recruiting" role="tab" aria-selected="true">募集中のみ</button>
        <button type="button" class="shops-filter__btn" data-filter="all" role="tab" aria-selected="false">全店舗を見る</button>
      </div>
    </div>`;

  const filterScript = `
  <script>
  (function () {
    var list = document.querySelector('.shops-list');
    var btns = document.querySelectorAll('.shops-filter__btn');
    if (!list || !btns.length) return;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-filter');
        list.setAttribute('data-filter-mode', mode);
        btns.forEach(function (x) {
          var active = x === b;
          x.classList.toggle('shops-filter__btn--active', active);
          x.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      });
    });
  })();
  </script>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-PQPSNWBC');</script>
  <!-- End Google Tag Manager -->

  <title>店舗一覧 | 採用情報 | スポーツマリオ</title>
  <meta name="description" content="スポーツマリオの募集店舗一覧。STAND ON、RUN & FITNESS、BASEBALL MARIO、MARIO SELECTなど、各店舗の募集要項をご確認いただけます。">

  <!-- Favicon -->
  <link rel="icon" href="../images/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="../images/apple-touch-icon.png">

  <!-- OGP / Twitter Card -->
  <meta property="og:title" content="店舗一覧 | 採用情報 | スポーツマリオ">
  <meta property="og:description" content="スポーツマリオの募集店舗一覧。各店舗の特色と募集要項をご確認いただけます。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://recruit.sportsmario.co.jp/shops/">
  <meta property="og:image" content="https://recruit.sportsmario.co.jp/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="スポーツマリオ採用情報">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://recruit.sportsmario.co.jp/images/og-image.jpg">

  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../shops.css">
</head>
<body class="shops-index-page">
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PQPSNWBC"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
${renderHeader('list')}

  <main>
    <section class="shops-hero">
      <div class="shops-hero__inner">
        <h1>募集店舗一覧</h1>
        <p>このページでは<strong>アルバイト・パートの募集店舗</strong>をご紹介しています。気になる店舗から直接応募いただけます。</p>
        <aside class="shops-hero__notice">
          <p class="shops-hero__notice-title">💼 正社員でのご応募について</p>
          <p class="shops-hero__notice-text">正社員は<strong>本部採用</strong>のため、店舗指定の募集はおこなっていません。下記からご応募ください。</p>
          <div class="shops-hero__notice-links">
            <a href="../graduate.html" class="shops-hero__notice-link shops-hero__notice-link--grad">新卒採用（2027年度）→</a>
            <a href="../index.html#entry" class="shops-hero__notice-link shops-hero__notice-link--career">中途・キャリア採用（通年）→</a>
          </div>
        </aside>
      </div>
    </section>

    ${filterUi}

    <div class="shops-list" data-filter-mode="recruiting">
      ${sections}
      ${
        activePositions.length > 0
          ? `
      <section class="non-store-section" data-has-recruiting="${activePositions.some((p) => p.recruiting !== false)}">
        <div class="brand-section__header">
          <h2 class="brand-section__title">店舗以外のポジション</h2>
          <p class="brand-section__tagline">EC事業部・本社オフィスでのアルバイト・パート募集</p>
        </div>
        <div class="non-store-grid">
          ${activePositions.map(renderNonStoreCard).join('\n')}
        </div>
      </section>`
          : ''
      }
    </div>
  </main>

${renderFooter()}
  <script src="../script.js"></script>
${filterScript}
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

  const { shops = [], brands = {}, nonStorePositions = [] } = data;
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
  const indexHtml = renderShopsIndex(shops, brands, nonStorePositions);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`  ✓ index.html`);

  console.log(`✅ 完了: ${generated} 店舗 + 一覧ページ を生成しました`);
}

main();
