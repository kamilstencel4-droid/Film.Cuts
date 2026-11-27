// Film.Cuts — menu, lišta, plynulé objevování a prohlížeč fotek
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- mobilní menu ---
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('mnav');
  if(btn && nav){
    var setMenu = function(open){ nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); btn.classList.toggle('is-open', open); };
    btn.addEventListener('click', function(){ setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
  }

  // --- jemná linka pod lištou po odscrollování ---
  var bar = document.querySelector('.topline');
  if(bar){
    var ticking = false;
    var onScroll = function(){ if(ticking) return; ticking = true; requestAnimationFrame(function(){ bar.classList.toggle('scrolled', window.scrollY > 8); ticking = false; }); };
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  }

  // --- obrázky se po načtení jemně objeví ---
  document.querySelectorAll('main img').forEach(function(img){
    if(img.complete && img.naturalWidth) return;
    img.classList.add('fade');
    var done = function(){ img.classList.add('loaded'); };
    img.addEventListener('load', done, {once:true});
    img.addEventListener('error', done, {once:true});
  });

  // --- plynulé objevování obsahu při scrollu ---
  if(!reduce && 'IntersectionObserver' in window){
    var targets = document.querySelectorAll('.sec-label, .sec-intro, .article, .plan, .portrait-grid, .gallery > a, .member, .contact-item, .story-body, .watch, .credit-block, .two-col > section, .essay-cols > section, .creators > div, .mezi-top');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    targets.forEach(function(el){
      if(el.getBoundingClientRect().top < window.innerHeight) return; // co je vidět hned, se neschovává
      el.classList.add('reveal');
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(idx % 4, 3) * 80 + 'ms';
      io.observe(el);
    });
  }

  // --- prohlížeč fotek ---
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery a, a.gallery-single'));
  if(!links.length) return;
  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="lb-close" aria-label="×">×</button>' +
    '<button class="lb-prev" aria-label="←">←</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-next" aria-label="→">→</button>';
  document.body.appendChild(box);
  var img = box.querySelector('img'), cap = box.querySelector('figcaption'), i = 0, lastFocus = null;
  var prevB = box.querySelector('.lb-prev'), nextB = box.querySelector('.lb-next');

  function preload(n){ var a = links[(n + links.length) % links.length]; if(a){ new Image().src = a.href; } }
  function show(n){
    i = (n + links.length) % links.length;
    var a = links[i], t = a.querySelector('img');
    img.classList.add('swap');
    var next = new Image();
    next.onload = next.onerror = function(){ img.src = a.href; img.alt = t ? t.alt : ''; img.classList.remove('swap'); };
    next.src = a.href;
    var many = links.length > 1;
    cap.textContent = many ? (i + 1) + ' / ' + links.length : '';
    prevB.style.display = nextB.style.display = many ? '' : 'none';
    preload(i + 1); preload(i - 1);
  }
  function open(n){ lastFocus = document.activeElement; show(n); box.classList.add('open'); document.body.style.overflow = 'hidden'; box.querySelector('.lb-close').focus(); }
  function close(){ box.classList.remove('open'); document.body.style.overflow = ''; if(lastFocus) lastFocus.focus(); }

  links.forEach(function(a, n){ a.addEventListener('click', function(e){ e.preventDefault(); open(n); }); });
  box.querySelector('.lb-close').addEventListener('click', close);
  prevB.addEventListener('click', function(){ show(i - 1); });
  nextB.addEventListener('click', function(){ show(i + 1); });
  box.addEventListener('click', function(e){ if(e.target === box) close(); });
  document.addEventListener('keydown', function(e){
    if(!box.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') show(i - 1);
    if(e.key === 'ArrowRight') show(i + 1);
  });
  // přejetí prstem na mobilu
  var sx = null;
  box.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  box.addEventListener('touchend', function(e){
    if(sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if(Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
  }, {passive:true});
})();
