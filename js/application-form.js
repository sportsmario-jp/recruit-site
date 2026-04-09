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

  // URL パラメータから店舗ID / カテゴリを初期セット
  try {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const query = new URLSearchParams(hash.split('?')[1]);
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
    }
  } catch (e) {
    console.warn('URL パラメータの解析に失敗:', e);
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
