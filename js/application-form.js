/**
 * 応募フォーム: 送信ハンドリング・カテゴリ切替・バリデーション
 */
(function () {
  'use strict';

  const CONFIG = window.SMSA_CONFIG || {};
  const form = document.getElementById('application-form');
  if (!form) return;

  const categorySelect = document.getElementById('app-category');
  const statusBox = document.getElementById('app-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const formStartTime = Date.now();

  // カテゴリ別の追加フィールドを表示/非表示
  const conditionalGroups = document.querySelectorAll('[data-show-for]');

  function updateConditionalFields() {
    const category = categorySelect.value;
    conditionalGroups.forEach((el) => {
      const showFor = (el.getAttribute('data-show-for') || '').split(',').map((s) => s.trim());
      const shouldShow = showFor.includes(category) || showFor.includes('*');
      el.style.display = shouldShow ? '' : 'none';
      // 非表示フィールドは必須から外す
      el.querySelectorAll('input,select,textarea').forEach((input) => {
        if (shouldShow && input.dataset.originalRequired === 'true') {
          input.required = true;
        } else if (!shouldShow) {
          if (input.required) input.dataset.originalRequired = 'true';
          input.required = false;
        }
      });
    });
    // 正社員系カテゴリの場合、店舗欄に注釈を表示
    const shopNote = document.querySelector('.shop-note-fulltime');
    if (shopNote) {
      const isFulltime = ['新卒採用', '中途・キャリア採用'].includes(category);
      shopNote.style.display = isFulltime ? '' : 'none';
    }
  }

  if (categorySelect) {
    // 初期状態を記録
    conditionalGroups.forEach((el) => {
      el.querySelectorAll('input,select,textarea').forEach((input) => {
        if (input.required) input.dataset.originalRequired = 'true';
      });
    });
    updateConditionalFields();
    categorySelect.addEventListener('change', updateConditionalFields);
  }

  // 応募区分カードクリック → 区分を自動選択 + 店舗リセット + フォームへスクロール
  document.querySelectorAll('[data-category-select]').forEach((card) => {
    card.addEventListener('click', function () {
      const category = this.getAttribute('data-category-select');
      if (!category || !categorySelect) return;
      categorySelect.value = category;
      // カードクリック = TOPページからの応募なので店舗選択をリセット
      const shopInput = document.getElementById('app-shopId');
      if (shopInput) shopInput.value = '';
      updateConditionalFields();
      // フォーム先頭までスムーズスクロール
      const target = document.querySelector('.application-form-wrap') || form;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 視覚的フィードバック（カテゴリ選択欄を一瞬ハイライト）
      categorySelect.classList.add('highlight-flash');
      setTimeout(() => categorySelect.classList.remove('highlight-flash'), 1200);
    });
  });

  // URL パラメータから店舗ID / カテゴリを初期セット
  try {
    // ?shop=xxx#entry 形式（推奨）と #entry?shop=xxx 形式（後方互換）の両方に対応
    let query = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (!query.has('shop') && !query.has('category') && hash.includes('?')) {
      query = new URLSearchParams(hash.split('?')[1]);
    }
    const shopId = query.get('shop');
    const category = query.get('category');
    if (shopId) {
      const shopInput = document.getElementById('app-shopId');
      if (shopInput) shopInput.value = shopId;
    }
    if (category && categorySelect) {
      categorySelect.value = category;
      updateConditionalFields();
    }
  } catch (e) {
    console.warn('URL パラメータの解析に失敗:', e);
  }

  // WEB説明会の水曜日日程を自動生成（次の水曜から8週分・当日と除外日は含まない）
  // 除外したい日付（YYYY-MM-DD 形式）。担当者都合等で開催できない週はここに追加する。
  const EXCLUDED_SEMINAR_DATES = [
    '2026-06-10', // 担当者予定あり
  ];
  const seminarSelect = document.getElementById('app-seminarDate');
  if (seminarSelect) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 日付単位で比較するため時刻リセット
    // 今日含めず次の水曜日までの日数（今日が水曜なら 7、それ以外は 1〜6）
    const daysUntilNextWed = ((3 - today.getDay() + 7) % 7) || 7;
    const firstWed = new Date(today);
    firstWed.setDate(today.getDate() + daysUntilNextWed);

    const cutoff = new Date('2026-08-31');
    let added = 0;
    // 除外日があっても 8 件表示するため最大 16 週まで走査
    for (let i = 0; i < 16 && added < 8; i++) {
      const wed = new Date(firstWed);
      wed.setDate(firstWed.getDate() + i * 7);
      if (wed > cutoff) break;
      const m = wed.getMonth() + 1;
      const dd = wed.getDate();
      const value = `${wed.getFullYear()}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
      if (EXCLUDED_SEMINAR_DATES.includes(value)) continue;
      const label = `${m}月${dd}日（水）15:00〜`;
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      seminarSelect.appendChild(opt);
      added++;
    }
  }

  // ステータス表示
  function showStatus(type, message) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = `form-status form-status--${type}`;
    statusBox.style.display = 'block';
    statusBox.setAttribute('role', type === 'error' ? 'alert' : 'status');
    if (type === 'success') {
      setTimeout(() => statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.style.display = 'none';
    statusBox.textContent = '';
    statusBox.className = 'form-status';
  }

  // 送信処理
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    // 個人情報同意チェック（novalidate のため明示的に検証）
    const consentInput = form.querySelector('input[name="consent"]');
    if (consentInput && !consentInput.checked) {
      showStatus('error', '「個人情報の取り扱いに同意します」にチェックを入れてください。');
      consentInput.focus();
      return;
    }

    // honeypot フィールドチェック（ボット対策）
    const honeypot = form.querySelector('input[name="_honeypot"]');
    if (honeypot && honeypot.value) {
      console.warn('honeypot filled — bot detected');
      return;
    }

    // 最低入力時間チェック（ボット対策）
    const elapsed = Date.now() - formStartTime;
    const minTime = CONFIG.MIN_FILL_TIME_MS || 3000;
    if (elapsed < minTime) {
      showStatus('error', '入力が早すぎます。もう一度お試しください。');
      return;
    }

    // エンドポイント確認
    if (!CONFIG.FORM_ENDPOINT) {
      showStatus(
        'error',
        'フォームの送信先が設定されていません。サイト管理者に連絡してください。'
      );
      console.error('FORM_ENDPOINT が設定されていません。js/config.js を確認してください。');
      return;
    }

    // FormData → JSON
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      if (key.startsWith('_')) return; // honeypot等の内部フィールドは除外
      payload[key] = value;
    });
    payload.userAgent = navigator.userAgent;
    payload.submittedAt = new Date().toISOString();

    // 送信中のUI
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = '送信中...';
    showStatus('loading', '送信中です。しばらくお待ちください...');

    try {
      const response = await fetch(CONFIG.FORM_ENDPOINT, {
        method: 'POST',
        // GAS の doPost は CORS プリフライトを避けるため text/plain を推奨
        // JSON.stringify したボディは Apps Script 側で JSON.parse する
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      // GAS は常に 200 を返し、ボディで成否を判断
      const result = await response.json().catch(() => ({ status: 'error', message: 'レスポンス解析エラー' }));

      if (result.status === 'ok') {
        // GTM: エントリーフォーム送信成功イベント（コンバージョン計測用）
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'event': 'entry_form_success' });

        showStatus('success', CONFIG.SUCCESS_MESSAGE || '応募を受け付けました。');
        form.reset();
        updateConditionalFields();
        submitBtn.textContent = '送信完了 ✓';
      } else {
        throw new Error(result.message || '不明なエラー');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', `${CONFIG.ERROR_MESSAGE || '送信に失敗しました。'}\n(詳細: ${err.message})`);
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
})();
