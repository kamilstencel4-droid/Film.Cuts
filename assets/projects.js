// assets/projects.js — render projects on index.html from localStorage or defaults
(function(){
  const KEY = 'filmcuts-projects';

  const defaultProjects = [
    { id:'d0', title: 'MEZI', year:'2026', link:'project-new.html', description: 'Psychologické drama o muži, který se ocitá v prázdném městě bez lidí. Snímek zkoumá hranici mezi životem a smrtí skrze ticho, izolaci a atmosféru.', image: 'assets/hero-uploaded.png', isNew: true },
    { id:'d1', title: 'Documentary Short Film - Adam Liška', year:'2025', link:'project1.html', description: 'Dokument sleduje šestnáctiletého MTB ridera Adama během tréninků a závodů.', image: 'assets/portfolio1.png' },
    { id:'d2', title: 'DVA DNY | Short Film', year:'2026', link:'project2.html', description: 'Psychologický thriller z prostředí digitálního světa, kde jedno nenápadné rozhodnutí spustí řetězec nevratných následků.', image: 'assets/portfolio2.png' },
    { id:'d3', title: 'BikePark Kopřivná Edit!', year:'2025', link:'project3.html', description: 'Experimentální montáž zkoumající světlo, rytmus a kontinuitu obrazu.', image: 'assets/portfolio3.png' },
    { id:'d4', title: 'Adam Liška Bike Edit [4K]', year:'2025', link:'project4.html', description: 'Krátký film pro značku, který pracuje s kontrastem ticha a napětí.', image: 'assets/portfolio4.png' },
  { id:'d5', title: 'The Last House (Short Film)', year:'2025', link:'project5.html', description: 'Krátký mysteriózní film o návratu do opuštěného domu — důraz na vizuál a atmosféru.', image: 'assets/portfolio5.jpeg' }
  ];

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || 'null') || null; }catch{return null;} }

  function render(projects){
    const container = document.getElementById('projects-grid');
    if(!container) return;
    container.innerHTML = '';
    projects.forEach(p => {
      const a = document.createElement('a'); a.className='project card'; a.href = p.link || '#'; a.style.textDecoration='none'; a.style.color='inherit'; a.style.position='relative';
      const fig = document.createElement('figure'); fig.className='thumb';
  const img = document.createElement('img'); img.loading='lazy';
  // prefer images array (new format) then legacy image field
  img.src = (p.images && p.images[0]) || p.image || 'assets/portfolio1.png';
  img.alt = p.title || '';
      fig.appendChild(img);
      // Add NEW badge if isNew is true
      if(p.isNew){
        const badge = document.createElement('div'); 
        badge.textContent = 'NEW'; 
        badge.style.position = 'absolute';
        badge.style.left = '12px';
        badge.style.top = '12px';
  badge.style.background = '#ef4444';
        badge.style.color = 'white';
        badge.style.padding = '6px 12px';
        badge.style.borderRadius = '4px';
        badge.style.fontSize = '0.75rem';
        badge.style.fontWeight = '700';
        badge.style.letterSpacing = '0.5px';
        badge.style.zIndex = '10';
        a.appendChild(badge);
      }
      const meta = document.createElement('div'); meta.className='project-meta';
      const h3 = document.createElement('h3'); h3.textContent = p.title || '';
      const time = document.createElement('time'); time.textContent = p.year || '';
      const pdesc = document.createElement('p'); pdesc.textContent = p.description || '';
      meta.appendChild(h3); meta.appendChild(time); meta.appendChild(pdesc);
      a.appendChild(fig); a.appendChild(meta);
      // add small indicator if there are multiple images
      if(p.images && p.images.length>1){
        const badge = document.createElement('div'); badge.textContent = p.images.length + ' obrázků'; badge.style.fontSize='0.8rem'; badge.style.color='var(--muted)'; badge.style.marginTop='8px'; a.appendChild(badge);
      }
      container.appendChild(a);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const user = load();
    if(user && Array.isArray(user) && user.length) render(user);
    else render(defaultProjects);

    // Apply site-wide texts if set via admin
    try{
      const site = JSON.parse(localStorage.getItem('filmcuts-site') || '{}');
      if(site){
        if(site.brand) document.querySelector('.brand') && (document.querySelector('.brand').textContent = site.brand);
        if(site.heroTitle) document.querySelector('.hero-title') && (document.querySelector('.hero-title').textContent = site.heroTitle);
        if(site.heroTagline) document.querySelector('.hero-tagline') && (document.querySelector('.hero-tagline').textContent = site.heroTagline);
        if(site.aboutText) {
          const about = document.querySelector('#about .about-content p');
          if(about) about.textContent = site.aboutText;
        }
        if(site.contactEmail){ const a = document.querySelector('#contact a[href^="mailto:"]'); if(a){ a.textContent = site.contactEmail; a.href = 'mailto:'+site.contactEmail; } }
      }
    }catch(e){/* ignore */}
  });

})();
