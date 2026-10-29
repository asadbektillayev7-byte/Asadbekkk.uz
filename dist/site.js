/* Shared page navigation, project filters, and accessible dialogs. */
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
    const resumeLinks = Array.from(document.querySelectorAll('[data-resume-link]'));
    const dialogOpeners = new WeakMap();
    let noticeTimer = 0;
    let noticeFrame = 0;
    let scrollFrame = 0;
    let revealObserver = null;

    function closeNav(returnFocus = false) {
      const wasOpen = body.classList.contains('nav-open');
      body.classList.remove('nav-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      if (wasOpen && returnFocus && navToggle) navToggle.focus({ preventScroll: true });
    }

    function announce(message) {
      const notice = document.getElementById('site-notice');
      if (!notice) return;
      window.clearTimeout(noticeTimer);
      window.cancelAnimationFrame(noticeFrame);
      notice.textContent = '';
      notice.classList.add('is-visible');
      noticeFrame = window.requestAnimationFrame(() => {
        notice.textContent = message;
        noticeTimer = window.setTimeout(() => notice.classList.remove('is-visible'), 4200);
      });
    }

    const configuredPdf = window.SITE_CONTENT && window.SITE_CONTENT.resumePdf;
    const resumePdf = typeof configuredPdf === 'string' ? configuredPdf.trim() : '';
    resumeLinks.forEach(link => {
      if (resumePdf) {
        link.setAttribute('href', resumePdf);
        link.removeAttribute('aria-disabled');
        link.removeAttribute('role');
        link.removeAttribute('tabindex');
        link.removeAttribute('title');
      } else {
        link.removeAttribute('href');
        link.setAttribute('role', 'link');
        link.setAttribute('tabindex', '0');
        link.setAttribute('aria-disabled', 'true');
        link.addEventListener('click', event => {
          event.preventDefault();
          closeNav();
          announce('Resume PDF coming soon.');
        });
        link.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          closeNav();
          announce('Resume PDF coming soon.');
        });
      }
    });

    const page = body.dataset.page || 'home';
    document.querySelectorAll('[data-page-link]').forEach(link => {
      const destination = link.dataset.page || link.dataset.pageLink;
      if (destination === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const homeLink = header && header.querySelector('.brand');
    if (homeLink) {
      if (page === 'home') homeLink.setAttribute('aria-current', 'page');
      else homeLink.removeAttribute('aria-current');
    }

    function getDialogs() {
      return Array.from(document.querySelectorAll('dialog'));
    }

    function syncDialogLock() {
      body.classList.toggle('dialog-open', getDialogs().some(dialog => dialog.open));
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

    function openDialog(dialog, opener) {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      closeNav();
      getDialogs().forEach(other => {
        if (other !== dialog && other.open) other.close();
      });
      if (opener) dialogOpeners.set(dialog, opener);
      if (!dialog.open) dialog.showModal();
      syncDialogLock();
    }

    document.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest('[data-open-dialog]');
      if (trigger) {
        const dialog = document.getElementById(trigger.dataset.openDialog);
        if (dialog && dialog.tagName === 'DIALOG') {
          event.preventDefault();
          if (trigger.dataset.project && !fillProject(trigger.dataset.project)) return;
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

    getDialogs().forEach(dialog => {
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
        if (!getDialogs().some(other => other.open) && opener && opener.isConnected) {
          opener.focus({ preventScroll: true });
        }
      });
      if ('MutationObserver' in window) {
        new MutationObserver(syncDialogLock).observe(dialog, {
          attributes: true, attributeFilter: ['open']
        });
      }
    });

    if (navToggle && nav) {
      navToggle.setAttribute('aria-expanded', 'false');
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
      });
    });

    function syncScrollState() {
      scrollFrame = 0;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 35);
    }

    function scheduleScrollSync() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncScrollState);
    }

    window.addEventListener('scroll', scheduleScrollSync, { passive: true });
    window.addEventListener('resize', () => {
      closeNav();
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
