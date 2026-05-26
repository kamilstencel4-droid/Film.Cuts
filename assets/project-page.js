// assets/project-page.js — per-project gallery loader from localStorage
(function(){
  const KEY = 'filmcuts-projects';
  function loadProjects(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch{return []; } }

  function filename(){ const p = location.pathname || ''; return p.split('/').pop() || p; }

  // Reorder gallery items: landscape (ratio >= 1) first, then portrait
  async function reorderGalleryByOrientation(gallery){
    if(!gallery) return;
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if(!imgs.length) return;
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r=>{ img.addEventListener('load', r, {once:true}); img.addEventListener('error', r, {once:true}); })));
    const items = imgs.map(img => {
      const el = img.closest('.gallery-item') || img.parentElement;
      const ratio = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (img.width && img.height ? img.width / img.height : 1);
      return {el, ratio};
    }).filter(x=>x.el);
    const portrait = items.filter(i=>i.ratio <= 1);
    const landscape = items.filter(i=>i.ratio > 1);
    const ordered = [...portrait, ...landscape];
    ordered.forEach(o=>{ gallery.appendChild(o.el); });
  }

  // Ensure each gallery-item container matches its image height
  async function adjustGalleryItemHeights(gallery){
    if(!gallery) return;
    const imgs = Array.from(gallery.querySelectorAll('img'));
    if(!imgs.length) return;
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r=>{ img.addEventListener('load', r, {once:true}); img.addEventListener('error', r, {once:true}); })));
    imgs.forEach(img=>{
      const item = img.closest('.gallery-item') || img.parentElement;
      if(!item) return;
      const h = img.getBoundingClientRect().height;
      item.style.height = h ? h + 'px' : 'auto';
      item.style.overflow = 'hidden';
    });
  }

  // recompute on resize
  let _resizeTimer;
  function scheduleAdjust(gallery){
    if(_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(()=>{ adjustGalleryItemHeights(gallery).catch(()=>{}); }, 120);
  }
  let _masonryTimer;

  // Masonry layout: distribute items into columns by current column heights
  async function applyMasonryLayout(gallery, colsCount){
    if(!gallery) return;
    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    if(!items.length) return;
    // wait for images
    await Promise.all(items.map(it=>{
      const img = it.querySelector('img');
      return img && !img.complete ? new Promise(r=>{ img.addEventListener('load', r, {once:true}); img.addEventListener('error', r, {once:true}); }) : Promise.resolve();
    }));
    // restore items to gallery root
    gallery.innerHTML = '';
    items.forEach(it=> gallery.appendChild(it));
    // Apply simple grid layout
    if(colsCount <= 1){
      gallery.style.display = '';
      gallery.style.gap = '';
      gallery.style.gridTemplateColumns = '';
    } else {
      gallery.style.display = 'grid';
      gallery.style.gridTemplateColumns = 'repeat(' + colsCount + ', 1fr)';
      gallery.style.gap = '12px';
    }
  }

  function computeColumns(){
    const w = window.innerWidth || document.documentElement.clientWidth;
    if(w >= 1200) return 3;
    if(w >= 800) return 2;
    return 1;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const fname = filename();
    const projects = loadProjects();
    let project = projects.find(p=>p.link && p.link.split('/').pop() === fname);
    // fallback: try match by title (h1)
    if(!project){
      const h = document.querySelector('.project-hero h1');
      const title = h && h.textContent && h.textContent.trim();
      if(title) project = projects.find(p=>p.title && p.title.trim()===title);
    }

    if(!project){
      const existing = document.querySelector('.project-gallery');
      if(existing){
        const cols = computeColumns();
        reorderGalleryByOrientation(existing)
          .then(()=> adjustGalleryItemHeights(existing))
          .then(()=> applyMasonryLayout(existing, cols))
          .catch(()=>{});
        window.addEventListener('resize', ()=>{
          scheduleAdjust(existing);
          if(_masonryTimer) clearTimeout(_masonryTimer);
          _masonryTimer = setTimeout(()=> applyMasonryLayout(existing, computeColumns()).catch(()=>{}), 160);
        });
      }
      return; // nothing else to do
    }

    // replace project-video thumbnail if available
    try{
      const pvImg = document.querySelector('.project-video img');
      const first = (project.images && project.images[0]) || project.image;
      if(pvImg && first) pvImg.src = first;
    }catch(e){}

    // replace gallery
    const gallery = document.querySelector('.project-gallery');
    if(!gallery) return;
    // if no images, do nothing (keep existing static gallery)
    if(!(project.images && project.images.length)) return;
    gallery.innerHTML = '';
    project.images.forEach((src, idx)=>{
      const item = document.createElement('div'); item.className = 'gallery-item';
      const img = document.createElement('img'); img.src = src; img.alt = (project.title ? project.title + ' — foto ' + (idx+1) : 'foto ' + (idx+1)); img.loading = 'lazy';
      item.appendChild(img);
      gallery.appendChild(item);
    });
    // reorder, adjust heights and apply masonry after we populated gallery from localStorage
    const cols = computeColumns();
    reorderGalleryByOrientation(gallery)
      .then(()=> adjustGalleryItemHeights(gallery))
      .then(()=> applyMasonryLayout(gallery, cols))
      .catch(()=>{});
    window.addEventListener('resize', ()=>{
      scheduleAdjust(gallery);
      if(_masonryTimer) clearTimeout(_masonryTimer);
      _masonryTimer = setTimeout(()=> applyMasonryLayout(gallery, computeColumns()).catch(()=>{}), 160);
    });
  });

})();
