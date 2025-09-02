// view.js — robust popup binding using Typeform's Embed SDK with DOMAIN support
(function () {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function whenTFReady(cb) {
    if (window.tf && typeof window.tf.createPopup === 'function') return cb();
    let tries = 0;
    const iv = setInterval(() => {
      if (window.tf && typeof window.tf.createPopup === 'function') {
        clearInterval(iv);
        cb();
      } else if (++tries > 60) {
        clearInterval(iv);
        console.warn('[MarketDope] Typeform SDK not ready.');
      }
    }, 100);
  }

  onReady(function () {
    var cfg = (window.MD_TF && typeof window.MD_TF === 'object') ? window.MD_TF : {};
    var id  = (cfg.id || '').trim();
    var dom = (cfg.domain || 'https://form.typeform.com').trim();

    if (!id) {
      console.warn('[MarketDope] No Typeform ID available.');
      return;
    }

    whenTFReady(function () {
      // Build popup WITH domain — critical for custom domains (yourbrand.typeform.com)
      var popup = window.tf.createPopup(id, {
        domain: dom,         // <— key fix
        medium: 'wordpress',
        size: 70,
        // keepSession: true, // optional
      });

      // CTAs that should open the popup
      var selectors = [
        '[data-md-open-typeform]',
        'a.md-cta',
        'button.md-cta',
        'a[href*="#open-typeform"]',
        'button[href*="#open-typeform"]'
      ];
      var nodes = document.querySelectorAll(selectors.join(','));

      function attach(el) {
        el.addEventListener('click', function (e) {
          // Don’t interrupt modified-clicks on anchors
          if (el.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
          e.preventDefault();
          popup.toggle();
        });
      }

      if (nodes.length) {
        nodes.forEach(attach);
      }

      // Safety: delegate for late-rendered CTAs
      document.addEventListener('click', function (e) {
        var t = e.target && e.target.closest && e.target.closest(selectors.join(','));
        if (t) {
          if (t.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
          e.preventDefault();
          popup.toggle();
        }
      });
    });
  });
})();
