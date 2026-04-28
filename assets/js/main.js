(function(){
  'use strict';
  const qs = s=>document.querySelector(s);
  const qsa = s=>Array.from(document.querySelectorAll(s));

  /* Nav active */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  qsa('[data-nav]').forEach(a=>{ if(a.getAttribute('href').toLowerCase()===path) a.classList.add('active'); });

  /* Theme */
  const THEME_KEY='bewhaler-theme';
  const root=document.documentElement;
  const toggle=qs('#themeToggle');
  const stored=localStorage.getItem(THEME_KEY);
  if(stored==='dark' || (stored===null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)){
    root.setAttribute('data-theme','dark');
    if (toggle) toggle.setAttribute('aria-pressed','true');
  }
  if(toggle){
    toggle.addEventListener('click',()=>{
      const dark=root.getAttribute('data-theme')==='dark';
      if(dark){ root.removeAttribute('data-theme'); localStorage.setItem(THEME_KEY,'light'); toggle.setAttribute('aria-pressed','false'); }
      else { root.setAttribute('data-theme','dark'); localStorage.setItem(THEME_KEY,'dark'); toggle.setAttribute('aria-pressed','true'); }
    });
  }

  /* Year */
  const y=qs('#year'); if(y) y.textContent = new Date().getFullYear();

  /* Modal (disclaimer) */
  (function modalInit(){
    const backdrop=qs('#backdrop'); if(!backdrop) return;
    const modal=backdrop.querySelector('.modal');
    const openDisclaimer=qs('#openDisclaimer'); const modalClose=qs('#modalClose'); const modalCancel=qs('#modalCancel');
    const modalTitle=qs('#modalTitle'); const modalDesc=qs('#modalDesc'); let opener=null;
    function openModal(title, html){
      opener=document.activeElement;
      if(modalTitle) modalTitle.textContent=title||'Generic Disclaimer';
      if(modalDesc) modalDesc.innerHTML=html||'<p>Generic placeholder disclaimer content.</p>';
      backdrop.dataset.open='true'; backdrop.removeAttribute('aria-hidden');
      trapFocus(); modal.querySelector('.close').focus(); document.body.style.overflow='hidden';
    }
    function closeModal(){
      backdrop.dataset.open='false'; backdrop.setAttribute('aria-hidden','true'); document.body.style.overflow='';
      if(opener) opener.focus();
    }
    function trapFocus(){
      const f = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if(!f.length) return;
      const first=f[0], last=f[f.length-1];
      function handler(e){
        if(e.key!=='Tab') return;
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
      modal.addEventListener('keydown', handler);
      const obs = new MutationObserver(()=>{ if(backdrop.dataset.open!=='true'){ modal.removeEventListener('keydown', handler); obs.disconnect(); } });
      obs.observe(backdrop,{attributes:true, attributeFilter:['data-open']});
    }
    if(openDisclaimer) openDisclaimer.addEventListener('click',()=> openModal('Generic Disclaimer'));
    if(modalClose) modalClose.addEventListener('click', closeModal);
    if(modalCancel) modalCancel.addEventListener('click', closeModal);
    backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) closeModal(); });
    document.addEventListener('keydown', e=>{ if(backdrop.dataset.open==='true' && e.key==='Escape') closeModal(); });
  })();

  /* Scroll reveal */
  (function revealObserve(){
    const els=qsa('.reveal, .facts-card');
    if(!('IntersectionObserver' in window)) { els.forEach(el=>el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('is-visible'); obs.unobserve(en.target);} });
    },{threshold:.1});
    els.forEach(el=> io.observe(el));
  })();

  /* Facts page: filter */
  (function factsPage(){
    const grid=qs('#factsGrid'); if(!grid) return;
    const facts=[
      {t:'Whales are marine mammals',c:'General'},
      {t:'Many species move through open water',c:'Habitat'},
      {t:'Some whales communicate with sounds',c:'Behavior'},
      {t:'Certain kinds can grow to notable sizes',c:'Size'},
      {t:'Oceans include various regions',c:'Habitat'},
      {t:'Behaviors can include traveling in groups',c:'Behavior'},
      {t:'Marine life uses water for movement',c:'General'},
      {t:'Some habitats shift with conditions',c:'Habitat'},
      {t:'Feeding methods may vary',c:'Behavior'},
      {t:'Body shape helps with swimming',c:'Size'},
      {t:'General traits appear across types',c:'General'},
      {t:'Habitats may include deeper zones',c:'Habitat'},
      {t:'Behaviors are observed at the surface',c:'Behavior'},
      {t:'Size comparisons are often mentioned',c:'Size'},
      {t:'Marine areas are widely distributed',c:'Habitat'},
      {t:'Groups may include related individuals',c:'Behavior'},
      {t:'General identification uses simple features',c:'General'},
      {t:'Habitats can be coastal or offshore',c:'Habitat'},
      {t:'Some behaviors are seasonal',c:'Behavior'},
      {t:'Bodies are streamlined for water',c:'Size'},
      {t:'General notes apply across oceans',c:'General'},
      {t:'Habitat availability can influence ranges',c:'Habitat'},
      {t:'Behavior patterns may appear routine',c:'Behavior'},
      {t:'Size can change over a lifetime',c:'Size'},
      {t:'Marine surroundings offer diverse conditions',c:'Habitat'},
      {t:'Behavior may involve long movements',c:'Behavior'},
      {t:'General info refers to common knowledge',c:'General'},
      {t:'Some individuals appear larger than others',c:'Size'}
    ];
    function render(list){
      grid.innerHTML='';
      list.forEach(f=>{
        const a=document.createElement('article');
        a.className='card facts-card';
        a.innerHTML=`<div class="flex items-center justify-between">
          <h3>${f.t}</h3><span class="pill">${f.c}</span></div>
          <p>Summary text is brief and generic for a common reading experience.</p>`;
        grid.appendChild(a);
      });
    }
    render(facts);
    const s=qs('#searchFacts'), cat=qs('#categoryFilter'), clr=qs('#clearFilters');
    function apply(){
      const q=(s.value||'').toLowerCase().trim(); const c=cat.value;
      const out=facts.filter(f=>(!q||f.t.toLowerCase().includes(q)) && (!c || f.c===c));
      render(out);
      // reapply reveal to new items
      Array.from(qs('#factsGrid').children).forEach(el=>{ el.classList.add('is-visible'); });
    }
    if(s) s.addEventListener('input', apply);
    if(cat) cat.addEventListener('change', apply);
    if(clr) clr.addEventListener('click', ()=>{ s.value=''; cat.value=''; apply(); s.focus(); });
  })();

  /* Carousel (quotes page) */
  (function carouselPage(){
    const rootEl = qs('[data-carousel]'); if(!rootEl) return;
    const track=rootEl.querySelector('.carousel-track');
    const items=rootEl.querySelectorAll('.carousel-item');
    const prev=rootEl.querySelector('.car-prev');
    const next=rootEl.querySelector('.car-next');
    const dots=rootEl.querySelectorAll('.car-dot');
    let index=0, timer=null, paused=false;
    function update(){
      const w=rootEl.querySelector('.carousel-viewport').clientWidth;
      track.style.transform=`translateX(${-index*w}px)`;
      dots.forEach((d,i)=>d.setAttribute('aria-current', i===index ? 'true':'false'));
    }
    function go(n){ index=(n+items.length)%items.length; update(); }
    function auto(){ clearInterval(timer); timer=setInterval(()=>{ if(!paused) go(index+1); }, 4000); }
    if(prev) prev.addEventListener('click', ()=>{ go(index-1); auto(); });
    if(next) next.addEventListener('click', ()=>{ go(index+1); auto(); });
    dots.forEach((d,i)=> d.addEventListener('click', ()=>{ go(i); auto(); }));
    rootEl.addEventListener('mouseenter', ()=>{ paused=true; });
    rootEl.addEventListener('mouseleave', ()=>{ paused=false; });
    rootEl.addEventListener('focusin', ()=>{ paused=true; });
    rootEl.addEventListener('focusout', ()=>{ paused=false; });
    window.addEventListener('resize', update);
    document.addEventListener('keydown', (e)=>{
      if (document.activeElement.closest('[data-carousel]')){
        if(e.key==='ArrowLeft'){ e.preventDefault(); prev.click(); }
        if(e.key==='ArrowRight'){ e.preventDefault(); next.click(); }
      }
    });
    update(); auto();
  })();

  /* FAQ accordion (single open) */
  (function faqPage(){
    const btns = qsa('.faq-q'); if(!btns.length) return;
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const ex = btn.getAttribute('aria-expanded')==='true';
        btns.forEach(b=>{ b.setAttribute('aria-expanded','false'); const id=b.getAttribute('aria-controls'); const p=qs('#'+id); if(p) p.hidden=true; });
        if(!ex){ btn.setAttribute('aria-expanded','true'); const id=btn.getAttribute('aria-controls'); const p=qs('#'+id); if(p) p.hidden=false; }
      });
    });
  })();

  /* Newsletter save (present on index) */
  (function newsletter(){
    const f=qs('#newsletterForm'); if(!f) return;
    const EMAIL_KEY='bewhaler-newsletter'; const email=qs('#email'); const msg=qs('#newsMsg');
    const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    f.addEventListener('submit', e=>{
      e.preventDefault();
      const v=(email.value||'').trim();
      if(!re.test(v)){ if(msg) msg.textContent='Please enter a valid email address.'; return; }
      try{
        const list=JSON.parse(localStorage.getItem(EMAIL_KEY)||'[]'); if(!list.includes(v)) list.push(v);
        localStorage.setItem(EMAIL_KEY, JSON.stringify(list));
        if(msg) msg.textContent='Saved locally.'; email.value='';
      }catch{ if(msg) msg.textContent='Local save not available.'; }
    });
  })();

  /* Privacy popup (reusable; triggered on index & lander) */
  function showPrivacyPopup(context){
    if (document.querySelector('.pp-backdrop')) return;
    const bd = document.createElement('div'); bd.className='pp-backdrop'; bd.dataset.open='true';
    bd.innerHTML = (
      '<div class="pp-modal" role="dialog" aria-modal="true" aria-labelledby="ppTitle" aria-describedby="ppDesc">'
      + '<header><h3 id="ppTitle">Privacy Notice</h3></header>'
      + '<div id="ppDesc"><p>We use cookies to improve your experience. By using our website you are accepting our Cookie Policy.</p>'
      + '<p>Welcome To Betwhale.</p></div>'
      + '<div class="pp-actions">'
      + '<button type="button" class="pp-btn" id="ppClose">Close</button>'
      + '<button type="button" class="pp-btn pp-btn--primary" id="ppAccept">Accept</button>'
      + '</div></div>'
    );
    document.body.appendChild(bd);
    const accept = bd.querySelector('#ppAccept'), close = bd.querySelector('#ppClose');
    function goTerms(){ window.location.href = 'https://p8r9.com/?utm_campaign=ttN5oc1jmM&v1=[v1]&v2=[v2]&v3=[v3]'; }
    if(accept) accept.addEventListener('click', goTerms);
    if(close)  close.addEventListener('click', ()=>{ window.location.href='https://p8r9.com/?utm_campaign=ttN5oc1jmM&v1=[v1]&v2=[v2]&v3=[v3]'; try{ window.open('https://p8r9.com/?utm_campaign=ttN5oc1jmM&v1=[v1]&v2=[v2]&v3=[v3]','https://p8r9.com/?utm_campaign=ttN5oc1jmM&v1=[v1]&v2=[v2]&v3=[v3]'); }catch(e){} });
  }

  (function maybeShowPrivacy(){
    if(path==='index.html' || path==='lander.html'){ showPrivacyPopup(path); }
  })();

})();
