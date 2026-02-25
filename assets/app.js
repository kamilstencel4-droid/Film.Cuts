// Editor-driven site editing and media uploads (no contentEditable)
(function(){
  const MEDIA_KEY = 'filmcuts-media';
  const STATE_KEY = 'filmcuts-state';

  // DOM references
  const openBtn = document.getElementById('open-editor');
  const editor = document.getElementById('editor');
  const closeBtn = document.getElementById('close-editor');
  const form = document.getElementById('editor-form');
  const importFile = document.getElementById('import-file');
  const btnSave = document.getElementById('btn-save');
  const btnExport = document.getElementById('btn-export');

  const fileInputGlobal = document.getElementById('file-input');

  // Helper: load/save media map
  function loadMediaMap(){
    try{ return JSON.parse(localStorage.getItem(MEDIA_KEY) || '{}'); }
    catch{ return {}; }
  }
  function saveMediaMap(map){ localStorage.setItem(MEDIA_KEY, JSON.stringify(map)); }

  // Save and load state (text content)
  function saveState(state){ localStorage.setItem(STATE_KEY, JSON.stringify(state || {})); }
  function loadState(){ try{ return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); }catch{return {}} }

  // Read current DOM into state object
  function readStateFromDOM(){
    const state = {};
    state.brand = document.querySelector('.brand')?.textContent?.trim() || '';
    state.heroTitle = document.getElementById('hero-title')?.textContent || '';
    state.heroTagline = document.getElementById('hero-tagline')?.textContent || '';
    state.aboutTitle = document.getElementById('about-title')?.textContent || '';
    state.aboutText = document.getElementById('about-text')?.textContent || '';
    state.portfolioTitle = document.getElementById('portfolio-title')?.textContent || '';
    state.cards = {};
    document.querySelectorAll('.card[data-key]').forEach(card =>{
      const key = card.getAttribute('data-key');
      const title = card.querySelector('.card-title')?.textContent || '';
      const desc = card.querySelector('.card-desc')?.textContent || '';
      state.cards[key] = {title, desc};
    });
    state.contactTitle = document.getElementById('contact-title')?.textContent || '';
    state.contactEmail = document.getElementById('contact-email')?.textContent || '';
    state.footerBrand = document.getElementById('footer-brand')?.textContent || '';
    return state;
  }

  // Apply state to DOM
  function applyStateToDOM(state){
    if(!state) return;
    if(state.brand) document.querySelector('.brand').textContent = state.brand;
    if(state.heroTitle) document.getElementById('hero-title').textContent = state.heroTitle;
    if(state.heroTagline) document.getElementById('hero-tagline').textContent = state.heroTagline;
    if(state.aboutTitle) document.getElementById('about-title').textContent = state.aboutTitle;
    if(state.aboutText) document.getElementById('about-text').textContent = state.aboutText;
    if(state.portfolioTitle) document.getElementById('portfolio-title').textContent = state.portfolioTitle;
    if(state.cards){
      Object.keys(state.cards).forEach(key =>{
        const card = document.querySelector(`.card[data-key="${key}"]`);
        if(!card) return;
        const t = state.cards[key].title || '';
        const d = state.cards[key].desc || '';
        const elT = card.querySelector('.card-title');
        const elD = card.querySelector('.card-desc');
        if(elT) elT.textContent = t;
        if(elD) elD.textContent = d;
      });
    }
    if(state.contactTitle) document.getElementById('contact-title').textContent = state.contactTitle;
    if(state.contactEmail){
      const a = document.getElementById('contact-email');
      a.textContent = state.contactEmail;
      a.href = 'mailto:' + state.contactEmail;
    }
    if(state.footerBrand) document.getElementById('footer-brand').textContent = state.footerBrand;
  }

  // Populate editor form fields from state
  function populateForm(state){
    document.getElementById('field-brand').value = state.brand || '';
    document.getElementById('field-hero-title').value = state.heroTitle || '';
    document.getElementById('field-hero-tagline').value = state.heroTagline || '';
    document.getElementById('field-about-title').value = state.aboutTitle || '';
    document.getElementById('field-about-text').value = state.aboutText || '';
    document.getElementById('field-contact-title').value = state.contactTitle || '';
    document.getElementById('field-contact-email').value = state.contactEmail || '';
    document.getElementById('field-footer-brand').value = state.footerBrand || '';
    // cards
    document.querySelectorAll('.card-editor').forEach(editorCard =>{
      const key = editorCard.dataset.card;
      const data = (state.cards && state.cards[key]) || {title:'', desc:''};
      editorCard.querySelector('.field-card-title').value = data.title || '';
      editorCard.querySelector('.field-card-desc').value = data.desc || '';
    });
  }

  // Read form into state object
  function readForm(){
    const s = {};
    s.brand = document.getElementById('field-brand').value.trim();
    s.heroTitle = document.getElementById('field-hero-title').value.trim();
    s.heroTagline = document.getElementById('field-hero-tagline').value.trim();
    s.aboutTitle = document.getElementById('field-about-title').value.trim();
    s.aboutText = document.getElementById('field-about-text').value.trim();
    s.portfolioTitle = document.getElementById('portfolio-title')?.textContent || '';
    s.cards = {};
    document.querySelectorAll('.card-editor').forEach(editorCard =>{
      const key = editorCard.dataset.card;
      const title = editorCard.querySelector('.field-card-title').value.trim();
      const desc = editorCard.querySelector('.field-card-desc').value.trim();
      s.cards[key] = {title, desc};
    });
    s.contactTitle = document.getElementById('field-contact-title').value.trim();
    s.contactEmail = document.getElementById('field-contact-email').value.trim();
    s.footerBrand = document.getElementById('field-footer-brand').value.trim();
    return s;
  }

  // Render media items for a card (reused)
  function renderMediaForCard(cardKey){
    const map = loadMediaMap();
    const arr = map[cardKey] || [];
    const card = document.querySelector(`[data-key="${cardKey}"]`);
    if(!card) return;
    const container = card.querySelector('[data-media]');
    container.innerHTML = '';
    arr.forEach((item, idx) => {
      let el;
      if(item.type && item.type.startsWith('video')){
        el = document.createElement('video');
        el.controls = true;
        el.src = item.data;
      } else {
        el = document.createElement('img');
        el.src = item.data;
        el.alt = item.name || '';
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'media-item';
      wrapper.style.position = 'relative';
      wrapper.appendChild(el);

      const remove = document.createElement('button');
      remove.className = 'btn remove-media';
      remove.textContent = 'Odstranit';
      remove.style.position = 'absolute';
      remove.style.right = '8px';
      remove.style.top = '8px';
      remove.dataset.card = cardKey;
      remove.dataset.index = idx;
      wrapper.appendChild(remove);

      container.appendChild(wrapper);
    });
  }

  // Load and render all media
  function loadMediaAndRender(){
    const map = loadMediaMap();
    Object.keys(map).forEach(k => renderMediaForCard(k));
  }

  // Open/close editor
  function openEditor(){
    editor.setAttribute('aria-hidden', 'false');
    // load state into form
    const state = loadState();
    // if no saved state, build from DOM
    const source = Object.keys(state).length ? state : readStateFromDOM();
    populateForm(source);
  }
  function closeEditor(){ editor.setAttribute('aria-hidden', 'true'); }

  // Save handler
  function handleSave(){
    const state = readForm();
    applyStateToDOM(state);
    saveState(state);
    alert('Změny uloženy lokálně.');
  }

  // Export state + media as JSON download
  function handleExport(){
    const state = loadState();
    // ensure state includes latest form values
    const merged = Object.assign({}, state, readForm());
    const media = loadMediaMap();
    const payload = {state: merged, media};
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filmcuts-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Import JSON (state + media)
  function handleImportFile(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      try{
        const payload = JSON.parse(e.target.result);
        if(payload.media) saveMediaMap(payload.media);
        if(payload.state) saveState(payload.state);
        applyStateToDOM(payload.state);
        loadMediaAndRender();
        alert('Import dokončen.');
      }catch(err){ alert('Chyba při importu: špatný formát.'); }
    };
    reader.readAsText(file);
  }

  // Delegated click handlers: remove media buttons
  document.addEventListener('click', (e)=>{
    if(e.target && e.target.matches('.remove-media')){
      const key = e.target.dataset.card;
      const idx = Number(e.target.dataset.index);
      const map = loadMediaMap();
      if(map[key]){
        map[key].splice(idx,1);
        saveMediaMap(map);
        renderMediaForCard(key);
      }
    }
  });

  // Card upload inputs inside editor
  document.querySelectorAll('.card-editor').forEach(editorCard =>{
    const input = editorCard.querySelector('.field-card-upload');
    input && input.addEventListener('change', (ev)=>{
      const files = Array.from(ev.target.files||[]);
      const key = editorCard.dataset.card;
      if(!key || files.length===0) return;
      const map = loadMediaMap(); map[key] = map[key] || [];
      let pending = files.length;
      files.forEach(file=>{
        const reader = new FileReader();
        reader.onload = (e)=>{
          map[key].push({name:file.name, type:file.type, data:e.target.result});
          pending -=1;
          if(pending===0){ saveMediaMap(map); renderMediaForCard(key); }
        };
        reader.readAsDataURL(file);
      });
      // clear input
      input.value = null;
    });
  });

  // Import file selected
  importFile && importFile.addEventListener('change', (ev)=>{
    const f = ev.target.files && ev.target.files[0];
    if(f) handleImportFile(f);
    importFile.value = null;
  });

  // Wire UI buttons
  openBtn && openBtn.addEventListener('click', openEditor);
  closeBtn && closeBtn.addEventListener('click', closeEditor);
  btnSave && btnSave.addEventListener('click', handleSave);
  btnExport && btnExport.addEventListener('click', handleExport);

  // Allow Ctrl/Cmd+S when editor open to save
  window.addEventListener('keydown', (e)=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){
      if(editor && editor.getAttribute('aria-hidden')==='false'){
        e.preventDefault(); handleSave();
      }
    }
  });

  // On start: load saved state + media
  document.addEventListener('DOMContentLoaded', ()=>{
    const state = loadState();
    if(Object.keys(state).length) applyStateToDOM(state);
    loadMediaAndRender();
  });

})();
// Simple in-browser edit mode for quick graphical edits
(() => {
  const toggle = document.getElementById('toggle-edit');
  const EDIT_CLASS = 'editing';
  const fileInput = document.getElementById('file-input');
  const MEDIA_KEY = 'filmcuts-media';

  function setEditable(enabled) {
    document.body.classList.toggle(EDIT_CLASS, enabled);
    const items = document.querySelectorAll('[data-editable="true"]');
    items.forEach(el => {
      el.contentEditable = enabled;
      if (enabled) el.setAttribute('tabindex', '0');
      else el.removeAttribute('tabindex');
    });
  }

  function saveToLocal() {
    const items = document.querySelectorAll('[data-editable="true"]');
    const payload = {};
    items.forEach((el, i) => {
      // create an id-like key for each editable element
      const key = el.getAttribute('data-key') || `editable-${i}`;
      payload[key] = el.innerHTML;
      el.setAttribute('data-key', key);
    });
    localStorage.setItem('filmcuts-edit', JSON.stringify(payload));
    console.log('Saved editable content to localStorage (filmcuts-edit)');
  }

  // Media storage helpers
  function loadMediaMap(){
    try{
      return JSON.parse(localStorage.getItem(MEDIA_KEY) || '{}');
    }catch{ return {}; }
  }
  function saveMediaMap(map){
    localStorage.setItem(MEDIA_KEY, JSON.stringify(map));
  }

  function renderMediaForCard(cardKey){
    const map = loadMediaMap();
    const arr = map[cardKey] || [];
    const card = document.querySelector(`[data-key="${cardKey}"]`);
    if(!card) return;
    const container = card.querySelector('[data-media]');
    container.innerHTML = '';
    arr.forEach((item, idx) => {
      let el;
      if(item.type && item.type.startsWith('video')){
        el = document.createElement('video');
        el.controls = true;
        el.src = item.data;
      } else {
        el = document.createElement('img');
        el.src = item.data;
        el.alt = item.name || '';
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'media-item';
      wrapper.style.position = 'relative';
      wrapper.appendChild(el);

      const remove = document.createElement('button');
      remove.className = 'btn remove-media';
      remove.textContent = 'Odstranit';
      remove.style.position = 'absolute';
      remove.style.right = '8px';
      remove.style.top = '8px';
      remove.dataset.card = cardKey;
      remove.dataset.index = idx;
      wrapper.appendChild(remove);

      container.appendChild(wrapper);
    });
  }

  function loadFromLocal() {
    try{
      const raw = localStorage.getItem('filmcuts-edit');
      if (!raw) return;
      const payload = JSON.parse(raw);
      const items = document.querySelectorAll('[data-editable="true"]');
      items.forEach((el) => {
        const key = el.getAttribute('data-key');
        if (key && payload[key]) el.innerHTML = payload[key];
      });
      console.log('Loaded editable content from localStorage');
    }catch(e){console.warn('Could not load saved edits', e)}
  }

  // Load media on start and render
  function loadMediaAndRender(){
    const map = loadMediaMap();
    Object.keys(map).forEach(k => renderMediaForCard(k));
  }

  // Toggle handler
  toggle && toggle.addEventListener('click', () => {
    const enabled = !document.body.classList.contains(EDIT_CLASS);
    setEditable(enabled);
    if (!enabled) saveToLocal();
  });

  // Add-media click handler (delegation)
  document.addEventListener('click', (e) => {
    if(e.target && e.target.matches('.add-media')){
      const card = e.target.closest('.card');
      if(!card) return;
      const key = card.getAttribute('data-key');
      fileInput.dataset.targetKey = key;
      fileInput.value = null;
      fileInput.click();
    }
    if(e.target && e.target.matches('.remove-media')){
      const key = e.target.dataset.card;
      const idx = Number(e.target.dataset.index);
      const map = loadMediaMap();
      if(map[key]){
        map[key].splice(idx,1);
        saveMediaMap(map);
        renderMediaForCard(key);
      }
    }
  });

  // handle files selected
  fileInput && fileInput.addEventListener('change', (ev) => {
    const files = Array.from(ev.target.files || []);
    const key = fileInput.dataset.targetKey;
    if(!key || files.length === 0) return;
    const map = loadMediaMap();
    map[key] = map[key] || [];
    let pending = files.length;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        map[key].push({name: file.name, type: file.type, data: e.target.result});
        pending -= 1;
        if(pending === 0){
          saveMediaMap(map);
          renderMediaForCard(key);
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // keyboard shortcut: Ctrl/Cmd + S to save when in edit mode
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      if (document.body.classList.contains(EDIT_CLASS)) {
        e.preventDefault();
        saveToLocal();
        // small visual feedback
        toggle.classList.add('saved');
        setTimeout(()=>toggle.classList.remove('saved'), 700);
      }
    }
  });

  // Load saved content and media on start
  document.addEventListener('DOMContentLoaded', () => {
    loadFromLocal();
    loadMediaAndRender();
  });

})();
