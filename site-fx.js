/* site-fx.js — shared site-wide effects for the portfolio.
   Loaded as a classic script in <head>; exposes window.SiteFX.initSiteFx(component, config).
   Global (always on): scroll progress bar, back-to-top, page transitions + first-visit splash.
   Per-config: scramble [selectors], parallax [[selector, depth]], metrics {anchor, items:[{prop,to,suffix}]}.
   All chrome is appended to <body> (outside the render tree) so framework re-renders can't clobber it. */
(function () {
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INK = '#101012', LIME = '#CDF34E';

  function onScroll(fn) {
    window.addEventListener('scroll', fn, { passive: true });
    document.addEventListener('scroll', fn, true); // capture: catches inner scrollers too
    window.addEventListener('resize', fn);
  }
  function scrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  // ---------- Scroll progress bar ----------
  function initProgress() {
    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:' + INK +
      ';z-index:90000;pointer-events:none;transition:width .1s linear';
    document.body.appendChild(bar);
    var upd = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (scrollY() / h) * 100 : 0) + '%';
    };
    onScroll(upd); upd();
  }

  // ---------- Back to top ----------
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Back to top');
    btn.textContent = '\u2191';
    btn.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:90000;width:52px;height:52px;border:none;' +
      'background:' + INK + ';color:' + LIME + ';font-size:21px;font-weight:700;cursor:pointer;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));' +
      'opacity:0;pointer-events:none;transform:translateY(14px) skewX(-6deg);transition:opacity .25s,transform .25s;' +
      'box-shadow:0 10px 26px -10px rgba(0,0,0,.55)';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' }); });
    var upd = function () {
      var footer = document.querySelector('footer');
      var nearFooter = footer && footer.getBoundingClientRect().top < window.innerHeight - 40;
      var on = scrollY() > 600 && !nearFooter;
      btn.style.opacity = on ? '1' : '0';
      btn.style.pointerEvents = on ? 'auto' : 'none';
      btn.style.transform = 'translateY(' + (on ? '0' : '14px') + ') skewX(-6deg)';
    };
    onScroll(upd); upd();
    window.addEventListener('resize', upd);
  }

  // ---------- Page transitions: removed per request — links navigate normally ----------
  function initTransitions() {}

  // ---------- Text scramble ----------
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/<>=+';
  function scrambleEl(el) {
    var nodes = [];
    (function walk(n) {
      for (var i = 0; i < n.childNodes.length; i++) {
        var c = n.childNodes[i];
        if (c.nodeType === 3 && c.nodeValue.trim()) nodes.push(c);
        else if (c.nodeType === 1) walk(c);
      }
    })(el);
    if (!nodes.length) return;
    // Lock the element's box so width-varying glyphs can't reflow and resize the page.
    var lockH = el.getBoundingClientRect().height;
    var prevH = el.style.height, prevOf = el.style.overflow;
    el.style.height = lockH + 'px'; el.style.overflow = 'hidden';
    var remaining = nodes.length;
    nodes.forEach(function (node) {
      var fin = node.nodeValue, len = fin.length, dur = 520, t0 = Date.now();
      var iv = setInterval(function () {
        var k = Math.min(1, (Date.now() - t0) / dur), reveal = Math.floor(k * len);
        var out = '';
        for (var i = 0; i < len; i++) {
          var ch = fin[i];
          if (ch === ' ' || ch === '\n' || ch === '\t') { out += ch; continue; }
          out += (i < reveal) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        node.nodeValue = out;
        if (k >= 1) { clearInterval(iv); node.nodeValue = fin; if (--remaining === 0) { el.style.height = prevH; el.style.overflow = prevOf; } }
      }, 28);
    });
  }
  function initScramble(selectors) {
    if (REDUCE || !selectors) return;
    setTimeout(function () {
      selectors.forEach(function (sel) { var el = document.querySelector(sel); if (el) scrambleEl(el); });
    }, 200);
  }

  // ---------- Parallax ----------
  function initParallax(items) {
    if (REDUCE || !items || !items.length) return;
    var refs = items.map(function (it) {
      var el = document.querySelector(it[0]); if (!el) return null;
      var base = getComputedStyle(el).transform;
      return { el: el, depth: it[1], base: (base && base !== 'none') ? base + ' ' : '' };
    }).filter(Boolean);
    var ticking = false;
    var apply = function () {
      var y = scrollY();
      refs.forEach(function (r) { r.el.style.transform = r.base + 'translate3d(0,' + (y * r.depth).toFixed(1) + 'px,0)'; });
      ticking = false;
    };
    onScroll(function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } });
    apply();
  }

  // ---------- Animated metrics (state-driven via the component) ----------
  function initMetrics(component, cfg) {
    if (!cfg || !component) return;
    var anchor = document.querySelector(cfg.anchor);
    if (!anchor) return;
    var setOne = function (it, v) {
      var o = {}; o[it.prop] = Math.round(v) + (it.suffix || '');
      component.setState(o);
    };
    if (REDUCE) { cfg.items.forEach(function (it) { setOne(it, it.to); }); return; }
    var done = false;
    var run = function () {
      if (done) return;
      var r = anchor.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        done = true;
        cfg.items.forEach(function (it) {
          var t0 = Date.now(), dur = 1300;
          var iv = setInterval(function () {
            var k = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
            setOne(it, it.to * e);
            if (k >= 1) clearInterval(iv);
          }, 40);
        });
      }
    };
    onScroll(run); run();
  }

  // The page is rendered after load, so the browser's own jump to #anchor finds nothing and
  // leaves you at the top. Redo it once the content exists, and again as fonts/layout settle,
  // unless the visitor has started scrolling on their own.
  function initHashScroll() {
    var id = location.hash && decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var userMoved = false;
    var stop = function () { userMoved = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) {
      window.addEventListener(t, stop, { passive: true, once: true });
    });
    // Fonts and the headline scramble shift the layout for a moment, so for the first couple of
    // seconds re-align whenever the target drifts from where we put it.
    var t0 = Date.now(), landed = null;
    var tick = function () {
      var el = document.getElementById(id);
      if (userMoved || Date.now() - t0 > 2500) return;
      if (el) {
        var top = Math.round(el.getBoundingClientRect().top);
        if (top !== landed) {
          el.scrollIntoView({ block: 'start', behavior: 'instant' });
          landed = Math.round(el.getBoundingClientRect().top);
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  window.SiteFX = {
    initSiteFx: function (component, config) {
      config = config || {};
      try { initProgress(); } catch (e) {}
      try { initBackToTop(); } catch (e) {}
      try { initTransitions(); } catch (e) {}
      try { initScramble(config.scramble); } catch (e) {}
      try { initParallax(config.parallax); } catch (e) {}
      try { initMetrics(component, config.metrics); } catch (e) {}
      try { initHashScroll(); } catch (e) {}
    }
  };
})();
