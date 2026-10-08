// デモ用の疑似動作。サーバー・DB には一切つながず、画面上の表示だけを変える。
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  if (params.has('shot')) {
    // スクリーンショット撮影用: デモ用の部品を出さない。
    // Chrome のウィンドウは最小幅 500px のため、スマホ幅(390px)は zoom で拡大して撮る
    document.documentElement.classList.add('demo-shot');
    var zoom = parseFloat(params.get('zoom') || '1');
    if (zoom !== 1) document.documentElement.style.zoom = String(zoom);
    // zoom 中は 100vh の解釈がずれるため、画面の枠の高さはモックの枠の高さ(?h=)で指定する
    var frame = document.body.firstElementChild;
    if (frame && params.get('h')) frame.style.minHeight = params.get('h') + 'px';
    return;
  }

  var screen = document.body.getAttribute('data-screen') || '';
  var DEMO_MSG = 'デモ表示です。この操作は保存されません。';

  // ---- 画面一覧へ戻るボタン ----
  if (screen !== 'index') {
    var pill = document.createElement('a');
    pill.href = 'index.html';
    pill.className = 'demo-pill';
    pill.textContent = 'デモ版 · 画面一覧';
    pill.setAttribute('aria-label', 'デモ版の画面一覧へ戻る');
    document.body.appendChild(pill);
  }

  // ---- トースト ----
  var toastEl = document.createElement('div');
  toastEl.className = 'demo-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }
  window.demoToast = toast;

  function go(page, delay) {
    setTimeout(function () { location.href = page + '.html'; }, delay || 900);
  }

  function hhmm(offsetMin) {
    var d = new Date(Date.now() + (offsetMin || 0) * 60000);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function markDone(btn, label, msg) {
    btn.textContent = label;
    btn.style.background = '#0F766E';
    btn.style.color = '#FFFFFF';
    btn.style.borderColor = '#0F766E';
    btn.disabled = true;
    toast(msg || '記録しました(デモ)');
  }

  // [対象画面の接頭辞 or '', ボタン・リンクの文字列に含まれる語, 処理]
  var ACTIONS = [
    ['', 'Got it', function (b) { markDone(b, '✓ Confirmed ' + hhmm(), 'Confirmed. Ops can see your team has the update. (demo)'); }],
    ['OPS03', '確定する', function () { toast('変更を確定しました。チーム 8・担当者 26 人に通知しました(デモ)'); go('OPS07-changes', 1800); }],
    ['OPS03', '戻る', function () {
      document.querySelectorAll('[role="dialog"], [aria-hidden="true"][style*="rgba(16, 24, 40"]').forEach(function (el) { el.style.display = 'none'; });
      toast('影響プレビューを閉じました(デモ)');
    }],
    ['OPS04', '全体中断を確定', function () { toast('全体中断を確定しました。全員に緊急通知を送りました(デモ)'); go('PUB02-emergency', 1800); }],
    ['OPS06', '口頭で確認済み', function (b) { markDone(b, '✓ 口頭で確認済み', 'Team Liaison による口頭確認を記録しました(デモ)'); }],
    ['OPS06', 'Liaison を呼ぶ', function () { toast('Team Liaison に呼び出しを送りました(デモ)'); }],
    ['OPS08', '記録する', function () { toast('WBGT を記録しました(デモ)'); }],
    ['OPS08', '雷鳴を確認', function () { toast('最後の雷鳴 ' + hhmm() + ' · 再開可能 ' + hhmm(30) + '(デモ)'); }],
    ['AUTH01', 'login link', function () { go('AUTH02-sent', 200); }],
    ['AUTH03', 'This is me', function () { go('P01-team', 200); }],
    ['BUY03', '支払いへ進む', function () { toast('Stripe の決済画面へ移ります(デモでは省略)'); go('BUY04-order', 1500); }],
    ['TEAM08', 'Pay', function () { toast('Opens the Stripe payment page (skipped in demo)'); }],
    ['BOX02', '引き渡し済み', function (b) { markDone(b, '✓ 引き渡しを記録しました', '引き渡しを記録しました(デモ)'); }],
    ['P02', 'Check in', function (b) { markDone(b, '✓ Checked in ' + hhmm(), 'Checked in (demo)'); }],
    ['STAFF01', 'Next', function () { go('STAFF02-status', 200); }],
    ['ADM03', '承認', function (b) { markDone(b, '✓ 承認しました', 'ロースター変更を承認しました(デモ)'); }],
    ['ADM05', '承認', function (b) { markDone(b, '✓ 承認', '応募を承認しました(デモ)'); }]
  ];

  function findAction(label) {
    for (var i = 0; i < ACTIONS.length; i++) {
      var a = ACTIONS[i];
      if (a[0] && screen.indexOf(a[0]) !== 0) continue;
      if (label.indexOf(a[1]) !== -1) return a[2];
    }
    return null;
  }

  // タブ: 同じ tablist の中で選択中の見た目を入れ替える
  function selectTab(tab) {
    var list = tab.closest('[role="tablist"]');
    if (!list) return;
    var current = list.querySelector('[role="tab"][aria-selected="true"]');
    if (!current || current === tab) return;
    var s = current.getAttribute('style');
    current.setAttribute('style', tab.getAttribute('style'));
    tab.setAttribute('style', s);
    current.setAttribute('aria-selected', 'false');
    tab.setAttribute('aria-selected', 'true');
    toast('表示を切り替えました(デモでは中身は変わりません)');
  }

  // 数量ボタン(「増やす」「減らす」)
  function step(btn, delta) {
    var box = btn.parentElement;
    var num = box && Array.prototype.find.call(box.children, function (el) { return /^\d+$/.test(el.textContent.trim()); });
    if (!num) return false;
    num.textContent = String(Math.max(0, parseInt(num.textContent, 10) + delta));
    return true;
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('button, a[href="#"], a[href=""]');
    // data-demo-skip: ページ側が自前で動きを持つ部品(スコア入力など)
    if (!el || el.classList.contains('demo-pill') || el.hasAttribute('data-demo-skip')) return;
    if (el.tagName === 'A') e.preventDefault();
    if (el.disabled) return;

    if (el.getAttribute('role') === 'tab') { selectTab(el); return; }

    var aria = el.getAttribute('aria-label') || '';
    if (/増やす/.test(aria) && step(el, 1)) return;
    if (/減らす/.test(aria) && step(el, -1)) return;

    var label = (el.textContent || '').replace(/\s+/g, ' ').trim();
    var action = findAction(label);
    if (action) { action(el); return; }

    if (el.hasAttribute('aria-pressed')) {
      var on = el.getAttribute('aria-pressed') === 'true';
      el.setAttribute('aria-pressed', on ? 'false' : 'true');
      el.style.outline = on ? '' : '3px solid #FEC84B';
    }
    toast(DEMO_MSG);
  });

  document.addEventListener('submit', function (e) {
    e.preventDefault();
    toast(DEMO_MSG);
  });
})();
