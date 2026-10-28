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
  const variantIds = ['tumble', 'rise', 'scatter'];
  function pickVisitOpening() {
    return window.chooseVisitOpening?.({ photos: data.photos, variantIds })
      || { photoIndex: data.initialPhoto || 0, variantId: 'tumble' };
  }
  let visitOpening = pickVisitOpening();
  let currentPhoto = Math.max(0, Math.min(data.photos.length - 1, visitOpening.photoIndex));
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
    body.dataset.opening = visitOpening.variantId;
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
    const variant = visitOpening.variantId;
    scene?.setFormation(variant);
    nameLetters.forEach((letter, index) => {
      letter.style.opacity = '0';
      const sign = index % 2 ? -1 : 1;
      const middle = (nameLetters.length - 1) / 2;
      let entrance = `translate3d(${sign * 110}px,${index % 3 ? -90 : 100}px,260px) rotateX(${sign * 110}deg) rotateY(${-sign * 120}deg) rotateZ(${sign * 15}deg)`;
      let delay = 430 + index * 84;
      let duration = 850;
      let exit = `rotateY(${sign * 90}deg) rotateX(35deg) translateY(-25px)`;
      if (variant === 'rise') {
        entrance = 'translate3d(0,170px,-100px) rotateX(95deg) scale(.85)';
        delay = 310 + index * 62;
        duration = 850;
        exit = 'translate3d(0,-90px,-80px) rotateX(-90deg)';
      } else if (variant === 'scatter') {
        const distance = Math.min(340, innerWidth * .28);
        entrance = `translate3d(${sign * distance}px,${(index - middle) * 28}px,200px) rotateZ(${sign * 32}deg) scale(.35)`;
        delay = 350 + Math.abs(index - middle) * 88;
        duration = 1000;
        exit = `translate3d(${sign * 150}px,-50px,100px) rotateZ(${sign * 35}deg) scale(.4)`;
      }
      animate(letter, [
        { opacity: 0, transform: entrance },
        { opacity: 1, transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)' }
      ], { delay, duration, easing: 'cubic-bezier(.16,.8,.23,1)' });
      animate(letter, [
        { opacity: 1, transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)' },
        { opacity: 0, transform: exit }
      ], { delay: 1990 + index * 30, duration: 370, easing: 'cubic-bezier(.6,0,.9,.6)' });
    });
    portfolioLetters.forEach((letter, index) => {
      letter.style.opacity = '0';
      const sign = index % 2 ? -1 : 1;
      let entrance = `translate3d(${sign * 28}px,60px,140px) rotateX(85deg) rotateY(${sign * 85}deg)`;
      let delay = 2260 + index * 55;
      if (variant === 'rise') {
        entrance = 'translate3d(0,115px,-120px) rotateX(-90deg) scale(.9)';
        delay = 2320 + Math.abs(index - (portfolioLetters.length - 1) / 2) * 70;
      } else if (variant === 'scatter') {
        entrance = `translate3d(${sign * 120}px,${sign * 65}px,160px) rotateZ(${sign * 18}deg) scale(1.3)`;
        delay = 2300 + index * 50;
      }
      animate(letter, [
        { opacity: 0, transform: entrance },
        { opacity: 1, transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)' }
      ], { delay, duration: 650, easing: 'cubic-bezier(.16,.8,.23,1)' });
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
    const selectedScene = scene;
    if (selectedScene?.ready) {
      const success = await selectedScene.setPhoto(target, { animate: !motionPreference.matches });
      if (request !== photoRequest || scene !== selectedScene) return;
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
    ++photoRequest;
    scene?.destroy();
    try {
      const createdScene = new window.PortraitParticles({ canvas, photos: data.photos, initialIndex: currentPhoto, reducedMotion: motionPreference.matches });
      scene = createdScene;
      createdScene.setFormation(visitOpening.variantId);
      if (openingFinished) createdScene.setProgress(1);
      sceneReady = createdScene.init().then(success => {
        if (scene !== createdScene) return false;
        setSceneFallback(!success);
        return success;
      }).catch(() => {
        if (scene === createdScene) setSceneFallback(true);
        return false;
      });
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
  window.addEventListener('pagehide', () => { ++photoRequest; cancelOpeningAnimations(); scene?.destroy(); scene = null; });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    visitOpening = pickVisitOpening();
    currentPhoto = Math.max(0, Math.min(data.photos.length - 1, visitOpening.photoIndex));
    updatePicker(currentPhoto, false);
    createScene();
    startOpening();
  });
})();
