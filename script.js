// script.js — smooth interactions & reveal-on-scroll
(function(){
  // Smooth scroll for scroll indicator buttons
  document.addEventListener('click', function(e){
    const t = e.target.closest('[data-scroll-to]');
    if(!t) return;
    e.preventDefault();
    const sel = t.getAttribute('data-scroll-to');
    const el = document.querySelector(sel);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // Reveal on scroll using IntersectionObserver
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry =>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.12});

  document.addEventListener('DOMContentLoaded', ()=>{
    // attach reveals to sections and key elems (add reveal class first so IO will observe them)
    const reveals = ['.section-title', '.section-sub', '.project', '.about-text', '.about-media', '.ph-item', '.hero-title', '.hero-tagline'];
    reveals.forEach(sel => document.querySelectorAll(sel).forEach(el => el.classList.add('reveal')));
    // now observe all elements that have the reveal class
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

    // pause hero video on small devices for bandwidth
    const vid = document.querySelector('.hero-video');
    if(vid){
      const mq = window.matchMedia('(max-width:700px)');
      if(mq.matches){ vid.pause(); }
    }

    // replace missing images with subtle placeholder style
    document.querySelectorAll('img').forEach(img=>{
      img.addEventListener('error', ()=>{
        img.style.filter = 'grayscale(60%) brightness(0.6)';
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#111"/><text x="50%" y="50%" fill="#666" font-size="18" font-family="Arial,Helvetica" dominant-baseline="middle" text-anchor="middle">no image</text></svg>';
      });
    });

    // Hide header when scrolling down, show when scrolling up
    (function(){
      const header = document.querySelector('.site-header');
      if(!header) return;
      // Do not enable hide-on-scroll on small viewports — keep header visible and stable on mobile
      if(window.matchMedia && window.matchMedia('(max-width:900px)').matches) return;
      let lastY = window.scrollY || 0;
      let ticking = false;

      function onScroll(){
        const currentY = window.scrollY || 0;
        if(!ticking){
          window.requestAnimationFrame(()=>{
            const delta = currentY - lastY;
            // if scrolling down and past a little offset, hide header
            if(delta > 6 && currentY > 80){
              header.classList.add('header-hidden');
            } else if(delta < -6 || currentY <= 80){
              // scrolling up or near top -> show header
              header.classList.remove('header-hidden');
            }
            lastY = currentY;
            ticking = false;
          });
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, {passive:true});
    })();

    // Mobile menu toggle — robust open/close and accessibility helpers
    (function(){
      const btn = document.getElementById('menu-toggle');
      const nav = document.querySelector('.main-nav');
      if(!btn || !nav) return;
      // ensure initial ARIA state
      btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') || 'false');
      nav.setAttribute('aria-hidden', nav.classList.contains('open') ? 'false' : 'true');

      function openNav(){
        nav.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        nav.setAttribute('aria-hidden','false');
        document.body.classList.add('nav-open');
      }
      function closeNav(){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        nav.setAttribute('aria-hidden','true');
        document.body.classList.remove('nav-open');
      }

      // Toggle on click (also support Enter/Space for keyboard)
      btn.addEventListener('click', (e)=>{
        // debug: ensure clicks are received on various devices
        try{ console.log('menu-toggle click (before): open=', nav.classList.contains('open')); }catch(err){}
        e.preventDefault();
        e.stopPropagation();
        if(nav.classList.contains('open')) closeNav(); else openNav();
        try{ console.log('menu-toggle click (after): open=', nav.classList.contains('open')); }catch(err){}
      });
      btn.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          e.stopPropagation();
          if(nav.classList.contains('open')) closeNav(); else openNav();
        }
      });

      // close nav when a link inside it is clicked
      nav.addEventListener('click', (e)=>{ if(e.target.closest('a')) closeNav(); });

      // close on outside click
      document.addEventListener('click', (e)=>{
        if(!nav.classList.contains('open')) return;
        if(e.target.closest('.main-nav') || e.target.closest('#menu-toggle')) return;
        closeNav();
      });

      // close on Escape
      document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && nav.classList.contains('open')) closeNav(); });
    })();

    // Header dropdown (desktop + mobile friendly)
    (function(){
      const btn = document.getElementById('main-nav-toggle');
      const menu = document.getElementById('main-nav-menu');
      const dropdown = btn ? btn.closest('.nav-dropdown') : null;
      if(!btn || !menu || !dropdown) return;

      function setOpen(state){
        dropdown.classList.toggle('open', state);
        btn.setAttribute('aria-expanded', state ? 'true' : 'false');
      }

      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // close dropdown when a menu link is clicked; also close mobile nav if open
      menu.addEventListener('click', (e)=>{
        if(e.target.closest('a')){
          setOpen(false);
          const nav = document.querySelector('.main-nav');
          if(nav) nav.classList.remove('open');
        }
      });

      // close on outside click
      document.addEventListener('click', (e)=>{
        if(!dropdown.classList.contains('open')) return;
        if(e.target.closest('.nav-dropdown') || e.target.closest('#menu-toggle')) return;
        setOpen(false);
      });

      // close on Escape
      document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') setOpen(false); });
    })();

    // Keep last two words together for key headings to avoid ugly breaks
    (function(){
      const selectors = ['.hero-title', '.site-header .brand', '.section-title', '.project .project-meta h3', '.project-hero h1', '.team-member .member-info h3', '.about-card .section-title'];
      function keepLastTwo(el){
        // only modify if element contains plain text (no child elements)
        if(!el || el.childElementCount>0) return;
        const txt = (el.textContent||'').trim();
        if(!txt) return;
        // replace last normal space with a non-breaking space
        const replaced = txt.replace(/\s+([^\s]+)$/, '\u00A0$1');
        if(replaced !== txt) el.textContent = replaced;
      }
      selectors.forEach(sel => document.querySelectorAll(sel).forEach(el=>keepLastTwo(el)));
    })();

    // Dynamic mobile scaling: compute and set --mobile-scale once on load so scale stays fixed during interaction
    (function(){
      try{
        const root = document.documentElement;
        const containerRaw = getComputedStyle(root).getPropertyValue('--container') || '1100px';
        const container = parseFloat(containerRaw) || 1100;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        // If viewport is wider than container or beyond mobile breakpoint, use 1 (no scaling)
        if(vw >= container || vw > 900){
          root.style.setProperty('--mobile-scale', '1');
        } else {
          let scale = vw / container;
          scale = Math.max(0.5, Math.min(1, scale));
          root.style.setProperty('--mobile-scale', String(scale));
        }
      }catch(err){
        console.warn('mobile scale init error', err);
      }
      // Intentionally do NOT listen to resize/orientation events — scale is fixed at load per user request
    })();

    // Mobile modal: show once on small devices (max-width:900px) and remember dismissal in localStorage
    (function(){
      const storageKey = 'mobile_modal_seen_v1';
      const mq = window.matchMedia('(max-width:900px)');
      const overlay = document.getElementById('mobile-modal-overlay');
      if(!overlay) return;

      function showModal(){
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden','false');
        // focus first actionable button for a11y
        const ok = overlay.querySelector('.mobile-modal-ok') || overlay.querySelector('.mobile-modal-close');
        if(ok) ok.focus();
      }
      function hideModal(save=true){
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden','true');
        if(save){
          try{ localStorage.setItem(storageKey,'1'); }catch(e){}
        }
      }

      // Show modal if on small screen and not yet seen
      try{
        if(mq.matches && !localStorage.getItem(storageKey)){
          // small delay so it doesn't interrupt initial paint
          setTimeout(showModal, 600);
        }
      }catch(err){/* ignore localStorage errors */}

      // Close interactions (scoped to modal elements only)
      document.addEventListener('click', function(e){
        if(e.target.closest('.mobile-modal-close') || e.target.closest('.mobile-modal-ok')){
          hideModal(true);
        }
        // click on overlay backdrop
        if(e.target === overlay){ hideModal(true); }
      });

      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && overlay.classList.contains('open')){
          hideModal(true);
        }
      });
    })();
  });
})();
