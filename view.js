// view.js — robust popup binding using Typeform's embed API
(function () {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function whenTFReady(cb) {
    // Wait for the SDK to expose window.tf.createPopup
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
    var id = (typeof window.MD_TF_ID === 'string' && window.MD_TF_ID.trim()) ? window.MD_TF_ID.trim() : '';

    if (!id) {
      console.warn('[MarketDope] No Typeform ID available.');
      return;
    }

    whenTFReady(function () {
      // Build the popup once
      var popup = window.tf.createPopup(id, {
        medium: 'wordpress',
        size: 70, // % of viewport; matches data-tf-size
        // You can add more options if needed:
        // hideFooter: true, hideHeaders: true, autoClose: true, etc.
      });

      // Click targets: anchors or buttons you want to open the popup.
      // Add data-md-open-typeform to any CTA, or use class 'md-cta',
      // or link to #open-typeform.
      var selectors = [
        '[data-md-open-typeform]',
        'a.md-cta',
        'button.md-cta',
        'a[href*="#open-typeform"]',
        'button[href*="#open-typeform"]'
      ];
      var nodes = document.querySelectorAll(selectors.join(','));

      if (!nodes.length) {
        // As a safety net, delegate on the document (catches late-rendered CTAs)
        document.addEventListener('click', function (e) {
          var t = e.target.closest(selectors.join(','));
          if (t) {
            e.preventDefault();
            popup.toggle();
          }
        });
      } else {
        nodes.forEach(function (el) {
          el.addEventListener('click', function (e) {
            e.preventDefault();
            popup.toggle();
          });
        });
      }
    });
  });
})();
