/* Pearson Building lightbox. Opens a.pb-gallery__item links and any img[data-pb-full].
   Items sharing a data-pb-group value are browsed together with arrows, keys or swipe. */
(function () {
  'use strict';

  var ICONS = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'
  };

  var box, img, cap, count, items = [], index = 0, lastFocus = null, touchX = null, touchY = null;

  function itemFor(el) {
    var full = el.getAttribute('href') || el.getAttribute('data-pb-full');
    var pic = el.tagName === 'IMG' ? el : el.querySelector('img');
    var caption = el.getAttribute('data-pb-caption') || (pic && pic.getAttribute('alt')) || '';
    return { el: el, src: full, caption: caption };
  }

  function groupOf(el) {
    var name = el.getAttribute('data-pb-group');
    var all = document.querySelectorAll('a.pb-gallery__item, img[data-pb-full]');
    var list = [];
    for (var i = 0; i < all.length; i++) {
      if ((all[i].getAttribute('data-pb-group') || '') === (name || '') && (name || all[i] === el)) {
        list.push(itemFor(all[i]));
      }
    }
    return list;
  }

  function build() {
    box = document.createElement('div');
    box.className = 'pb-lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<div class="pb-lb__stage"><img class="pb-lb__img" alt=""></div>' +
      '<div class="pb-lb__bar"><p class="pb-lb__cap"></p><span class="pb-lb__count"></span></div>' +
      '<button type="button" class="pb-lb__prev" aria-label="Previous photo">' + ICONS.prev + '</button>' +
      '<button type="button" class="pb-lb__next" aria-label="Next photo">' + ICONS.next + '</button>' +
      '<button type="button" class="pb-lb__close" aria-label="Close">' + ICONS.close + '</button>';
    document.body.appendChild(box);
    img = box.querySelector('.pb-lb__img');
    cap = box.querySelector('.pb-lb__cap');
    count = box.querySelector('.pb-lb__count');

    box.querySelector('.pb-lb__prev').addEventListener('click', function () { go(-1); });
    box.querySelector('.pb-lb__next').addEventListener('click', function () { go(1); });
    box.querySelector('.pb-lb__close').addEventListener('click', close);
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('pb-lb__stage')) close();
    });
    img.addEventListener('load', function () { img.classList.remove('is-loading'); });

    box.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { touchX = null; return; }
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
      touchX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
    }, { passive: true });
  }

  function preload(i) {
    var it = items[(i + items.length) % items.length];
    if (it) { var p = new Image(); p.src = it.src; }
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    if (img.getAttribute('src') !== it.src) {
      img.classList.add('is-loading');
      img.src = it.src;
    }
    img.alt = it.caption;
    cap.textContent = it.caption;
    count.textContent = (index + 1) + ' / ' + items.length;
    if (items.length > 1) { preload(index + 1); preload(index - 1); }
  }

  function go(step) { if (items.length > 1) show(index + step); }

  function onKey(e) {
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowRight') { go(1); }
    else if (e.key === 'ArrowLeft') { go(-1); }
    else if (e.key === 'Tab') {
      var f = box.querySelectorAll('button:not([style*="display: none"])');
      var vis = [];
      for (var i = 0; i < f.length; i++) if (f[i].offsetParent !== null) vis.push(f[i]);
      if (!vis.length) return;
      var first = vis[0], last = vis[vis.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function open(el) {
    if (!box) build();
    items = groupOf(el);
    var start = 0;
    for (var i = 0; i < items.length; i++) if (items[i].el === el) start = i;
    box.classList.toggle('is-single', items.length < 2);
    lastFocus = document.activeElement;
    show(start);
    box.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    box.querySelector('.pb-lb__close').focus();
  }

  function close() {
    if (!box || !box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a.pb-gallery__item, img[data-pb-full]');
    if (!el || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    e.stopPropagation();
    open(el);
  }, true);

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('img[data-pb-full]')) {
      e.preventDefault();
      open(e.target);
    }
  });
})();
