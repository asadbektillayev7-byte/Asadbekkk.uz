/* Personal-site navigation and editable-content dialogs. */
(() => {
  'use strict';

  function initPersonalSite() {
    if (document.body.dataset.personalSiteReady === 'true') return;
    document.body.dataset.personalSiteReady = 'true';

    const body = document.body;
    const mobile = window.matchMedia('(max-width: 760px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('main-nav');
    const header = document.querySelector('.site-header');
    const sectionLinks = Array.from(document.querySelectorAll('[data-section-link]'));
    const dialogs = Array.from(document.querySelectorAll('dialog'));
    const dialogOpeners = new WeakMap();
    let revealObserver = null;

    function closeNav() {
      body.classList.remove('nav-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }

    function syncDialogLock() {
      body.classList.toggle('dialog-open', dialogs.some(dialog => dialog.open));
    }

    function fillProject(id) {
      const projects = window.PERSONAL_CONTENT && window.PERSONAL_CONTENT.projects;
      const project = Array.isArray(projects) ? projects.find(item => item.id === id) : null;
      if (!project) return;
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
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest('[data-open-dialog]');
      if (trigger) {
        const dialog = document.getElementById(trigger.dataset.openDialog);
        if (dialog instanceof HTMLDialogElement) {
          event.preventDefault();
          if (trigger.dataset.project) fillProject(trigger.dataset.project);
          openDialog(dialog, trigger);
        }
        return;
      }
      const closeButton = event.target.closest('[data-close-dialog]');
      if (closeButton) {
        const dialog = closeButton.closest('dialog');
        if (dialog && dialog.open) dialog.close();
      }
      if (event.target.closest('[data-print-cv]')) {
        body.classList.add('printing-cv');
        window.print();
      }
    });

    dialogs.forEach(dialog => {
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const isOutside = event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (isOutside) dialog.close();
      });
      dialog.addEventListener('close', () => {
        syncDialogLock();
        const opener = dialogOpeners.get(dialog);
        if (!dialogs.some(other => other.open) && opener && opener.isConnected) {
          opener.focus({ preventScroll: true });
        }
      });
    });

    window.addEventListener('afterprint', () => body.classList.remove('printing-cv'));

    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        if (!mobile.matches) return;
        const isOpen = body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
      nav.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('a, button')) closeNav();
      });
      mobile.addEventListener('change', closeNav);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && body.classList.contains('nav-open')) {
          closeNav();
          navToggle.focus({ preventScroll: true });
        }
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
          const isVisible = category === 'all' || card.dataset.category === category;
          card.hidden = !isVisible;
          if (isVisible) visibleCount += 1;
        });
        filters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
        if (filterStatus) {
          const label = category === 'all' ? 'project' : filter.textContent.trim();
          filterStatus.textContent = `${visibleCount} ${label.toLowerCase()} ${visibleCount === 1 ? 'slot shown' : 'slots shown'}.`;
        }
        scheduleScrollSync();
      });
    });

    function setActiveSection(id) {
      sectionLinks.forEach(link => {
        const isCurrent = link.getAttribute('href') === `#${id}`;
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    const sections = sectionLinks.map(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    }).filter((section, index, all) => section && all.indexOf(section) === index);

    sectionLinks.forEach(link => link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) setActiveSection(href.slice(1));
    }));

    let scrollFrame = 0;
    function syncScrollState() {
      scrollFrame = 0;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 35);
      if (sections.length) {
        const line = window.innerHeight * .34;
        let current = sections[0];
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= line) current = section;
        }
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
          current = sections[sections.length - 1];
        }
        setActiveSection(current.id);
      }
    }

    function scheduleScrollSync() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncScrollState);
    }

    // A frame-limited scroll check also covers very tall or filtered sections,
    // whose observer ratios may never cross a useful threshold.
    window.addEventListener('scroll', scheduleScrollSync, { passive: true });
    window.addEventListener('resize', scheduleScrollSync, { passive: true });
    window.addEventListener('pageshow', scheduleScrollSync);
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
      }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
      reveals.forEach(element => revealObserver.observe(element));
    } else {
      showAllSections();
    }
    reducedMotion.addEventListener('change', event => {
      if (event.matches) showAllSections();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPersonalSite, { once: true });
  } else {
    initPersonalSite();
  }
})();
