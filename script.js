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
  });
})();
