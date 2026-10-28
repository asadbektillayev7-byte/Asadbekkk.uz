(() => {
  'use strict';
  const data = window.HOME_CONTENT;
  if (!data?.photos?.length) return;
  const body = document.body;
  const stage = document.querySelector('#title-stage');
  const nameWord = document.querySelector('#name-word');
  const portfolioWord = document.querySelector('#portfolio-word');
  const introControl = document.querySelector('#intro-control');
  const mark = document.querySelector('.opening-mark');
  const canvas = document.querySelector('#portrait-canvas');
  const fallback = document.querySelector('#portrait-fallback');
  const thumbnails = document.querySelector('#photo-thumbnails');
  const footer = document.querySelector('.home-footer');
  const status = document.querySelector('#photo-status');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const clamp = value => Math.min(1, Math.max(0, value));
  let currentPhoto = Math.max(0, Math.min(data.photos.length - 1, data.initialPhoto || 0));
  let scene = null;
  let sceneReady = Promise.resolve(false);
  let openingFrame = null;
  let openingStarted = 0;
  let openingFinished = false;
  let animations = [];
  let photoRequest = 0;
  let resizeFrame = null;
  function setSceneFallback(active) {
    body.classList.toggle('scene-fallback', active);
    canvas.setAttribute('aria-hidden', String(active));
    fallback.setAttribute('aria-hidden', String(!active));
  }
  function letters(element, text) {
    element.innerHTML = Array.from(text).map(char => `<span class="letter" data-letter="${esc(char)}" aria-hidden="true">${esc(char)}</span>`).join('');
    return Array.from(element.children);
  }
  const nameLetters = letters(nameWord, data.introName || data.name.toUpperCase());
  const portfolioLetters = letters(portfolioWord, data.title || 'PORTFOLIO');
  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, { fill: 'forwards', ...options });
    animations.push(animation);
    return animation;
  }
  function cancelOpeningAnimations() {
    if (openingFrame !== null) cancelAnimationFrame(openingFrame);
    openingFrame = null;
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function finalTop() { return window.matchMedia('(max-width: 900px), (max-height: 650px)').matches ? '67%' : '72%'; }
  function finishOpening() {
    cancelOpeningAnimations();
    openingFinished = true;
    footer.inert = false;
    body.classList.remove('is-loading', 'is-opening');
    body.classList.add('is-revealing', 'is-ready');
    nameWord.style.display = 'none';
    portfolioWord.style.opacity = '1';
    portfolioLetters.forEach(letter => { letter.style.opacity = '1'; letter.style.transform = 'none'; });
    stage.style.top = finalTop();
    mark.style.opacity = '0';
    scene?.setProgress(1);
    introControl.innerHTML = motionPreference.matches ? 'Motion reduced' : 'Replay intro <span aria-hidden="true">↻</span>';
    introControl.disabled = motionPreference.matches;
  }
  function startOpening() {
    if (motionPreference.matches) { finishOpening(); return; }
    cancelOpeningAnimations();
    openingFinished = false;
    footer.inert = true;
    body.classList.remove('is-loading', 'is-revealing', 'is-ready');
    body.classList.add('is-opening');
    nameWord.style.display = 'flex';
    portfolioWord.style.opacity = '1';
    stage.style.top = '50%';
    mark.style.opacity = '0';
    scene?.setProgress(0);
    introControl.innerHTML = 'Skip intro <span aria-hidden="true">↗</span>';
    introControl.disabled = false;
    animate(mark, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.1)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .35 }, { opacity: 1, offset: .65 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.1)' }], { duration: 900, easing: 'ease-in-out' });
    nameLetters.forEach((letter, index) => {
      letter.style.opacity = '0';
      const sign = index % 2 ? -1 : 1;
      animate(letter, [
        { opacity: 0, transform: `translate3d(${sign * 110}px,${index % 3 ? -90 : 100}px,260px) rotateX(${sign * 110}deg) rotateY(${-sign * 120}deg) rotateZ(${sign * 15}deg)` },
        { opacity: 1, transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)' }
      ], { delay: 430 + index * 84, duration: 850, easing: 'cubic-bezier(.16,.8,.23,1)' });
      animate(letter, [{ opacity: 1, transform: 'rotateY(0) translateY(0)' }, { opacity: 0, transform: `rotateY(${sign * 90}deg) rotateX(35deg) translateY(-25px)` }], { delay: 1990 + index * 30, duration: 370, easing: 'cubic-bezier(.6,0,.9,.6)' });
    });
    portfolioLetters.forEach((letter, index) => {
      letter.style.opacity = '0';
      animate(letter, [
        { opacity: 0, transform: `translate3d(${index % 2 ? -28 : 28}px,60px,140px) rotateX(85deg) rotateY(${index % 2 ? -85 : 85}deg)` },
        { opacity: 1, transform: 'translate3d(0,0,0) rotateX(0) rotateY(0)' }
      ], { delay: 2260 + index * 55, duration: 650, easing: 'cubic-bezier(.16,.8,.23,1)' });
    });
    animate(stage, [{ top: '50%' }, { top: finalTop() }], { delay: 3270, duration: 1000, easing: 'cubic-bezier(.22,.65,.2,1)' });
    openingStarted = performance.now();
    function tick(now) {
      if (openingFinished) return;
      const elapsed = now - openingStarted;
      const progress = clamp((elapsed - 3480) / 2200);
      scene?.setProgress(progress);
      if (elapsed > 3570) { body.classList.add('is-revealing'); footer.inert = false; }
      if (elapsed >= 5900) { finishOpening(); return; }
      openingFrame = requestAnimationFrame(tick);
    }
    openingFrame = requestAnimationFrame(tick);
  }
  function updatePicker(index, announce = true) {
    const photo = data.photos[index];
    document.querySelectorAll('.photo-thumb').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    document.querySelector('#photo-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(data.photos.length).padStart(2, '0')}`;
    fallback.src = photo.src;
    fallback.alt = photo.alt;
    canvas.setAttribute('aria-label', `${photo.alt}, rendered as a portrait made of light particles`);
    if (announce) status.textContent = `${photo.label}. Photo ${index + 1} of ${data.photos.length}.`;
  }
  async function choosePhoto(index) {
    if (!openingFinished) finishOpening();
    const request = ++photoRequest;
    currentPhoto = (index + data.photos.length) % data.photos.length;
    updatePicker(currentPhoto);
    const target = currentPhoto;
    await sceneReady;
    if (request !== photoRequest) return;
    if (scene?.ready) {
      const success = await scene.setPhoto(target, { animate: !motionPreference.matches });
      if (request !== photoRequest) return;
      setSceneFallback(!success);
    } else setSceneFallback(true);
  }
  thumbnails.innerHTML = data.photos.map((photo, index) => `<button class="photo-thumb" data-photo="${index}" aria-label="Show photo ${index + 1}: ${esc(photo.label)}" aria-pressed="${index === currentPhoto}"><img src="${esc(photo.src)}" alt="${esc(photo.alt)}" draggable="false"></button>`).join('');
  thumbnails.addEventListener('click', event => {
    const button = event.target.closest('[data-photo]');
    if (button) choosePhoto(Number(button.dataset.photo));
  });
  thumbnails.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = currentPhoto;
    if (event.key === 'ArrowRight') next = (currentPhoto + 1) % data.photos.length;
    if (event.key === 'ArrowLeft') next = (currentPhoto - 1 + data.photos.length) % data.photos.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = data.photos.length - 1;
    choosePhoto(next);
    thumbnails.children[next].focus();
  });
  document.querySelector('#next-photo').addEventListener('click', () => choosePhoto(currentPhoto + 1));
  introControl.addEventListener('click', () => openingFinished ? startOpening() : finishOpening());
  updatePicker(currentPhoto, false);
  function createScene() {
    scene?.destroy();
    try {
      scene = new window.PortraitParticles({ canvas, photos: data.photos, initialIndex: currentPhoto, reducedMotion: motionPreference.matches });
      if (openingFinished) scene.setProgress(1);
      sceneReady = scene.init().then(success => { setSceneFallback(!success); return success; }).catch(() => { setSceneFallback(true); return false; });
    } catch {
      scene = null;
      sceneReady = Promise.resolve(false);
      setSceneFallback(true);
    }
  }
  createScene();
  startOpening();
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motionPreference.matches) return;
    scene?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => scene?.setPointer(0, 0));
  window.addEventListener('resize', () => {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { scene?.resize(); if (openingFinished) stage.style.top = finalTop(); });
  });
  document.addEventListener('visibilitychange', () => scene?.setPaused(document.hidden));
  motionPreference.addEventListener('change', () => { finishOpening(); createScene(); });
  window.addEventListener('pagehide', () => { cancelOpeningAnimations(); scene?.destroy(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { finishOpening(); createScene(); } });
})();
