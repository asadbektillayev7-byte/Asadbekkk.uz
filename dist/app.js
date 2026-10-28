(() => {
  'use strict';
  const content = window.PORTFOLIO_CONTENT;
  if (!content) return;
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = value => {
    if (!value || typeof value !== 'string') return '';
    try { const url = new URL(value, location.href); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  let artIndex = 0;
  const gearPath = (radius, teeth) => {
    const points = [];
    for (let i = 0; i < teeth * 4; i++) {
      const angle = i / (teeth * 4) * Math.PI * 2;
      const r = i % 4 === 1 || i % 4 === 2 ? radius : radius * .86;
      points.push(`${i ? 'L' : 'M'}${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`);
    }
    return points.join(' ') + 'Z';
  };
  function projectArt(type) {
    const id = `art-${++artIndex}`;
    const open = `<svg class="project-art" viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0v30" fill="none" stroke="currentColor" stroke-width=".5" opacity=".18"/></pattern></defs>`;
    if (type === 'software') return open + `<rect width="600" height="420" fill="#284237"/><rect width="600" height="420" fill="url(#${id})" color="#d1dfbf"/><g transform="translate(74 68) rotate(-5 226 145)"><rect x="7" y="10" width="452" height="290" rx="8" fill="#162c22"/><rect width="452" height="290" rx="8" fill="#314c3e" stroke="#8b9e7b" stroke-width="1"/><path d="M0 39h452" stroke="#6d8361" stroke-width="1"/><g fill="#e3a178"><circle cx="20" cy="20" r="4"/><circle cx="35" cy="20" r="4" opacity=".65"/><circle cx="50" cy="20" r="4" opacity=".35"/></g><text x="226" y="24" text-anchor="middle" font-family="monospace" font-size="11" fill="#bccbb0">a little possibility</text><g font-family="monospace" font-size="17"><text x="26" y="85" fill="#e9b28d">function <tspan fill="#d5dfca">explore(idea) {</tspan></text><text x="45" y="123" fill="#d5dfca">const question = "what if?";</text><text x="45" y="161" fill="#b4c99c">return makeSomething(idea);</text><text x="26" y="199" fill="#d5dfca">}</text><text x="26" y="249" fill="#8ba67b">// a space for your code</text><rect x="315" y="234" width="8" height="18" fill="#e3a178"/></g></g><text x="30" y="395" font-family="monospace" font-size="10" fill="#a0b58d">SOFTWARE / IMAGE TO REPLACE</text></svg>`;
    if (type === 'systems') return open + `<rect width="600" height="420" fill="#e3ad86"/><rect width="600" height="420" fill="url(#${id})" color="#704e36"/><g fill="none" stroke="#654c36" stroke-width="1"><path d="M70 210h92m276 0h92M300 32v58m0 240v58" stroke-dasharray="4 5"/><circle cx="300" cy="210" r="153" opacity=".4"/><circle cx="300" cy="210" r="125" opacity=".4"/></g><g transform="translate(300 210)"><g transform="rotate(-15)"><path d="${gearPath(108,16)}" fill="#ce895d" stroke="#78563c" stroke-width="1.5"/><circle r="69" fill="#e3ad86" stroke="#78563c"/><circle r="41" fill="#243d34"/><circle r="10" fill="#f3d4b5"/><path d="M-93 0H93M0-93V93" stroke="#78563c" stroke-dasharray="4 5"/></g><path d="M-135 70l-40 25v48h64M135-70l40-25v-48h-64" fill="none" stroke="#243d34" stroke-width="2"/><circle cx="-111" cy="143" r="4" fill="#243d34"/><circle cx="111" cy="-143" r="4" fill="#243d34"/></g><rect x="39" y="35" width="98" height="35" fill="#f4d3b4"/><text x="88" y="57" text-anchor="middle" fill="#654c36" font-family="monospace" font-size="12">{ input }</text><rect x="463" y="350" width="98" height="35" fill="#243d34"/><text x="512" y="372" text-anchor="middle" fill="#f3d4b5" font-family="monospace" font-size="12">→ motion</text><text x="30" y="395" font-family="monospace" font-size="10" fill="#79553b">SYSTEMS / IMAGE TO REPLACE</text></svg>`;
    return open + `<rect width="600" height="420" fill="#e7e4d8"/><rect width="600" height="420" fill="url(#${id})" color="#718265"/><g fill="none" stroke="#718265" stroke-width="1"><path d="M66 45v310h468M66 322h468" opacity=".55"/><path d="M110 60v300m380-300v300M110 76h380" stroke-dasharray="3 5" opacity=".5"/><path d="M106 71l4 5 4-5m372 0 4 5 4-5"/><text x="300" y="63" text-anchor="middle" fill="#718265" stroke="none" font-family="monospace" font-size="11">A SPACE FOR YOUR DESIGN</text></g><g transform="translate(300 210) rotate(-25) scale(1 .68)"><path d="${gearPath(123,20)}" transform="translate(0 25)" fill="#bfc4b1" stroke="#738366" stroke-width="1"/><path d="${gearPath(123,20)}" fill="#d1d6c3" stroke="#738366" stroke-width="1.5"/><circle r="90" fill="#e7e4d8" stroke="#738366" stroke-width="1.5"/><circle r="66" fill="#e66a3b" stroke="#b25533"/><circle r="29" fill="#e7e4d8" stroke="#b25533"/><circle cx="0" cy="-103" r="4" fill="#e7e4d8"/><circle cx="89" cy="51" r="4" fill="#e7e4d8"/><circle cx="-89" cy="51" r="4" fill="#e7e4d8"/><path d="M-160 0h320M0-160v320" stroke="#738366" stroke-width="1" stroke-dasharray="4 5"/></g><text x="30" y="395" font-family="monospace" font-size="10" fill="#718265">MECHANICAL / IMAGE TO REPLACE</text></svg>`;
  }
  function photoArt(variant) {
    const common = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"`;
    if (variant === 'portrait') return `<svg ${common}><rect width="400" height="400" fill="#c9d1b9"/><g fill="none" stroke="#748566" opacity=".55"><ellipse cx="200" cy="200" rx="123" ry="156" transform="rotate(24 200 200)"/><ellipse cx="200" cy="200" rx="123" ry="156" transform="rotate(-24 200 200)"/><path d="M15 200h370M200 10v380"/></g><text x="200" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="39" fill="#536b48">a little</text><text x="200" y="235" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="58" fill="#536b48">more me.</text><circle cx="200" cy="95" r="5" fill="#e66a3b"/></svg>`;
    if (variant === 'workbench') return `<svg ${common}><rect width="400" height="400" fill="#d8baa1"/><g stroke="#98795f" fill="none" opacity=".55"><path d="M0 50h400M0 100h400M0 150h400M0 200h400M0 250h400M0 300h400M0 350h400M50 0v400M100 0v400M150 0v400M200 0v400M250 0v400M300 0v400M350 0v400" stroke-width=".5"/><g transform="translate(200 190) rotate(15)"><rect x="-105" y="-90" width="210" height="180" fill="#ead9c2"/><circle r="61" stroke-width="2"/><circle r="36"/><path d="M-85 0H85M0-75V75" stroke-dasharray="4 4"/></g><path d="M40 310l60-38 130 20 120-30" stroke-width="2"/></g></svg>`;
    if (variant === 'community') return `<svg ${common}><rect width="400" height="400" fill="#c3cfd0"/><g fill="none" stroke="#6f8a87" stroke-width="1.2"><circle cx="115" cy="170" r="55"/><circle cx="200" cy="170" r="55"/><circle cx="285" cy="170" r="55"/><path d="M45 275q65-100 130 0m-45 0q70-100 140 0m-45 0q65-100 130 0"/><path d="M40 315h320" opacity=".4"/></g><circle cx="200" cy="170" r="7" fill="#e66a3b"/><text x="200" y="90" text-anchor="middle" font-family="monospace" font-size="10" fill="#607f7a" letter-spacing="3">PEOPLE MAKE THE STORY</text></svg>`;
    return `<svg ${common}><rect width="400" height="400" fill="#d9d7b9"/><circle cx="290" cy="95" r="38" fill="#e3ac74"/><path d="M-40 320L100 150l130 160 80-100 130 120v100H-40z" fill="#9ba384"/><path d="M-40 380L100 230l130 140 80-80 130 100v60H-40z" fill="#70816a"/><path d="M0 370q120-30 180-10t220-20v60H0z" fill="#435f51"/><g stroke="#65745b" fill="none" stroke-width="1"><path d="M20 45v-25h25m310 0h25v25M20 355v25h25m310 0h25v-25"/></g></svg>`;
  }
  const dialog = $('#detail-dialog');
  const dialogContent = $('#dialog-content');
  let previouslyFocused;
  function openDialog(markup) {
    previouslyFocused = document.activeElement;
    dialogContent.innerHTML = markup;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closeDialog() { dialog.close(); }
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect=dialog.getBoundingClientRect(); if (event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; previouslyFocused?.focus({preventScroll:true}); });

  const grid = $('#project-grid');
  content.projects.forEach(project => {
    const card = document.createElement('button');
    card.type = 'button'; card.className = 'project-card'; card.dataset.category = project.category;
    card.setAttribute('aria-label', `Explore ${project.title}`);
    const image = safeUrl(project.imageSrc);
    card.innerHTML = `<div class="project-media ${escape(project.imageType)}">${image ? `<img src="${escape(image)}" alt="${escape(project.imageAlt||project.title)}" loading="lazy">` : projectArt(project.imageType)}<span class="media-label">${escape(project.status)}</span></div><div class="project-type"><span>${escape(project.label)}</span><span>${escape(project.number)} /</span></div><div class="project-title-row"><h3>${escape(project.title)}</h3><span class="project-arrow" aria-hidden="true">↗</span></div><p class="project-description">${escape(project.description)}</p>`;
    card.addEventListener('click', () => {
      const links = [['Live demonstration',project.demoUrl],['Source code',project.repoUrl]].filter(([,url])=>safeUrl(url));
      openDialog(`<div class="dialog-cover ${escape(project.imageType)}">${image?`<img src="${escape(image)}" alt="${escape(project.imageAlt||project.title)}">`:projectArt(project.imageType)}</div><div class="dialog-inner"><div class="dialog-eyebrow mono"><span>${escape(project.label)}</span><span class="placeholder-chip">${escape(project.status)}</span></div><h2 id="dialog-title">${escape(project.title)}</h2><p>${escape(project.description)}</p><div class="dialog-meta"><div><span>MY ROLE</span><strong>${escape(project.role)}</strong></div><div><span>WHEN</span><strong>${escape(project.year)}</strong></div>${project.tools?.length?`<div><span>TOOLS</span><strong>${escape(project.tools.join(' · '))}</strong></div>`:''}</div><div class="dialog-story"><h3>The question</h3><p>${escape(project.story.question)}</p><h3>The making</h3><p>${escape(project.story.process)}</p><h3>What came out of it</h3><p>${escape(project.story.result)}</p></div>${links.map(([label,url])=>`<a class="text-link" href="${escape(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join(' ')}</div>`);
    });
    grid.append(card);
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {const selected=item===button;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));});
    let count=0; grid.querySelectorAll('.project-card').forEach(card => {card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden)count++;});
    $('#filter-status').textContent=`Showing ${count} ${count===1?'project':'projects'}.`;
  }));
  const everythingCount = $('[data-filter="all"] span');
  everythingCount.textContent = String(content.projects.length).padStart(2,'0');

  const experiences = $('#experience-list');
  content.experiences.forEach((item,index) => {
    const details = document.createElement('details');details.className='experience-item';
    details.innerHTML=`<summary class="experience-summary"><span class="experience-number">${String(index+1).padStart(2,'0')}</span><div><div class="experience-kind">${escape(item.kind)}${item.placeholder?'<span>TO ADD</span>':''}</div><h3>${escape(item.title)}</h3><div class="experience-meta">${escape(item.organization)} · ${escape(item.dates)}</div></div><span class="experience-plus" aria-hidden="true">+</span></summary><div class="experience-description"><p>${escape(item.description)}</p></div>`;
    experiences.append(details);
  });
  const photos = $('#photo-grid');
  content.photos.forEach((photo,index) => {
    const button=document.createElement('button');button.type='button';button.className='photo-item';button.setAttribute('aria-label',`View ${photo.title}${photo.placeholder?' photo placeholder':''}`);
    const image=safeUrl(photo.imageSrc);const artwork=image?`<img src="${escape(image)}" alt="${escape(photo.alt||photo.title)}" loading="lazy">`:photoArt(photo.variant);
    button.innerHTML=`<div class="photo-surface">${artwork}${!image?'<span class="photo-placeholder-tag mono">YOUR PHOTO GOES HERE</span>':''}</div><div class="photo-caption"><span>${escape(photo.title)}</span><span>${String(index+1).padStart(2,'0')} / ${photo.placeholder?'TO ADD':'JOURNAL'}</span></div>`;
    button.addEventListener('click',()=>openDialog(`<div class="photo-dialog-art">${image?`<img src="${escape(image)}" alt="${escape(photo.alt||photo.title)}">`:photoArt(photo.variant)}</div><div class="dialog-inner"><div class="dialog-eyebrow mono">${photo.placeholder?'A PLACE FOR YOUR PHOTOGRAPH':'THROUGH MY LENS'}</div><h2 id="dialog-title">${escape(photo.title)}</h2><p>${escape(photo.caption)}</p></div>`));
    photos.append(button);
  });
  if(content.profile.name) {
    $('#hero-name-text').textContent=content.profile.name;
    $('#copyright-name').textContent=content.profile.name.toUpperCase();
    $('.brand-name').textContent=content.profile.name.toLowerCase();
    $('.brand').setAttribute('aria-label', `${content.profile.name}, back to top`);
    document.title=`${content.profile.name} — Curiosity in motion`;
  }
  if(content.profile.intro) $('#profile-intro').textContent=content.profile.intro;
  if(safeUrl(content.profile.portraitSrc)) $('.portrait-placeholder').innerHTML=`<img class="personal-portrait" src="${escape(safeUrl(content.profile.portraitSrc))}" alt="${escape(content.profile.portraitAlt||content.profile.name)}">`;
  const contact=$('#contact-links');
  if(content.profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.profile.email)) {
    contact.innerHTML=`<a class="contact-link" href="mailto:${escape(encodeURIComponent(content.profile.email))}"><span>${escape(content.profile.email)}</span><span aria-hidden="true">↗</span></a>`;
  } else contact.innerHTML='<div class="contact-link unavailable"><span>Email to be added</span><span class="mono">COMING SOON</span></div>';
  if(safeUrl(content.profile.cvUrl)) contact.insertAdjacentHTML('beforeend',`<a class="contact-link" href="${escape(safeUrl(content.profile.cvUrl))}" target="_blank" rel="noopener noreferrer"><span>View my CV</span><span aria-hidden="true">↗</span></a>`);
  else contact.insertAdjacentHTML('beforeend','<button class="contact-link unavailable" id="cv-placeholder"><span>A home for my CV</span><span aria-hidden="true">↗</span></button>');
  $('#cv-placeholder')?.addEventListener('click',()=>openDialog('<div class="dialog-inner simple-dialog"><div class="dialog-eyebrow mono">A PLACE FOR THE ESSENTIALS</div><h2 id="dialog-title">My CV, coming soon.</h2><p>A downloadable CV will appear here once it is ready. For now, this space is reserved for it.</p></div>'));
  if(safeUrl(content.profile.githubUrl))contact.insertAdjacentHTML('beforeend',`<a class="contact-link" href="${escape(safeUrl(content.profile.githubUrl))}" target="_blank" rel="noopener noreferrer"><span>Find me on GitHub</span><span aria-hidden="true">↗</span></a>`);

  const menu=$('.menu-toggle'),mobile=$('#mobile-nav');
  function setMenu(open){menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobile.hidden=!open;}
  menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobile.hidden){setMenu(false);menu.focus();}});
  window.matchMedia('(min-width:641px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});
  let scrollQueued=false;
  const progress=$('.scroll-progress');
  function updateProgress(){const distance=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${distance>0?scrollY/distance*100:0}%`;scrollQueued=false;}
  window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});
  window.addEventListener('resize',updateProgress);updateProgress();
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('.desktop-nav a').forEach(a=>{if(a.getAttribute('href')===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-15% 0px -50% 0px'});document.querySelectorAll('section[id]').forEach(s=>observer.observe(s));}
  window.mountMechanism?.($('#mechanism-canvas'));
})();
