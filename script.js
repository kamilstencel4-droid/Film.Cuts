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

    // Hide the banner on scroll so it disappears with the top area, but stays separate from the header.
    (function(){
      const banner = document.querySelector('.new-project-banner');
      if(!banner) return;
      let lastY = window.scrollY || 0;
      let ticking = false;

      function onScroll(){
        const currentY = window.scrollY || 0;
        if(!ticking){
          window.requestAnimationFrame(()=>{
            const delta = currentY - lastY;
            if(delta > 6 && currentY > 80){
              banner.classList.add('is-hidden');
            } else if(delta < -6 || currentY <= 80){
              banner.classList.remove('is-hidden');
            }
            lastY = currentY;
            ticking = false;
          });
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, {passive:true});
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
        if(e.target.closest('.nav-dropdown')) return;
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

    // Mobile modal: show once on small devices (max-width:768px) and remember dismissal in localStorage
    (function(){
      const storageKey = 'mobile_modal_seen_v1';
      const mq = window.matchMedia('(max-width:768px)');
      const overlay = document.getElementById('mobile-modal-overlay');
      if(!overlay) return;

      function showModal(){
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden','false');
        // lock scroll
        document.body.style.overflow = 'hidden';
        // focus first actionable button for a11y
        const ok = overlay.querySelector('.mobile-modal-ok') || overlay.querySelector('.mobile-modal-close');
        if(ok) ok.focus();
      }
      function hideModal(save=true){
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
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

      // Close interactions
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
