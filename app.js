(function () {
  'use strict';
  var top = document.getElementById('top');
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');

  /* menu mobilne */
  function zamknij() {
    menu.classList.remove('otw');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otwórz menu');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', function () {
    var otw = !menu.classList.contains('otw');
    menu.classList.toggle('otw', otw);
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
    document.body.style.overflow = otw ? 'hidden' : '';
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('otw')) { zamknij(); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100) zamknij(); });

  /* cień nagłówka */
  var cien = function () { top.classList.toggle('cien', window.scrollY > 8); };
  window.addEventListener('scroll', cien, { passive: true }); cien();

  /* aktywna pozycja menu = bieżąca sekcja */
  var linki = [].slice.call(menu.querySelectorAll('a[href^="#"]'));
  var sekcje = linki.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.35, akt = null;
    sekcje.forEach(function (s) { if (s.offsetTop <= y) akt = s.id; });
    linki.forEach(function (a) {
      var on = akt && a.getAttribute('href') === '#' + akt;
      a.classList.toggle('akt', !!on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', spy, { passive: true }); spy();

  /* pasek na telefonie: dopiero po przewinięciu za przyciski pierwszego ekranu */
  var mob = document.getElementById('mob');
  var cta = document.querySelector('.hero-cta');
  var kontakt = document.getElementById('kontakt');
  var zaHero = false, wKontakcie = false;
  function pokaz() {
    var on = zaHero && !wKontakcie;
    mob.classList.toggle('widac', on);
    mob.setAttribute('aria-hidden', String(!on));
    [].forEach.call(mob.querySelectorAll('a'), function (a) { a.tabIndex = on ? 0 : -1; });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { zaHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; pokaz(); }).observe(cta);
    new IntersectionObserver(function (e) { wKontakcie = e[0].isIntersecting; pokaz(); }, { rootMargin: '0px 0px -30% 0px' }).observe(kontakt);
  }

  /* karuzele: palec (natywny scroll), mysz (przeciąganie), strzałki, licznik */
  [].forEach.call(document.querySelectorAll('[data-karuzela]'), function (k) {
    var tor = k.querySelector(':scope > .tor');
    var nav = k.querySelector(':scope > .kar-nav');
    if (!tor) return;
    var el = function () { return [].slice.call(tor.children); };
    var licz = nav && nav.querySelector('.kar-licz');
    var bp = nav && nav.querySelector('.kar-p'), bn = nav && nav.querySelector('.kar-n');
    function idx() {
      var c = el(), x = tor.scrollLeft, best = 0, d = 1e9;
      c.forEach(function (ch, i) { var dd = Math.abs(ch.offsetLeft - c[0].offsetLeft - x); if (dd < d) { d = dd; best = i; } });
      return best;
    }
    function odswiez() {
      var n = el().length, i = idx();
      var koniec = tor.scrollLeft + tor.clientWidth >= tor.scrollWidth - 4;
      if (koniec) i = n - 1;
      if (licz) licz.textContent = (i + 1) + ' / ' + n;
      if (bp) bp.disabled = tor.scrollLeft <= 2;
      if (bn) bn.disabled = koniec;
    }
    function idz(dir) {
      var c = el(), i = Math.max(0, Math.min(c.length - 1, idx() + dir));
      tor.scrollTo({ left: c[i].offsetLeft - c[0].offsetLeft, behavior: 'smooth' });
    }
    if (bp) bp.addEventListener('click', function (e) { e.preventDefault(); idz(-1); });
    if (bn) bn.addEventListener('click', function (e) { e.preventDefault(); idz(1); });
    tor.addEventListener('scroll', function () { window.requestAnimationFrame(odswiez); }, { passive: true });
    tor.setAttribute('tabindex', '0');
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(-1); }
    });
    /* przeciąganie myszą */
    var start = null, sl = 0, ruch = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      start = e.clientX; sl = tor.scrollLeft; ruch = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (start === null) return;
      var dx = e.clientX - start;
      if (!ruch && Math.abs(dx) > 5) { ruch = true; tor.classList.add('ciag'); }
      if (ruch) { tor.scrollLeft = sl - dx; e.preventDefault(); }
    });
    window.addEventListener('pointerup', function () {
      if (start === null) return;
      start = null;
      if (ruch) {
        var c = el(), x = tor.scrollLeft, best = 0, d = 1e9;
        c.forEach(function (ch, i) { var dd = Math.abs(ch.offsetLeft - c[0].offsetLeft - x); if (dd < d) { d = dd; best = i; } });
        tor.classList.remove('ciag');
        tor.scrollTo({ left: c[best].offsetLeft - c[0].offsetLeft, behavior: 'smooth' });
        setTimeout(function () { ruch = false; }, 50);
      }
    });
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); } }, true);
    tor.addEventListener('dragstart', function (e) { e.preventDefault(); });
    /* wewnętrzna karuzela w karcie nie przewija strony w bok */
    odswiez();
    window.addEventListener('resize', odswiez);
  });

  /* formularz pokazowy */
  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var info = form.querySelector('.form-info');
    info.hidden = false;
  });
})();
