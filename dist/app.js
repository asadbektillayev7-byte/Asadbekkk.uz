(() => {
  'use strict';
  const data = window.CV_CONTENT;
  if (!data) return;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = value => {
    if (!value || typeof value !== 'string') return '';
    try { const parsed = new URL(value, location.href); return ['https:','http:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; }
  };
  const paths = {
    gear:'<path d="m9 3 1-1h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 8l2-4 3 1 3-1Z"/><circle cx="12" cy="12" r="3"/>',
    code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
    book:'<path d="M12 5v16M2 3h5a5 5 0 0 1 5 3 5 5 0 0 1 5-3h5v17h-5a5 5 0 0 0-5 2 5 5 0 0 0-5-2H2Z"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m4 11v-3a6 6 0 0 0-4-5"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="m8 13-2 9 6-3 6 3-2-9"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12a20 20 0 0 0 18 0m-9 0v3"/>',
    graduation:'<path d="m2 8 10-5 10 5-10 5Zm4 3v6c4 3 8 3 12 0v-6m4-3v8"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
    globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a17 17 0 0 0 0 20 17 17 0 0 0 0-20Z"/>',
    camera:'<path d="m7 5 2-3h6l2 3h4v15H3V5Z"/><circle cx="12" cy="12" r="4"/>',
    lightbulb:'<path d="M9 18h6m-6 3h6M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z"/>',
    heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 1 10 8 16 7-6 13-11 8-16Z"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>',
    phone:'<path d="m6 3 4 5-3 3a15 15 0 0 0 6 6l3-3 5 4c-1 4-3 5-7 3C7 18 2 12 2 6c0-2 1-3 4-3Z"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-11v1m4 10v-7m0 3c0-4 6-4 6 0v4"/>',
    github:'<path d="M9 20c-5 1-5-2-7-2m15 5v-4c0-1-.4-2-1-2 4-.5 6-2 6-6a5 5 0 0 0-1-3c.5-1 .5-3 0-4-2 0-3 1-4 2a15 15 0 0 0-8 0C8 5 7 4 5 4c-.5 1-.5 3 0 4a5 5 0 0 0-1 3c0 4 2 6 6 6-.6 0-1 1-1 2v4"/>',
    telegram:'<path d="m22 2-7 20-5-8-8-5Zm-12 12L22 2"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>',
    article:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8m-8 4h8m-8 4h5"/>',
    external:'<path d="M14 3h7v7m0-7L10 14m0-10H3v17h17v-7"/>',
    trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-4 0h8"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.lightbulb}</svg>`;
  const tags = values => `<div class="tags">${(values||[]).map(value=>`<span class="tag">${esc(value)}</span>`).join('')}</div>`;
  const dialog = $('#detail-dialog');
  let lastFocus;
  function showDialog(title, body, badge='CONTENT TO BE ADDED') {
    lastFocus = document.activeElement;
    $('#dialog-content').innerHTML=`<div class="dialog-badge">${esc(badge)}</div><h2 id="dialog-title">${esc(title)}</h2>${body}`;
    dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';
  }
  function placeholder(title,description) {showDialog(title,`<p>${esc(description || 'This space is reserved for your own content. The details will be added here when they are ready.')}</p>`);}
  $('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  function linksMarkup(links,fallbackLabel) {
    const valid=(links||[]).filter(link=>url(link.url));
    return `<div class="card-links">${valid.length?valid.map(link=>`<a class="outline-link" href="${esc(url(link.url))}" target="_blank" rel="noopener noreferrer">${icon('external')}${esc(link.label)}</a>`).join(''):`<button class="outline-link placeholder-link" data-placeholder-title="${esc(fallbackLabel)}">${icon('external')} Details to be added</button>`}</div>`;
  }
  function thumb(item,index,community=false) {
    const src=url(item.imageSrc);
    const positions=['18% 5%','90% 7%','42% 48%','88% 50%','10% 95%','78% 95%','50% 10%','10% 50%'];
    return `<div class="card-image${src?'':' sample-photo'}"${!src?` style="background-position:center,${positions[index%positions.length]}"`:''}>${src?`<img src="${esc(src)}" alt="${esc(item.imageAlt||item.title)}" loading="lazy">`:'<span class="sample-tag">PHOTO TO ADD · SAMPLE IMAGE</span>'}<div class="card-image-meta"><span class="card-icon">${icon(community?'users':'award')}</span><span class="card-date">${esc(item.date)}</span></div></div>`;
  }
  function renderStats(selector,items) {
    const names=['code','briefcase','trophy','users','book','globe'];
    $(selector).innerHTML=items.map((item,i)=>`<div class="stat-card">${icon(names[i%names.length])}<strong>${esc(item.value)}</strong><p>${esc(item.label)}</p></div>`).join('');
  }
  document.querySelectorAll('[data-profile-name]').forEach(el=>el.textContent=data.profile.name);
  $('#hero-name').textContent=data.profile.name.toUpperCase()+'?';
  $('#profile-headline').textContent=data.profile.headline;
  $('#profile-subheadline').textContent=data.profile.subheadline;
  $('#profile-intro').textContent=data.profile.intro;
  document.title=`${data.profile.name} | Personal CV`;
  $('#about-roles').innerHTML=data.roles.map((item,i)=>`<div class="role-card"><div class="role-title">${icon(['gear','code','book','users'][i])}<h4>${esc(item.title)}</h4></div><p>${esc(item.description)}</p></div>`).join('');
  renderStats('#about-stats',data.aboutStats);
  if(url(data.profile.introVideoUrl)) { $('#intro-video').setAttribute('aria-label','Play introduction video'); $('.video-placeholder-label').textContent='WATCH MY INTRODUCTION'; }
  $('#intro-video').addEventListener('click',()=>{const destination=url(data.profile.introVideoUrl);if(destination)window.open(destination,'_blank','noopener,noreferrer');else placeholder('Your introduction video','A short introduction will appear here. This is a place for your voice, your interests, and the story you want to share.');});
  $('#achievements-grid').innerHTML=data.achievements.map((item,i)=>`<article class="achievement-card">${thumb(item,i)}<div class="card-body"><h3>${esc(item.title)}</h3><p class="card-subtitle">${esc(item.subtitle)}</p><p class="card-organization">${esc(item.organization)}</p><p class="card-description">${esc(item.description)}</p>${tags(item.tags)}${linksMarkup(item.links,item.title)}</div></article>`).join('');
  $('#experience-list').innerHTML=data.experiences.map(item=>`<article class="experience-card"><h4>${esc(item.title)}</h4><div class="experience-org-row">${esc(item.organization)}<span class="type-tag">${esc(item.type)}</span></div><div class="experience-meta">${icon('calendar')}${esc(item.dates)}</div><div class="experience-meta">${icon('pin')}${esc(item.location)}</div><ul class="experience-bullets">${item.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></article>`).join('');
  $('#education-list').innerHTML=data.education.map(item=>`<article class="education-card"><h4>${esc(item.title)}<span class="education-date">${esc(item.dates)}</span></h4><p>${esc(item.organization)}</p><p>${esc(item.description)}</p></article>`).join('');
  $('#skills-list').innerHTML=data.skillGroups.map(item=>`<div class="skill-group"><h4>${esc(item.title)}</h4>${tags(item.items)}</div>`).join('');
  $('#languages-list').innerHTML=data.languages.map(item=>`<div class="language-row"><span>${esc(item.name)}</span><span>${esc(item.level)}</span></div>`).join('');
  $('#projects-grid').innerHTML=data.projects.map((item,i)=>`<button class="project-card" data-project="${i}">${url(item.imageSrc)?`<img class="project-image" src="${esc(url(item.imageSrc))}" alt="${esc(item.imageAlt||item.title)}" loading="lazy">`:""}${icon(['gear','code','lightbulb'][i])}<span class="tag">${esc(item.category)} · ${esc(item.status)}</span><h4>${esc(item.title)}</h4><p>${esc(item.description)}</p><span class="project-open">Explore this project space ↗</span></button>`).join('');
  document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{const project=data.projects[Number(button.dataset.project)];showDialog(project.title,`<p>${esc(project.description)}</p><div class="dialog-meta"><div><strong>MY ROLE</strong><span>${esc(project.role)}</span></div><div><strong>STATUS</strong><span>${esc(project.status)}</span></div></div><h3>Design & Development</h3><p>${esc(project.process)}</p><h3>Testing & Outcome</h3><p>${esc(project.result)}</p>`,project.category.toUpperCase()+' · '+project.status.toUpperCase());}));
  renderStats('#community-stats',data.communityStats);
  $('#community-grid').innerHTML=data.communities.map((item,i)=>`<article class="community-card">${thumb(item,i+2,true)}<div class="card-body"><h3>${esc(item.title)}</h3><div class="community-role">${icon('users')}${esc(item.role)}</div><p class="card-description">${esc(item.description)}</p>${tags(item.tags)}${linksMarkup(item.links,item.title)}</div></article>`).join('');
  $('#community-places').innerHTML=data.places.map(item=>`<div class="place-card"><h4>${icon('globe')}${esc(item.title)}</h4><p>${esc(item.description)}</p></div>`).join('');
  renderStats('#media-stats',data.mediaStats);
  $('#video-grid').innerHTML=data.videos.map((item,i)=>`<button class="video-card media-button" data-video="${i}"><div class="video-thumbnail sample-photo" style="background-position:center,${i?'right bottom':'left top'}">${url(item.imageSrc)?`<img src="${esc(url(item.imageSrc))}" alt="${esc(item.title)}" loading="lazy">`:''}${url(item.url)?"":'<span class="sample-tag">VIDEO TO ADD</span>'}<span class="play-circle" aria-hidden="true">▶</span></div><div class="video-body"><p class="video-platform">${esc(item.outlet)}</p><h4>${esc(item.title)}</h4><p>${esc(item.description)}</p></div></button>`).join('');
  document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{const item=data.videos[Number(button.dataset.video)];if(url(item.url))window.open(url(item.url),'_blank','noopener,noreferrer');else placeholder(item.title,item.description);}));
  $('#media-links').innerHTML=data.mediaLinks.map(item=>url(item.url)?`<a class="small-media-link" href="${esc(url(item.url))}" target="_blank" rel="noopener noreferrer"><strong>${esc(item.title)} ↗</strong><span>${esc(item.outlet)}</span></a>`:`<button class="small-media-link" data-placeholder-title="${esc(item.title)}"><strong>${esc(item.title)}</strong><span>${esc(item.outlet)} · Link to add</span></button>`).join('');
  const article=data.article;
  $('#article-card').innerHTML=`<${url(article.url)?'a':'button'} class="article-card" ${url(article.url)?`href="${esc(url(article.url))}" target="_blank" rel="noopener noreferrer"`:`data-placeholder-title="${esc(article.title)}"`}>${icon('article')}<div><h4>${esc(article.title)}</h4><p>${esc(article.description)}</p><span>${esc(article.outlet)}${url(article.url)?' ↗':' · Link to add'}</span></div></${url(article.url)?'a':'button'}>`;
  $('#media-outlets').innerHTML=tags(data.outlets);
  $('#hobbies-list').innerHTML=data.hobbies.map((item,i)=>`<article class="personal-card"><div class="personal-title"><span class="personal-icon">${icon(['camera','book','heart'][i])}</span><h4>${esc(item.title)}</h4></div><p>${esc(item.description)}</p></article>`).join('');
  $('#facts-list').innerHTML=data.facts.map((item,i)=>`<article class="personal-card"><div class="personal-title"><span class="personal-icon">${icon(['lightbulb','heart','user','globe'][i])}</span><h4>${esc(item.title)}</h4></div><p>${esc(item.description)}</p></article>`).join('');
  const email=data.profile.email,phone=data.profile.phone;
  const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneDigits=String(phone||'').replace(/[^\d+]/g,'');
  function contactCard(type,title,text,caption,href,extra='') {return `<${href?'a':'div'} class="contact-card ${extra}"${href?` href="${esc(href)}"`:''}>${icon(type)}<h3>${title}</h3><strong>${esc(text)}</strong><small>${caption}</small></${href?'a':'div'}>`;}
  $('#contact-methods').innerHTML=contactCard('mail','Email',emailValid?email:'Email to be added','For conversations and collaboration',emailValid?'mailto:'+encodeURIComponent(email):'')+contactCard('phone','Mobile Number',phoneDigits||'Number to be added','Your preferred way to connect',phoneDigits?'tel:'+phoneDigits:'')+contactCard('pin','Location',data.profile.location||'Location to be added','A little context about where I’m based.','','location-card');
  const socials=[['linkedin','LinkedIn','linkedinUrl'],['telegram','Telegram','telegramUrl'],['instagram','Instagram','instagramUrl'],['github','GitHub','githubUrl']];
  $('#social-links').innerHTML=socials.map(([type,label,key])=>`<${url(data.profile[key])?'a':'button'} class="social-link" ${url(data.profile[key])?`href="${esc(url(data.profile[key]))}" target="_blank" rel="noopener noreferrer"`:`data-placeholder-title="${label} profile"`}>${icon(type)}<div>${label}<small>${url(data.profile[key])?'Visit my profile ↗':'Profile to be added'}</small></div></${url(data.profile[key])?'a':'button'}>`).join('');
  $('#availability-tags').innerHTML=data.availability.map(item=>`<span>✓ ${esc(item)}</span>`).join('');
  $('#footer-socials').innerHTML=socials.map(([type,label,key])=>`<${url(data.profile[key])?'a':'button'} class="footer-social-button" aria-label="${label}${url(data.profile[key])?'':' profile to be added'}" ${url(data.profile[key])?`href="${esc(url(data.profile[key]))}" target="_blank" rel="noopener noreferrer"`:`data-placeholder-title="${label} profile"`}>${icon(type)}</${url(data.profile[key])?'a':'button'}>`).join('');
  $('#cv-link').addEventListener('click',()=>{if(url(data.profile.cvUrl))window.open(url(data.profile.cvUrl),'_blank','noopener,noreferrer');else placeholder('My CV, coming soon','A downloadable CV will be available here once it is ready.');});
  if(url(data.profile.portraitSrc))$('#contact-portrait').innerHTML=`<img src="${esc(url(data.profile.portraitSrc))}" alt="${esc(data.profile.portraitAlt)}" loading="lazy">`;
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  document.querySelectorAll('[data-placeholder-title]').forEach(button=>button.addEventListener('click',()=>placeholder(button.dataset.placeholderTitle)));
  const nav=$('#navigation'),menu=$('.menu-toggle');
  function closeMenu(){nav.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  document.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('menu-open')){closeMenu();menu.focus();}});
  const media=window.matchMedia('(min-width:768px)');media.addEventListener('change',event=>{if(event.matches)closeMenu();});
  let queued=false;
  function navScroll(){nav.classList.toggle('scrolled',scrollY>50);queued=false;}
  window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(navScroll);}},{passive:true});navScroll();
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.nav-links a').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}});},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));}
})();
