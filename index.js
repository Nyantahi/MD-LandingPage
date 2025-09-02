/* global wp */
(function () {
  'use strict';

  var registerBlockType = wp.blocks.registerBlockType;
  var el = wp.element.createElement;
  var Fragment = wp.element.Fragment;
  var be = wp.blockEditor || wp.editor;
  var RichText = be.RichText;
  var InspectorControls = be.InspectorControls;
  var URLInput = be.URLInput || be.URLInputButton;
  var useBlockProps = be.useBlockProps;
  var PanelBody = wp.components.PanelBody;
  var TextControl = wp.components.TextControl;
  var Button = wp.components.Button;

  function clone(arr) { try { return JSON.parse(JSON.stringify(arr || [])); } catch (e) { return []; } }
  function updateArrayItem(attrs, setAttrs, key, index, field, value) {
    var next = clone(attrs[key]); next[index] = Object.assign({}, next[index] || {}, (function(){var o={};o[field]=value;return o;})());
    var o={}; o[key]=next; setAttrs(o);
  }
  function addItem(attrs, setAttrs, key, template) { var n=clone(attrs[key]); n.push(template); var o={}; o[key]=n; setAttrs(o); }
  function removeItem(attrs, setAttrs, key, index) { var n=clone(attrs[key]); n.splice(index,1); var o={}; o[key]=n; setAttrs(o); }

  function MetricsEditor(props) {
    var attrs = props.attrs, setAttrs = props.setAttrs;
    return el('div', { className: 'metrics-row' },
      clone(attrs.metrics).map(function (m, i) {
        return el('div', { className: 'metric-card', key: 'm' + i, style: { padding: '8px', border: '1px dashed #ddd', borderRadius: '6px' } },
          el('div', { className: 'metric-value' }, el(RichText, { value: m.value, allowedFormats: [], onChange: function (v) { updateArrayItem(attrs, setAttrs, 'metrics', i, 'value', v); } })),
          el('div', { className: 'metric-label' }, el(RichText, { value: m.label, allowedFormats: [], onChange: function (v) { updateArrayItem(attrs, setAttrs, 'metrics', i, 'label', v); } })),
          el(Button, { isDestructive: true, onClick: function () { removeItem(attrs, setAttrs, 'metrics', i); }, style: { marginTop: '6px' } }, 'Remove')
        );
      })
    );
  }

  function CardsEditor(props) {
    var attrs = props.attrs, setAttrs = props.setAttrs, key = props.keyName, classBase = props.classBase;
    return el('div', { className: classBase },
      clone(attrs[key]).map(function (item, i) {
        var iconClass = classBase.indexOf('services') > -1 ? 'service-icon' : (classBase.indexOf('audience') > -1 ? 'audience-icon' : 'why-icon');
        var titleClass = classBase.indexOf('services') > -1 ? 'service-title' : (classBase.indexOf('audience') > -1 ? 'audience-title' : '');
        var cardClass = classBase.replace('-grid', '-card');
        return el('div', { className: cardClass, key: key + i },
          el('div', { className: iconClass }, el(RichText, { value: item.icon, allowedFormats: [], onChange: function (v) { updateArrayItem(attrs, setAttrs, key, i, 'icon', v); } })),
          el(RichText, { tagName: 'h3', className: titleClass, value: item.title, allowedFormats: [], onChange: function (v) { updateArrayItem(attrs, setAttrs, key, i, 'title', v); } }),
          el(RichText, { tagName: 'p', className: classBase.indexOf('services') > -1 ? 'service-description' : '', value: item.desc, onChange: function (v) { updateArrayItem(attrs, setAttrs, key, i, 'desc', v); } }),
          el(Button, { isDestructive: true, onClick: function () { removeItem(attrs, setAttrs, key, i); } }, 'Remove')
        );
      })
    );
  }

  registerBlockType('marketdope/landing-nobuild', {
    title: 'MarketDope Landing (No-Build)',
    icon: 'layout',
    category: 'design',
    supports: { align: true },

    edit: function (props) {
      var attrs = props.attributes;
      var setAttrs = props.setAttributes;
      var blockProps = useBlockProps({ className: 'marketdope-landing' });

      return el(Fragment, {},
        el(InspectorControls, {},
          el(PanelBody, { title: 'Hero' },
            el(TextControl, { label: 'CTA Link', value: attrs.ctaHref, onChange: function (v) { setAttrs({ ctaHref: v }); } })
          ),
          el(PanelBody, { title: 'Metrics' },
            el(Button, { variant: 'secondary', onClick: function () { addItem(attrs, setAttrs, 'metrics', { value: '0', label: 'Metric' }); } }, 'Add Metric')
          ),
          el(PanelBody, { title: 'Services' },
            el(TextControl, { label: 'Section Title', value: attrs.servicesTitle, onChange: function (v) { setAttrs({ servicesTitle: v }); } }),
            el(Button, { variant: 'secondary', onClick: function () { addItem(attrs, setAttrs, 'services', { icon: '⭐', title: 'Service', desc: 'Description' }); } }, 'Add Service')
          ),
          el(PanelBody, { title: 'Audience' },
            el(TextControl, { label: 'Section Title', value: attrs.audienceTitle, onChange: function (v) { setAttrs({ audienceTitle: v }); } }),
            el(Button, { variant: 'secondary', onClick: function () { addItem(attrs, setAttrs, 'audience', { icon: '👤', title: 'Audience', desc: 'Description' }); } }, 'Add Audience')
          ),
          el(PanelBody, { title: 'Why Us' },
            el(TextControl, { label: 'Section Title', value: attrs.whyTitle, onChange: function (v) { setAttrs({ whyTitle: v }); } }),
            el(Button, { variant: 'secondary', onClick: function () { addItem(attrs, setAttrs, 'why', { icon: '✨', title: 'Reason', desc: 'Description' }); } }, 'Add Why Card'),
            el(TextControl, { label: 'Secondary CTA Link', value: attrs.secondaryCtaHref, onChange: function (v) { setAttrs({ secondaryCtaHref: v }); } })
          ),
          el(PanelBody, { title: 'Testimonial' },
            el(TextControl, { label: 'Title', value: attrs.testimonialTitle, onChange: function (v) { setAttrs({ testimonialTitle: v }); } })
          ),
          el(PanelBody, { title: 'Final CTA' },
            el(TextControl, { label: 'CTA Link', value: attrs.finalCtaHref, onChange: function (v) { setAttrs({ finalCtaHref: v }); } })
          ),
          el(PanelBody, { title: 'Typeform' },
            el(TextControl, { label: 'Typeform ID (from data-tf-live)', value: attrs.typeformId, onChange: function (v) { setAttrs({ typeformId: v }); } })
          )
        ),

        el('div', blockProps,
          el('section', { className: 'hero' },
            el('div', { className: 'container' },
              el(RichText, { tagName: 'h1', value: attrs.headline, allowedFormats: [], onChange: function (v) { setAttrs({ headline: v }); } }),
              el(RichText, { tagName: 'p', className: 'subheadline', value: attrs.subheadline, allowedFormats: [], onChange: function (v) { setAttrs({ subheadline: v }); } }),
              el('div', {},
                el(RichText, { tagName: 'a', className: 'cta-button', value: attrs.ctaText, allowedFormats: [], onChange: function (v) { setAttrs({ ctaText: v }); } }),
                el('div', { style: { marginTop: '8px' } }, el(URLInput, { value: attrs.ctaHref, onChange: function (url) { setAttrs({ ctaHref: url }); } }))
              ),
              el('div', { className: 'dashboard-mockup' },
                el('div', { className: 'dashboard-screen' },
                  el('div', { className: 'chart-placeholder' }, '📈 Live Trading Dashboard'),
                  el(MetricsEditor, { attrs: attrs, setAttrs: setAttrs })
                )
              )
            )
          ),

          el('section', { className: 'section' },
            el('div', { className: 'container' },
              el(RichText, { tagName: 'h2', className: 'section-title', value: attrs.servicesTitle, allowedFormats: [], onChange: function (v) { setAttrs({ servicesTitle: v }); } }),
              el(CardsEditor, { attrs: attrs, setAttrs: setAttrs, keyName: 'services', classBase: 'services-grid' })
            )
          ),

          el('section', { className: 'section' },
            el('div', { className: 'container' },
              el(RichText, { tagName: 'h2', className: 'section-title', value: attrs.audienceTitle, allowedFormats: [], onChange: function (v) { setAttrs({ audienceTitle: v }); } }),
              el(CardsEditor, { attrs: attrs, setAttrs: setAttrs, keyName: 'audience', classBase: 'audience-grid' })
            )
          ),

          el('section', { className: 'section' },
            el('div', { className: 'container' },
              el(RichText, { tagName: 'h2', className: 'section-title', value: attrs.whyTitle, allowedFormats: [], onChange: function (v) { setAttrs({ whyTitle: v }); } }),
              el(CardsEditor, { attrs: attrs, setAttrs: setAttrs, keyName: 'why', classBase: 'why-us-grid' }),
              el('div', { style: { textAlign: 'center', marginTop: '50px' } },
                el(RichText, { tagName: 'a', className: 'cta-button', value: attrs.secondaryCtaText, allowedFormats: [], onChange: function (v) { setAttrs({ secondaryCtaText: v }); } }),
                el('div', { style: { marginTop: '8px' } }, el(URLInput, { value: attrs.secondaryCtaHref, onChange: function (url) { setAttrs({ secondaryCtaHref: url }); } }))
              )
            )
          ),

          el('section', { className: 'section testimonial-section' },
            el('div', { className: 'container' },
              el(RichText, { tagName: 'h2', className: 'section-title', value: attrs.testimonialTitle, allowedFormats: [], onChange: function (v) { setAttrs({ testimonialTitle: v }); } }),
              el('div', { className: 'testimonial-card' },
                el(RichText, { tagName: 'p', className: 'testimonial-text', value: attrs.testimonialText, onChange: function (v) { setAttrs({ testimonialText: v }); } }),
                el(RichText, { tagName: 'p', className: 'testimonial-author', value: attrs.testimonialAuthor, allowedFormats: [], onChange: function (v) { setAttrs({ testimonialAuthor: v }); } })
              )
            )
          ),

          el('section', { className: 'final-cta' },
            el('div', { className: 'container' },
              el(RichText, { tagName: 'h2', value: attrs.finalTitle, allowedFormats: [], onChange: function (v) { setAttrs({ finalTitle: v }); } }),
              el(RichText, { tagName: 'p', value: attrs.finalText, onChange: function (v) { setAttrs({ finalText: v }); } }),
              el('div', {},
                el(RichText, { tagName: 'a', className: 'cta-button', value: attrs.finalCtaText, allowedFormats: [], onChange: function (v) { setAttrs({ finalCtaText: v }); } }),
                el('div', { style: { marginTop: '8px' } }, el(URLInput, { value: attrs.finalCtaHref, onChange: function (url) { setAttrs({ finalCtaHref: url }); } }))
              ),
              el(RichText, { tagName: 'p', value: attrs.finalSub, onChange: function (v) { setAttrs({ finalSub: v }); } })
            )
          )
        )
      );
    },

    save: function (props) {
      var a = props.attributes;
      var blockProps = be.useBlockProps.save({
        className: 'marketdope-landing',
        'data-typeform-id': a.typeformId || ''
      });

      function cta(text, href, id) {
        return el('a',
          {
            className: 'cta-button',
            href: href || '#',
            role: 'button',
            'data-href': href || '#',
            'data-tf-popup': id || '',
            'data-tf-size': '70',
            'aria-haspopup': 'dialog'
          },
          el(RichText.Content, { value: text }),
          el('span', { className: 'sr-only', 'data-tf-popup': id || '' })
        );
      }

      return el('div', blockProps,
        el('section', { className: 'hero' },
          el('div', { className: 'container' },
            el(RichText.Content, { tagName: 'h1', value: a.headline }),
            el(RichText.Content, { tagName: 'p', className: 'subheadline', value: a.subheadline }),
            cta(a.ctaText, a.ctaHref, a.typeformId),
            el('div', { className: 'dashboard-mockup' },
              el('div', { className: 'dashboard-screen' },
                el('div', { className: 'chart-placeholder' }, '📈 Live Trading Dashboard'),
                el('div', { className: 'metrics-row' },
                  (a.metrics || []).map(function (m, i) {
                    return el('div', { className: 'metric-card', key: 'm' + i },
                      el('div', { className: 'metric-value' }, el(RichText.Content, { value: m.value })),
                      el('div', { className: 'metric-label' }, el(RichText.Content, { value: m.label }))
                    );
                  })
                )
              )
            )
          )
        ),

        el('section', { className: 'section' },
          el('div', { className: 'container' },
            el(RichText.Content, { tagName: 'h2', className: 'section-title', value: a.servicesTitle }),
            el('div', { className: 'services-grid' },
              (a.services || []).map(function (s, i) {
                return el('div', { className: 'service-card', key: 's' + i },
                  el('div', { className: 'service-icon' }, el(RichText.Content, { value: s.icon })),
                  el(RichText.Content, { tagName: 'h3', className: 'service-title', value: s.title }),
                  el(RichText.Content, { tagName: 'p', className: 'service-description', value: s.desc })
                );
              })
            )
          )
        ),

        el('section', { className: 'section' },
          el('div', { className: 'container' },
            el(RichText.Content, { tagName: 'h2', className: 'section-title', value: a.audienceTitle }),
            el('div', { className: 'audience-grid' },
              (a.audience || []).map(function (u, i) {
                return el('div', { className: 'audience-card', key: 'u' + i },
                  el('div', { className: 'audience-icon' }, el(RichText.Content, { value: u.icon })),
                  el(RichText.Content, { tagName: 'h3', className: 'audience-title', value: u.title }),
                  el(RichText.Content, { tagName: 'p', value: u.desc })
                );
              })
            )
          )
        ),

        el('section', { className: 'section' },
          el('div', { className: 'container' },
            el(RichText.Content, { tagName: 'h2', className: 'section-title', value: a.whyTitle }),
            el('div', { className: 'why-us-grid' },
              (a.why || []).map(function (w, i) {
                return el('div', { className: 'why-card', key: 'w' + i },
                  el('div', { className: 'why-icon' }, el(RichText.Content, { value: w.icon })),
                  el(RichText.Content, { tagName: 'h3', value: w.title }),
                  el(RichText.Content, { tagName: 'p', value: w.desc })
                );
              })
            ),
            el('div', { style: { textAlign: 'center', marginTop: '50px' } },
              cta(a.secondaryCtaText, a.secondaryCtaHref, a.typeformId)
            )
          )
        ),

        el('section', { className: 'section testimonial-section' },
          el('div', { className: 'container' },
            el(RichText.Content, { tagName: 'h2', className: 'section-title', value: a.testimonialTitle }),
            el('div', { className: 'testimonial-card' },
              el(RichText.Content, { tagName: 'p', className: 'testimonial-text', value: a.testimonialText }),
              el(RichText.Content, { tagName: 'p', className: 'testimonial-author', value: a.testimonialAuthor })
            )
          )
        ),

        el('section', { className: 'final-cta' },
          el('div', { className: 'container' },
            el(RichText.Content, { tagName: 'h2', value: a.finalTitle }),
            el(RichText.Content, { tagName: 'p', value: a.finalText }),
            cta(a.finalCtaText, a.finalCtaHref, a.typeformId),
            el(RichText.Content, { tagName: 'p', value: a.finalSub })
          )
        )
      );
    }
  });
})();
