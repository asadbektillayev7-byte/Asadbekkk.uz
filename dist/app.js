(() => {
  'use strict';
  const data = window.CV_CONTENT;
  if (!data) return;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = value => {
    if (!value || typeof value !== 'string') return '';
    try {
      const parsed = new URL(value, location.href);
      return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '';
    } catch { return ''; }
  };
  const numbered = i => String(i + 1).padStart(2, '0');
  const tagList = values => `<div class="tags">${(values || []).map(value => `<span class="tag">${esc(value)}</span>`).join('')}</div>`;
  const dialog = $('#detail-dialog');
  const nav = $('#navigation');
  const menu = $('.menu-toggle');
  let lastFocus;
  let previousOverflow = '';
  function closeMenu() {
    nav.classList.remove('menu-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  }
  function showDialog(title, body, badge = 'CONTENT TO ADD', type = '') {
    const activeElement = document.activeElement;
    const focusWasInMobileMenu = nav.classList.contains('menu-open') && activeElement?.closest('.nav-links');
    closeMenu();
    if (!dialog.open) {
      lastFocus = focusWasInMobileMenu ? menu : activeElement;
      previousOverflow = document.body.style.overflow;
    }
    dialog.classList.toggle('about-post', type === 'about');
    $('#dialog-content').innerHTML = `<p class="post-meta">${esc(badge)}</p><h2 id="dialog-title">${esc(title)}</h2>${body}`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    $('.dialog-close').focus({ preventScroll: true });
  }
  function placeholder(title, description) {
    showDialog(title, `<p>${esc(description || 'This space is reserved for my own content. The details will be added when they are ready.')}</p>`);
  }
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    dialog.classList.remove('about-post');
    lastFocus?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  function externalLinks(links) {
    const valid = (links || []).filter(link => url(link.url));
    return valid.length ? `<div class="post-links">${valid.map(link => `<a class="text-link" href="${esc(url(link.url))}" target="_blank" rel="noopener noreferrer">${esc(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : '';
  }
  function imageMarkup(item, className = '') {
    const src = url(item.imageSrc);
    return src ? `<img class="${className}" src="${esc(src)}" alt="${esc(item.imageAlt || item.title)}" loading="lazy">` : '';
  }
  const profile = data.profile;
  document.querySelectorAll('[data-profile-name]').forEach(el => el.textContent = profile.name);
  const heroTitle = profile.heroTitle || profile.name + '.';
  $('#hero-name').innerHTML = esc(heroTitle.replace(/\.$/, '')) + (heroTitle.endsWith('.') ? '<span>.</span>' : '');
  $('#hero-line').textContent = profile.heroLine || 'Mechanical engineering. Software. A little of everything else.';
  document.title = `${profile.name} — Engineering & Everything Else`;
  const about = data.aboutPost || { title: 'About me', lead: profile.intro, paragraphs: [] };
  function openAbout() {
    const portrait = url(about.portraitSrc || profile.portraitSrc);
    const image = portrait ? `<img class="post-portrait" src="${esc(portrait)}" alt="${esc(about.portraitAlt || profile.portraitAlt || 'Portrait')}" loading="lazy">` : `<div class="post-photo-placeholder"><span aria-hidden="true">a.</span><p>A personal photograph to come.</p></div>`;
    const introVideo = url(profile.introVideoUrl);
    showDialog(about.title || 'About me', `<p class="post-lead">${esc(about.lead || profile.intro)}</p>${image}${(about.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('')}<div class="post-section"><h3>Still adding to the story.</h3><p>My background, the moments that shaped me, and what I hope to explore next will live here.</p></div>${introVideo ? `<a class="text-link" href="${esc(introVideo)}" target="_blank" rel="noopener noreferrer">Watch my introduction ↗</a>` : ''}`, about.eyebrow || 'A LITTLE MORE PERSONAL', 'about');
  }
  document.querySelectorAll('[data-about-open]').forEach(button => {
    if (!button.classList.contains('hero-about-hint')) button.setAttribute('aria-label', `${profile.name} — read About me`);
    button.addEventListener('click', openAbout);
  });
  function projectVisual(project, i) {
    const image = imageMarkup(project, 'project-image');
    const graphic = i === 0
      ? '<span class="visual-graphic mechanism-graphic" aria-hidden="true"><span class="orbital-ring ring-one"></span><span class="orbital-ring ring-two"></span><span class="orbital-ring ring-three"></span><span class="measure-line"></span><span class="mechanism-core">↗</span></span>'
      : i === 1
        ? '<span class="visual-graphic code-graphic" aria-hidden="true"><span class="code-comment">// a place for an idea</span><span class="code-main">think<span> → </span>build</span><span class="code-comment">details coming soon_</span></span>'
        : '<span class="visual-graphic systems-graphic" aria-hidden="true"><span class="system-circle"></span><span class="system-circle"></span><span class="system-symbol">×</span></span>';
    return `<span class="project-visual project-visual--${['mechanical', 'software', 'systems'][i % 3]}${image ? ' has-project-image' : ''}">${image || graphic}<span class="visual-index">PROJECT / ${numbered(i)}</span><span class="visual-caption">${image ? esc(project.category) : ['Design / Model / Test', 'Logic / Code / Iterate', 'Mechanics / Code / Connection'][i % 3]}</span>${image ? '' : '<span class="project-sample">Concept visual · project to add</span>'}</span>`;
  }
  $('#projects-grid').innerHTML = data.projects.map((project, i) => `<button class="project-card ${i === 0 ? 'project-featured' : 'project-secondary'}" data-project="${i}" aria-haspopup="dialog">${projectVisual(project, i)}<span class="project-body"><span class="project-meta"><span class="project-category">${esc(project.category)}</span><span class="project-status">${esc(project.status)}</span></span><span class="project-title" role="heading" aria-level="3">${esc(project.title)}</span><span class="project-description">${esc(project.description)}</span><span class="project-open">Open project <span aria-hidden="true">↗</span></span></span></button>`).join('');
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
    const project = data.projects[Number(button.dataset.project)];
    showDialog(project.title, `${imageMarkup(project, 'post-project-image')}<p class="post-lead">${esc(project.description)}</p><div class="dialog-meta"><div><strong>My role</strong><span>${esc(project.role)}</span></div><div><strong>Status</strong><span>${esc(project.status)}</span></div></div><div class="post-section"><h3>The problem</h3><p>${esc(project.problem || 'The project question, who it is for, and the constraints will go here.')}</p></div><div class="post-section"><h3>What I did</h3><p>${esc(project.process)}</p></div><div class="post-section"><h3>What happened</h3><p>${esc(project.result)}</p></div>${externalLinks(project.links)}`, project.category);
  }));
  $('#experience-list').innerHTML = data.experiences.map((item, i) => `<article class="timeline-entry"><div class="timeline-date"><span>${esc(item.dates)}</span><small>${numbered(i)}</small></div><div class="timeline-content"><span class="entry-type">${esc(item.type)}</span><h3>${esc(item.title)}</h3><p class="entry-organization">${esc(item.organization)}</p><ul>${(item.bullets || []).map(bullet => `<li>${esc(bullet)}</li>`).join('')}</ul></div></article>`).join('');
  $('#education-list').innerHTML = data.education.map(item => `<article class="education-entry"><p class="entry-date">${esc(item.dates)}</p><h4>${esc(item.title)}</h4><p>${esc(item.organization)}</p><p class="education-description">${esc(item.description)}</p></article>`).join('');
  $('#skills-list').innerHTML = `<h4 class="toolkit-heading">My toolkit</h4>${data.skillGroups.map(group => `<div class="skill-group"><h5>${esc(group.title)}</h5>${tagList(group.items)}</div>`).join('')}`;
  $('#languages-list').innerHTML = `<h4 class="toolkit-heading">Languages</h4>${data.languages.map(item => `<div class="language-row"><span>${esc(item.name)}</span><span>${esc(item.level)}</span></div>`).join('')}`;
  $('#community-grid').innerHTML = data.communities.map((item, i) => `<article class="community-card"><div class="community-image ${url(item.imageSrc) ? '' : 'sample-image sample-community-' + i}">${imageMarkup(item)}${url(item.imageSrc) ? '' : '<span class="sample-label">Sample image / Your photo here</span>'}</div><div class="community-body"><p class="entry-date">${esc(item.date)}</p><h4>${esc(item.title)}</h4><p class="community-role">${esc(item.role)}</p><p>${esc(item.description)}</p>${(item.links || []).some(link => url(link.url)) ? externalLinks(item.links) : `<button class="text-link" data-community="${i}">Read more <span aria-hidden="true">↗</span></button>`}</div></article>`).join('');
  document.querySelectorAll('[data-community]').forEach(button => button.addEventListener('click', () => {
    const item = data.communities[Number(button.dataset.community)];
    showDialog(item.title, `${imageMarkup(item)}<p class="post-lead">${esc(item.description)}</p><div class="dialog-meta"><div><strong>My role</strong><span>${esc(item.role)}</span></div><div><strong>When</strong><span>${esc(item.date)}</span></div></div>${externalLinks(item.links)}`, 'COMMUNITY');
  }));
  $('#achievements-list').innerHTML = data.achievements.map((item, i) => `<article class="recognition-item"><span class="recognition-number">${numbered(i)}</span><div><h4>${esc(item.title)}</h4><p>${esc(item.organization)}</p></div><button class="recognition-open" data-achievement="${i}" aria-label="Read about ${esc(item.title)}">Details <span aria-hidden="true">↗</span></button></article>`).join('');
  document.querySelectorAll('[data-achievement]').forEach(button => button.addEventListener('click', () => {
    const item = data.achievements[Number(button.dataset.achievement)];
    showDialog(item.title, `${imageMarkup(item)}<p class="post-lead">${esc(item.description)}</p><p>${esc(item.organization)} · ${esc(item.date)}</p>${externalLinks(item.links)}`, 'MILESTONE TO ADD');
  }));
  const photographs = data.photography || [];
  $('#photo-gallery').innerHTML = photographs.map((item, i) => `<figure class="photo-tile${i === 0 ? ' photo-featured' : ''}"><button class="photo-open" data-photo="${i}" aria-label="Open ${esc(item.title)}" aria-haspopup="dialog"><span class="gallery-image${url(item.imageSrc) ? '' : ' sample-image sample-gallery-' + i}">${imageMarkup(item)}${url(item.imageSrc) ? '' : '<span class="gallery-placeholder">Sample image / Your photograph here</span>'}<span class="photo-view" aria-hidden="true">↗</span></span></button><figcaption><span class="photo-number">${numbered(i)} /</span><div><h3>${esc(item.title)}</h3><p>${esc(item.caption)}</p></div></figcaption></figure>`).join('');
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    const item = photographs[Number(button.dataset.photo)];
    showDialog(item.title, `${url(item.imageSrc) ? imageMarkup(item, 'post-photograph') : '<div class="post-image-placeholder"><p>Your photograph will appear here.</p></div>'}<p class="post-lead">${esc(item.caption)}</p>`, url(item.imageSrc) ? 'THROUGH MY LENS' : 'PHOTOGRAPH TO ADD');
  }));
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email || '');
  const phone = String(profile.phone || '').replace(/[^\d+]/g, '');
  const contacts = [
    ['Email', emailValid ? profile.email : 'Email to be added', emailValid ? 'mailto:' + encodeURIComponent(profile.email) : ''],
    ['Phone', phone || 'Number to be added', phone ? 'tel:' + phone : ''],
    ['Based in', profile.location || 'Location to be added', '']
  ];
  $('#contact-methods').innerHTML = contacts.map(([label, value, href]) => `<div class="contact-row"><span class="contact-label">${label}</span>${href ? `<a href="${esc(href)}">${esc(value)} <span aria-hidden="true">↗</span></a>` : `<span class="contact-value">${esc(value)}</span>`}</div>`).join('');
  const socials = [['GitHub', 'githubUrl'], ['LinkedIn', 'linkedinUrl'], ['Instagram', 'instagramUrl'], ['Telegram', 'telegramUrl']];
  $('#social-links').innerHTML = socials.map(([label, key]) => url(profile[key]) ? `<a href="${esc(url(profile[key]))}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>` : `<button data-social="${label}">${label} <span aria-hidden="true">↗</span></button>`).join('');
  document.querySelectorAll('[data-social]').forEach(button => button.addEventListener('click', () => placeholder(button.dataset.social, 'My profile link will be added here.')));
  document.querySelectorAll('[data-cv-open]').forEach(button => button.addEventListener('click', () => {
    if (url(profile.cvUrl)) { closeMenu(); window.open(url(profile.cvUrl), '_blank', 'noopener,noreferrer'); }
    else placeholder('My CV', 'A downloadable CV will be available here once it is ready.');
  }));
  if (url(profile.portraitSrc)) {
    $('.hero-portrait').innerHTML = `<img src="${esc(url(profile.portraitSrc))}" alt="${esc(profile.portraitAlt || 'Portrait of ' + profile.name)}"><div class="portrait-caption"><span>${esc(profile.name)}</span></div>`;
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('menu-open') && !dialog.open) {
      closeMenu(); menu.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 768px)');
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
  let scrollQueued = false;
  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 32); scrollQueued = false; }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNav); } }, { passive: true });
  updateNav();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-links a').forEach(link => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
