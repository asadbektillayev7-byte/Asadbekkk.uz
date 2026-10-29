/* Two adjacent landing screens, with no document scrolling. */
(() => {
  'use strict';

  const body = document.body;
  const track = document.getElementById('landing-track');
  if (!body?.classList.contains('page-home') || !track) return;

  const panels = [document.getElementById('home'), document.getElementById('little-about')];
  if (panels.some(panel => !panel)) return;
  const live = document.getElementById('landing-live');
  const controls = Array.from(document.querySelectorAll('[data-landing-go]'));
  const pageControls = controls.filter(control => control.hasAttribute('data-landing-page'));
  const interactive = 'a,button,input,textarea,select,summary,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="slider"],[role="tab"]';
  let current = 0;
  let gesture = null;

  function hashIndex() {
    return location.hash.toLowerCase() === '#little-about' ? 1 : 0;
  }

  function finishIntro() {
    if (body.classList.contains('is-opening')) document.getElementById('intro-control')?.click();
  }

  function focusPanel(index) {
    const heading = panels[index].querySelector('h1,h2');
    if (!heading) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function showScreen(index, { focus = false, announce = true, updateUrl = true } = {}) {
    const next = Math.max(0, Math.min(panels.length - 1, Number(index) || 0));
    const changed = next !== current;
    if (next !== 0) finishIntro();
    current = next;
    body.dataset.landingSlide = String(current);
    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === current;
      panel.inert = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    pageControls.forEach(control => {
      control.setAttribute('aria-pressed', String(Number(control.dataset.landingGo) === current));
    });
    if (updateUrl) {
      const hash = current === 1 ? '#little-about' : '';
      if (location.hash !== hash) {
        try { history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`); }
        catch { /* Screen navigation still works without access to browser history. */ }
      }
    }
    if (focus && changed) focusPanel(current);
    if (live && announce && changed) {
      live.textContent = `${current === 0 ? 'Portfolio' : 'Little about me'}. Page ${current + 1} of ${panels.length}.`;
    }
    if (changed) document.dispatchEvent(new CustomEvent('landingchange', { detail: { index: current } }));
  }

  controls.forEach(control => {
    control.addEventListener('click', event => {
      event.preventDefault();
      showScreen(control.dataset.landingGo, { focus: !control.hasAttribute('data-landing-page') });
    });
  });

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (body.classList.contains('nav-open') || body.classList.contains('dialog-open') || document.querySelector('dialog[open]')) return;
    if (event.target instanceof Element && event.target.closest(interactive)) return;
    const next = current + (event.key === 'ArrowRight' ? 1 : -1);
    if (next < 0 || next >= panels.length) return;
    event.preventDefault();
    showScreen(next, { focus: true });
  });

  track.addEventListener('pointerdown', event => {
    if (event.isPrimary === false || event.button !== 0 || body.classList.contains('nav-open')) return;
    if (event.target instanceof Element && event.target.closest(interactive)) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  }, { passive: true });

  window.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const x = Math.abs(event.clientX - gesture.x);
    const y = Math.abs(event.clientY - gesture.y);
    if (!gesture.horizontal && y > 18 && y > x) { gesture = null; return; }
    if (x > 12 && x > y * 1.3) {
      gesture.horizontal = true;
      if (!track.hasPointerCapture(event.pointerId)) {
        try { track.setPointerCapture(event.pointerId); } catch { /* A pointer can end between events. */ }
      }
    }
    if (gesture.horizontal && event.cancelable) event.preventDefault();
  }, { passive: false });

  function finishGesture(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const swipe = gesture;
    gesture = null;
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointerup') return;
    const x = event.clientX - swipe.x;
    const y = event.clientY - swipe.y;
    if (Math.abs(x) < 50 || Math.abs(x) <= Math.abs(y) * 1.3) return;
    showScreen(current + (x < 0 ? 1 : -1), { focus: false });
  }
  window.addEventListener('pointerup', finishGesture, { passive: true });
  window.addEventListener('pointercancel', finishGesture, { passive: true });
  window.addEventListener('hashchange', () => showScreen(hashIndex(), { updateUrl: false, focus: true }));
  window.addEventListener('pageshow', () => showScreen(hashIndex(), { updateUrl: false, announce: false }));
  window.addEventListener('blur', () => { gesture = null; });

  showScreen(hashIndex(), { updateUrl: false, announce: false });
})();
