(function () {
  'use strict';
  var top = document.getElementById('top');
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');

  /* menu mobilne */
  var pody = [].slice.call(menu.querySelectorAll('.pod-btn'));
  function zwinPody(oprocz) {
    pody.forEach(function (b) { if (b !== oprocz) { b.setAttribute('aria-expanded', 'false'); b.closest('.pod').classList.remove('otwarte'); } });
  }
  function zamknij() {
    menu.classList.remove('otw');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otwórz menu');
    document.body.style.overflow = '';
    zwinPody();
  }
  burger.addEventListener('click', function () {
    var otw = !menu.classList.contains('otw');
    menu.classList.toggle('otw', otw);
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
    document.body.style.overflow = otw ? 'hidden' : '';
    if (!otw) zwinPody();
  });
  /* podmenu: klik/dotyk rozwija (telefon i komputer), na komputerze także najechanie myszą */
  pody.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var otw = b.getAttribute('aria-expanded') !== 'true';
      zwinPody(b);
      b.setAttribute('aria-expanded', String(otw));
      b.closest('.pod').classList.toggle('otwarte', otw);
      /* po najechaniu myszą podmenu już jest widoczne - kliknięcie nie powinno go chować */
      if (!otw && !menu.classList.contains('otw') && b.closest('.pod').matches(':hover') && window.matchMedia('(hover:hover)').matches) { b.setAttribute('aria-expanded', 'true'); b.closest('.pod').classList.add('otwarte'); }
    });
  });
  document.addEventListener('click', function (e) { if (!menu.classList.contains('otw') && !e.target.closest('.pod')) zwinPody(); });
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    zamknij();
    /* po wyborze pozycji podmenu chowamy je (fokus nie trzyma go otwartego) */
    if (a.closest('.pod')) a.blur();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('otw')) { zamknij(); burger.focus(); return; }
    var otwarty = pody.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
    zwinPody();
    if (otwarty) otwarty.focus(); else if (menu.contains(document.activeElement)) document.activeElement.blur();
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100 && menu.classList.contains('otw')) zamknij(); });

  /* cień nagłówka */
  var cien = function () { top.classList.toggle('cien', window.scrollY > 8); };
  window.addEventListener('scroll', cien, { passive: true }); cien();

  /* aktywna pozycja menu = bieżąca sekcja (także pozycje podmenu i ich rodzic) */
  var linki = [].slice.call(menu.querySelectorAll('a[href^="#"]')).filter(function (a) { return a.getAttribute('href') !== '#top'; });
  var cele = [];
  linki.forEach(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el && cele.indexOf(el) < 0) cele.push(el);
  });
  function poz(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.35, akt = null, najb = -1;
    cele.forEach(function (el) { var t = poz(el); if (t <= y && t >= najb) { najb = t; akt = el; } });
    /* element zagnieżdżony (karta w sekcji) wygrywa z sekcją tylko, gdy jest bliżej */
    linki.forEach(function (a) {
      var on = akt && a.getAttribute('href') === '#' + akt.id;
      a.classList.toggle('akt', !!on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    [].forEach.call(menu.querySelectorAll('.pod'), function (p) { p.classList.toggle('akt', !!p.querySelector('a.akt')); });
  }
  window.addEventListener('scroll', spy, { passive: true }); window.addEventListener('resize', spy); spy();

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

  /* zdjęcia: bez menu kontekstowego i przeciągania (utrudnia kopiowanie) */
  document.addEventListener('contextmenu', function (e) { if (e.target.closest('img, picture, .fotki, .rys')) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });

  /* formularz pokazowy */
  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var info = form.querySelector('.form-info');
    info.hidden = false;
  });
})();
