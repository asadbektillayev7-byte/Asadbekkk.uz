/* Navigation, project shelves, and personal-content dialogs. */
(() => {
  'use strict';

  function initSite() {
    const body = document.body;
    if (!body || body.dataset.personalSiteReady === 'true') return;
    body.dataset.personalSiteReady = 'true';

    const mobile = window.matchMedia('(max-width: 767px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('main-nav');
    const sectionLinks = Array.from(document.querySelectorAll('[data-section-link]'));
    const homeLink = header && header.querySelector('.brand[href="#home"]');
    const dialogs = Array.from(document.querySelectorAll('dialog'));
    const dialogOpeners = new WeakMap();
    let scrollFrame = 0;
    let revealObserver = null;

    function closeNav(returnFocus = false) {
      const wasOpen = body.classList.contains('nav-open');
      body.classList.remove('nav-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      if (wasOpen && returnFocus && navToggle) navToggle.focus({ preventScroll: true });
    }

    function syncDialogLock() {
      body.classList.toggle('dialog-open', dialogs.some(dialog => dialog.open));
    }

    function fillProject(id) {
      const content = window.PERSONAL_CONTENT;
      const projects = content && content.projects;
      const project = Array.isArray(projects) ? projects.find(item => item.id === id) : null;
      if (!project) return false;
      const fields = {
        'project-dialog-title': project.title,
        'project-dialog-kind': project.kind,
        'project-dialog-summary': project.summary
      };
      Object.entries(fields).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);
        if (element) element.textContent = value || '';
      });
      const prompts = document.getElementById('project-dialog-prompts');
      if (prompts) {
        prompts.replaceChildren();
        (Array.isArray(project.prompts) ? project.prompts : []).forEach(prompt => {
          const item = document.createElement('li');
          item.textContent = prompt;
          prompts.appendChild(item);
        });
      }
      return true;
    }

    const readingStates = {
      current: {
        title: 'Currently reading',
        copy: 'No current title has been added yet. A book, its author, and a few thoughts will go here.'
      },
      finished: {
        title: 'Finished reading',
        copy: 'No finished titles have been added yet. This shelf is ready for books I have read and the ideas I took from them.'
      },
      next: {
        title: 'Up next',
        copy: 'The next-read list is empty for now. Books I want to pick up and the reasons they caught my attention will go here.'
      }
    };

    function fillReading(status) {
      const state = readingStates[status];
      if (!state) return false;
      const title = document.getElementById('reading-dialog-title');
      const copy = document.getElementById('reading-dialog-copy');
      if (title) title.textContent = state.title;
      if (copy) copy.textContent = state.copy;
      return true;
    }

    function openDialog(dialog, opener) {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      closeNav();
      dialogs.forEach(other => {
        if (other !== dialog && other.open) other.close();
      });
      dialogOpeners.set(dialog, opener);
      if (!dialog.open) dialog.showModal();
      syncDialogLock();
    }

    document.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const printButton = target.closest('[data-print-resume]');
      if (printButton) {
        event.preventDefault();
        body.classList.add('printing-resume');
        try {
          window.print();
        } catch (error) {
          body.classList.remove('printing-resume');
        }
        return;
      }

      const trigger = target.closest('[data-open-dialog]');
      if (trigger) {
        const dialog = document.getElementById(trigger.dataset.openDialog);
        if (dialog && dialog.tagName === 'DIALOG') {
          event.preventDefault();
          if (trigger.dataset.project && !fillProject(trigger.dataset.project)) return;
          if (trigger.dataset.readingStatus && !fillReading(trigger.dataset.readingStatus)) return;
          openDialog(dialog, trigger);
        }
        return;
      }

      const closeButton = target.closest('[data-close-dialog]');
      if (closeButton) {
        const dialog = closeButton.closest('dialog');
        if (dialog && dialog.open) dialog.close();
        return;
      }

      if (body.classList.contains('nav-open') && nav && navToggle &&
          !nav.contains(target) && !navToggle.contains(target)) closeNav();
    });

    dialogs.forEach(dialog => {
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) dialog.close();
      });
      dialog.addEventListener('close', () => {
        syncDialogLock();
        const opener = dialogOpeners.get(dialog);
        if (!dialogs.some(other => other.open) && opener && opener.isConnected) {
          opener.focus({ preventScroll: true });
        }
      });
    });

    window.addEventListener('afterprint', () => body.classList.remove('printing-resume'));

    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        if (!mobile.matches) return;
        const open = body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(open));
      });
      nav.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('a')) closeNav();
      });
      mobile.addEventListener('change', () => closeNav());
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && body.classList.contains('nav-open')) closeNav(true);
      });
    }

    const filters = Array.from(document.querySelectorAll('[data-project-filter]'));
    const cards = Array.from(document.querySelectorAll('.project-card[data-category]'));
    const filterStatus = document.getElementById('filter-status');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.projectFilter;
        let visibleCount = 0;
        cards.forEach(card => {
          const visible = category === 'all' || card.dataset.category === category;
          card.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        filters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
        if (filterStatus) {
          const categoryName = category === 'all' ? '' : `${filter.textContent.trim().toLowerCase()} `;
          filterStatus.textContent = `${visibleCount} ${categoryName}project ${visibleCount === 1 ? 'slot' : 'slots'} shown.`;
        }
        scheduleScrollSync();
      });
    });

    const sections = sectionLinks.map(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    }).filter((section, index, all) => section && all.indexOf(section) === index);

    function setActiveSection(id) {
      sectionLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      if (homeLink) {
        if (id === 'home') homeLink.setAttribute('aria-current', 'location');
        else homeLink.removeAttribute('aria-current');
      }
    }

    sectionLinks.forEach(link => link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) setActiveSection(href.slice(1));
    }));
    if (homeLink) homeLink.addEventListener('click', () => {
      closeNav();
      setActiveSection('home');
    });

    function syncScrollState() {
      scrollFrame = 0;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 35);
      const line = Math.max(110, window.innerHeight * .30);
      let currentId = 'home';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) currentId = section.id;
      }
      if (sections.length && window.scrollY > 0 &&
          window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        currentId = sections[sections.length - 1].id;
      }
      setActiveSection(currentId);
    }

    function scheduleScrollSync() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncScrollState);
    }

    window.addEventListener('scroll', scheduleScrollSync, { passive: true });
    window.addEventListener('resize', () => {
      if (!mobile.matches) closeNav();
      scheduleScrollSync();
    }, { passive: true });
    window.addEventListener('pageshow', () => {
      closeNav();
      syncDialogLock();
      scheduleScrollSync();
    });
    syncScrollState();

    const reveals = Array.from(document.querySelectorAll('.reveal'));
    function showAllSections() {
      reveals.forEach(element => element.classList.add('is-visible'));
      if (revealObserver) revealObserver.disconnect();
      body.classList.remove('has-observer');
    }

    if ('IntersectionObserver' in window && !reducedMotion.matches) {
      body.classList.add('has-observer');
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .06, rootMargin: '0px 0px -20px 0px' });
      reveals.forEach(element => revealObserver.observe(element));
    } else {
      showAllSections();
    }
    reducedMotion.addEventListener('change', event => {
      if (event.matches) showAllSections();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite, { once: true });
  } else {
    initSite();
  }
})();
