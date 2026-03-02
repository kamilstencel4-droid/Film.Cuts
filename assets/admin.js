// assets/admin.js — simple in-browser admin for projects (localStorage)
(function(){
  const KEY = 'filmcuts-projects';
  const SITE_KEY = 'filmcuts-site';
  const PW = 'admin'; // local quick password — change if you want

  // DOM
  const loginBox = document.getElementById('login-box');
  const adminUI = document.getElementById('admin-ui');
  const btnLogin = document.getElementById('btn-login');
  const pwInput = document.getElementById('pw');

  const form = document.getElementById('project-form');
  const projId = document.getElementById('proj-id');
  const titleEl = document.getElementById('proj-title');
  const yearEl = document.getElementById('proj-year');
  const linkEl = document.getElementById('proj-link');
  const descEl = document.getElementById('proj-desc');
  const imageEl = document.getElementById('proj-image');
  const listEl = document.getElementById('projects-list');
  const btnClear = document.getElementById('btn-clear');
  const btnExport = document.getElementById('btn-export');
  const importFile = document.getElementById('import-file');

  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch{ return []; }
  }
  function save(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

  function uid(){ return 'p_'+Date.now(); }

  function renderList(){
    const arr = load();
    listEl.innerHTML = '';
    if(arr.length===0){ listEl.innerHTML = '<p class="muted">Žádné projekty — přidejte první.</p>'; return; }
    arr.slice().reverse().forEach(p => {
      const wrap = document.createElement('div'); wrap.className='project-item';
      const img = document.createElement('img'); img.className='project-thumb';
      // support legacy single image or new images array
      const firstImg = (p.images && p.images[0]) || p.image || 'assets/portfolio1.png';
      img.src = firstImg; img.alt = p.title;
      // small thumbnail strip
      const thumbsWrap = document.createElement('div'); thumbsWrap.style.display='flex'; thumbsWrap.style.gap='6px'; thumbsWrap.style.marginTop='8px';
      if(p.images && p.images.length){ p.images.slice(0,4).forEach(src=>{ const ti = document.createElement('img'); ti.src = src; ti.style.width='48px'; ti.style.height='36px'; ti.style.objectFit='cover'; ti.style.borderRadius='6px'; thumbsWrap.appendChild(ti); }); }
      const meta = document.createElement('div'); meta.style.flex='1';
      meta.innerHTML = `<strong>${escapeHtml(p.title||'')}</strong><div class="muted">${escapeHtml(p.year||'')} — ${escapeHtml(p.link||'')}</div><div style="font-size:0.9rem;margin-top:6px">${escapeHtml(p.description||'')}</div>`;
      const actions = document.createElement('div');
      const btnEdit = document.createElement('button'); btnEdit.className='btn'; btnEdit.textContent='Upravit';
      const btnDel = document.createElement('button'); btnDel.className='btn'; btnDel.textContent='Smazat'; btnDel.style.background='#d32f2f';
      const btnClearImgs = document.createElement('button'); btnClearImgs.className='btn'; btnClearImgs.textContent='Smazat obrázky'; btnClearImgs.style.background='#666'; btnClearImgs.style.marginLeft='8px';
      actions.appendChild(btnEdit); actions.appendChild(btnDel);
      actions.appendChild(btnClearImgs);
      wrap.appendChild(img); wrap.appendChild(meta); wrap.appendChild(thumbsWrap); wrap.appendChild(actions);
      listEl.appendChild(wrap);

      btnEdit.addEventListener('click', ()=>{ populateForm(p); });
      btnDel.addEventListener('click', ()=>{ if(confirm('Smazat tento projekt?')){ deleteProject(p.id); } });
      btnClearImgs.addEventListener('click', ()=>{ if(confirm('Smazat všechny obrázky tohoto projektu?')){ clearImages(p.id); } });
    });
  }

  function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function populateForm(p){ projId.value = p.id; titleEl.value = p.title||''; yearEl.value = p.year||''; linkEl.value = p.link||''; descEl.value = p.description||''; }

  function clearForm(){ projId.value=''; titleEl.value=''; yearEl.value=''; linkEl.value=''; descEl.value=''; imageEl.value=null; }

  function saveProjectFromForm(imageDataArray){
    const arr = load();
    const id = projId.value || uid();
    // find existing to preserve images if needed
    const existing = arr.find(x=>x.id===id) || {};
    const images = Array.isArray(imageDataArray) ? imageDataArray : (imageDataArray ? [imageDataArray] : (existing.images || (existing.image ? [existing.image] : [])));
    const item = { id, title: titleEl.value.trim(), year: yearEl.value.trim(), link: linkEl.value.trim(), description: descEl.value.trim(), images: images, image: images[0] || null };
    const idx = arr.findIndex(x=>x.id===id);
    if(idx>=0) arr[idx] = item; else arr.push(item);
    save(arr);
    renderList();
    clearForm();
    alert('Projekt uložen.');
  }

  function clearImages(id){
    const arr = load();
    const idx = arr.findIndex(x=>x.id===id);
    if(idx===-1) return;
    arr[idx].images = [];
    arr[idx].image = null;
    save(arr);
    renderList();
  }

  function deleteProject(id){ const arr = load().filter(x=>x.id!==id); save(arr); renderList(); }

  // Login
  btnLogin && btnLogin.addEventListener('click', ()=>{
    if((pwInput.value||'') === PW){
      sessionStorage.setItem('filmcuts-admin','1'); loginBox.style.display='none'; adminUI.style.display='block'; renderList();
    } else { alert('Špatné heslo.'); }
  });

  // Persist login across reload during session
  document.addEventListener('DOMContentLoaded', ()=>{
    if(sessionStorage.getItem('filmcuts-admin')){ loginBox.style.display='none'; adminUI.style.display='block'; renderList(); }
  });

  // Form submit -> handle multiple images -> save
  form && form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const files = Array.from(imageEl.files || []);
    if(files.length){
      const map = [];
      let pending = files.length;
      files.forEach(file =>{
        const reader = new FileReader();
        reader.onload = (ev)=>{ map.push(ev.target.result); pending -=1; if(pending===0){ saveProjectFromForm(map); } };
        reader.readAsDataURL(file);
      });
    } else { // keep previous images if editing
      const existing = load().find(x=>x.id===projId.value);
      const prevImages = existing ? (existing.images || (existing.image ? [existing.image] : [])) : [];
      saveProjectFromForm(prevImages);
    }
  });

  btnClear && btnClear.addEventListener('click', ()=> clearForm());

  // Export / Import
  btnExport && btnExport.addEventListener('click', ()=>{
    const payload = JSON.stringify(load(), null, 2);
    const blob = new Blob([payload], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'projects-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  importFile && importFile.addEventListener('change', (ev)=>{
    const f = ev.target.files && ev.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = (e)=>{ try{ const arr = JSON.parse(e.target.result); if(Array.isArray(arr)){ save(arr); renderList(); alert('Import hotov.'); } else alert('Neplatný formát JSON.'); }catch(err){ alert('Chyba při importu.'); } }; r.readAsText(f); importFile.value=null;
  });

  // SITE text editor
  const siteBrand = document.getElementById('site-brand');
  const siteHeroTitle = document.getElementById('site-hero-title');
  const siteHeroTagline = document.getElementById('site-hero-tagline');
  const siteAboutText = document.getElementById('site-about-text');
  const siteContactEmail = document.getElementById('site-contact-email');
  const btnSaveSite = document.getElementById('btn-save-site');

  function loadSite(){ try{ return JSON.parse(localStorage.getItem(SITE_KEY) || '{}'); }catch{return {}; } }
  function saveSite(obj){ localStorage.setItem(SITE_KEY, JSON.stringify(obj)); }

  // populate site editor if data present
  document.addEventListener('DOMContentLoaded', ()=>{
    const s = loadSite();
    if(Object.keys(s).length){ siteBrand.value = s.brand || ''; siteHeroTitle.value = s.heroTitle || ''; siteHeroTagline.value = s.heroTagline || ''; siteAboutText.value = s.aboutText || ''; siteContactEmail.value = s.contactEmail || ''; }
  });

  btnSaveSite && btnSaveSite.addEventListener('click', ()=>{
    const payload = { brand: siteBrand.value.trim(), heroTitle: siteHeroTitle.value.trim(), heroTagline: siteHeroTagline.value.trim(), aboutText: siteAboutText.value.trim(), contactEmail: siteContactEmail.value.trim() };
    saveSite(payload);
    alert('Texty uloženy. Přejděte na hlavní stránku (nebo obnovte) pro zobrazení.');
  });

})();
