(function(){
  function ensureTF(cb){
    if (window.tf && window.tf.createPopup) { cb(); return; }
    var s = document.createElement('script');
    s.src = "https://embed.typeform.com/next/embed.js";
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function getId(root, el){
    var id = '';
    if (el) {
      id = el.getAttribute('data-tf-popup') || '';
      if (!id) {
        var span = el.querySelector('[data-tf-popup]');
        if (span) id = span.getAttribute('data-tf-popup') || '';
      }
    }
    if (!id && root && root.dataset) id = root.dataset.typeformId || '';
    return id;
  }

  function wire(){
    var root = document.querySelector('.marketdope-landing');
    if (!root) return;

    root.addEventListener('click', function(e){
      var link = e.target.closest('.marketdope-landing .cta-button');
      if (!link) return;
      var href = link.getAttribute('href') || link.getAttribute('data-href') || '#';
      var id = getId(root, link);
      if (!id) return; // let normal link behavior continue

      e.preventDefault();
      ensureTF(function(){
        try {
          var popup = window.tf.createPopup(id, { size: 70, hideScrollbars: true });
          popup.open();
        } catch (err) {
          if (href && href !== '#') window.location.href = href;
        }
      });
    }, { passive: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();