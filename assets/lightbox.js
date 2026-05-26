// assets/lightbox.js — simple lightbox for project galleries
(function(){
  function createLightbox(){
    const overlay = document.createElement('div'); overlay.className='lb-overlay';
    overlay.innerHTML = `
      <div class="lb-inner">
        <button class="lb-close" aria-label="Zavřít">✕</button>
        <button class="lb-prev" aria-label="Předchozí">◀</button>
        <img class="lb-image" src="" alt="" />
        <button class="lb-next" aria-label="Další">▶</button>
        <div class="lb-caption"></div>
        <div class="lb-counter"></div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  function Lightbox(root){
    this.root = root || createLightbox();
    this.imgEl = this.root.querySelector('.lb-image');
    this.captionEl = this.root.querySelector('.lb-caption');
    this.counterEl = this.root.querySelector('.lb-counter');
    this.btnClose = this.root.querySelector('.lb-close');
    this.btnPrev = this.root.querySelector('.lb-prev');
    this.btnNext = this.root.querySelector('.lb-next');
    this.currentIndex = 0;
    this.items = [];
    this.bind();
  }

  Lightbox.prototype.bind = function(){
    const self = this;
    this.btnClose.addEventListener('click', ()=> self.close());
    this.btnPrev.addEventListener('click', ()=> self.prev());
    this.btnNext.addEventListener('click', ()=> self.next());
    // clicking the overlay background will navigate (left/right) instead of closing
    this.root.addEventListener('click', (e)=>{
      if(e.target === this.root){
        const rect = this.root.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if(x > rect.width/2) this.next(); else this.prev();
      }
    });

    // keyboard navigation: arrows only (Escape no longer closes — close only via X button)
    document.addEventListener('keydown', (e)=>{
      if(!this.root.classList.contains('open')) return;
      if(e.key === 'ArrowLeft') this.prev();
      else if(e.key === 'ArrowRight') this.next();
    });

    // clicking the image: if zoomed toggle zoom, otherwise left/right half navigates
    this.imgEl.addEventListener('click', (e)=>{
      // if image is zoomed, clicking toggles zoom off/on
      if(this.imgEl.classList.contains('zoomed')){
        this.imgEl.classList.toggle('zoomed');
        return;
      }
      // navigate based on click position relative to the image
      const rect = this.imgEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if(x > rect.width/2) this.next(); else this.prev();
    });

    // touch swipe
    let startX = 0, dist = 0;
    this.imgEl.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; dist = 0; }, {passive:true});
    this.imgEl.addEventListener('touchmove', (e)=>{ dist = e.touches[0].clientX - startX; }, {passive:true});
    this.imgEl.addEventListener('touchend', ()=>{
      if(Math.abs(dist) > 40){ if(dist < 0) this.next(); else this.prev(); }
    });
  };

  Lightbox.prototype.open = function(items, index, opts){
    if(!Array.isArray(items) || items.length===0) return;
    this.items = items;
    this.currentIndex = Math.max(0, Math.min(index||0, items.length-1));
    // If the page is project5, add a marker class so we can apply page-specific CSS
    try{
      const p = window.location.pathname || '';
      if(p.indexOf('project5.html') !== -1){
        this.root.classList.add('from-project5');
      } else {
        this.root.classList.remove('from-project5');
      }
    }catch(e){/* ignore */}
    // mark lightbox source when opened from the about gallery
    if(opts && opts.fromAbout){
      this.root.classList.add('from-about');
    } else {
      this.root.classList.remove('from-about');
    }
    this.showCurrent();
    this.root.classList.add('open');
  };

  Lightbox.prototype.close = function(){
    this.root.classList.remove('open');
    // remove any page-specific marker when closed
    this.root.classList.remove('from-project5');
    this.root.classList.remove('from-about');
    this.imgEl.src = '';
    this.imgEl.classList.remove('zoomed');
  };

  Lightbox.prototype.showCurrent = function(){
    const cur = this.items[this.currentIndex];
    this.imgEl.src = cur.src || cur;
    this.imgEl.alt = cur.alt || '';
    this.captionEl.textContent = cur.caption || '';
    this.counterEl.textContent = (this.currentIndex+1) + ' / ' + this.items.length;
    // preload adjacent images for smoother navigation
    if(this.items.length > 1){
      const nextIdx = (this.currentIndex+1) % this.items.length;
      const prevIdx = (this.currentIndex-1 + this.items.length) % this.items.length;
      const p1 = new Image(); p1.src = this.items[nextIdx].src || this.items[nextIdx];
      const p2 = new Image(); p2.src = this.items[prevIdx].src || this.items[prevIdx];
    }
  };

  Lightbox.prototype.next = function(){
    if(this.items.length===0) return;
    this.currentIndex = (this.currentIndex+1) % this.items.length;
    this.showCurrent();
  };
  Lightbox.prototype.prev = function(){
    if(this.items.length===0) return;
    this.currentIndex = (this.currentIndex-1 + this.items.length) % this.items.length;
    this.showCurrent();
  };

  // initialize and attach delegation
  document.addEventListener('DOMContentLoaded', ()=>{
    const lb = new Lightbox();

    // click handler for images inside galleries
    document.addEventListener('click', (e)=>{
      // Find the image that was clicked or the image inside the clicked gallery item
      let clickedImg = null;
      const t = e.target;
      if(t && t.tagName === 'IMG') clickedImg = t;
      else {
        // if user clicked the .gallery-item wrapper or a child element, find the image inside
        const galleryItem = t.closest && t.closest('.gallery-item');
        if(galleryItem) clickedImg = galleryItem.querySelector('img');
        // or if clicking an anchor that wraps an image
        if(!clickedImg){
          const anchor = t.closest && t.closest('a');
          if(anchor) clickedImg = anchor.querySelector('img');
        }
      }
      if(!clickedImg) return;

      // prefer explicit project galleries
      let galleryContainer = clickedImg.closest('.project-gallery');
      const fromAbout = clickedImg.getAttribute('data-gallery') === 'about';

      // fallback: grouped by data-gallery attribute (e.g. data-gallery="project-1")
      if(!galleryContainer){
        const galleryName = clickedImg.getAttribute('data-gallery');
        if(galleryName){
          galleryContainer = document.querySelectorAll('img[data-gallery="'+galleryName+'"]');
        }
      }

      // if we found a proper .project-gallery element, use its images
      let imgs = [];
      if(galleryContainer && galleryContainer.querySelector){
        imgs = Array.from(galleryContainer.querySelectorAll('img'));
      } else if(galleryContainer && galleryContainer.length){
        // NodeList from data-gallery query
        imgs = Array.from(galleryContainer);
      } else {
        // nothing to do — not part of a recognized gallery
        return;
      }

      // build items array using data-full when available
      const items = imgs.map(i => ({ src: i.dataset.full || i.src, alt: i.alt || '', caption: i.getAttribute('data-caption') || '' }));
      const idx = imgs.indexOf(clickedImg);
      if(idx === -1) return;
      lb.open(items, idx, { fromAbout });
    });

  });

})();
