// assets/project-page.js — per-project gallery loader from localStorage
(function(){
  const KEY = 'filmcuts-projects';
  function loadProjects(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch{return []; } }

  function filename(){ const p = location.pathname || ''; return p.split('/').pop() || p; }

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

    if(!project) return; // nothing to do

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
  });

})();
