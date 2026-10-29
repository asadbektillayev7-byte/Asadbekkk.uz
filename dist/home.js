(() => {
  'use strict';
  const panel = document.getElementById('photo-panel');
  const portraits = document.getElementById('portraits-control');
  const dialogs = [...document.querySelectorAll('dialog')];
  const openers = new WeakMap();
  function closePanel() { panel.hidden = true; portraits.setAttribute('aria-expanded', 'false'); }
  portraits.addEventListener('click', () => {
    if (document.body.classList.contains('is-opening')) document.getElementById('intro-control').click();
    panel.hidden = !panel.hidden;
    portraits.setAttribute('aria-expanded', String(!panel.hidden));
  });
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const opener = event.target.closest('[data-open-dialog]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.openDialog);
      if (dialog instanceof HTMLDialogElement) {
        closePanel(); openers.set(dialog, opener); dialog.showModal();
      }
    }
    const closer = event.target.closest('[data-close-dialog]');
    if (closer) closer.closest('dialog')?.close();
    if (!panel.contains(event.target) && !portraits.contains(event.target)) closePanel();
  });
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r=dialog.getBoundingClientRect();
      if (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => openers.get(dialog)?.focus({preventScroll:true}));
  });
  document.addEventListener('keydown', event => {
    if (event.key==='Escape'&&!panel.hidden) {closePanel();portraits.focus();}
  });
})();
