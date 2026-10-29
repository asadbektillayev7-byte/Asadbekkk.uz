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
  const heroDetails = document.querySelector('.hero-details');
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
  let openingRun = 0;
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
  const titleHalves = [document.createElement('span'), document.createElement('span')];
  titleHalves.forEach((half, index) => {
    half.className = `word-half word-half-${index ? 'last' : 'first'}`;
    half.style.display = 'flex';
    half.setAttribute('aria-hidden', 'true');
    portfolioWord.append(half);
  });
  portfolioLetters.forEach((letter, index) => titleHalves[index < 4 ? 0 : 1].append(letter));
  const originalName = Array.from(data.introName || data.name.toUpperCase());
  const finalTitle = Array.from(data.title || 'PORTFOLIO');
  function animate(element, keyframes, options) {
    const animation = element.animate(keyframes, { fill: 'forwards', ...options });
    animations.push(animation);
    return animation;
  }
  function cancelOpeningAnimations() {
    ++openingRun;
    if (openingFrame !== null) cancelAnimationFrame(openingFrame);
    openingFrame = null;
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function isCompact() { return window.matchMedia('(max-width: 767px)').matches; }
  function finalTop() { return isCompact() ? '20%' : '74%'; }
  function titleSeparation() {
    return isCompact() ? 0 : Math.min(16, innerWidth * .01);
  }
  function setFinalTitle() {
    const separation = titleSeparation();
    portfolioWord.style.columnGap = `${separation}px`;
  }
  function finishOpening() {
    cancelOpeningAnimations();
    openingFinished = true;
    footer.inert = false;
    if (heroDetails) heroDetails.inert = false;
    body.classList.remove('is-loading', 'is-opening');
    body.classList.add('is-revealing', 'is-portrait-revealing', 'is-ready');
    nameWord.style.display = 'none';
    portfolioWord.style.opacity = '1';
    portfolioLetters.forEach(letter => { letter.style.opacity = '1'; letter.style.transform = 'none'; });
    setFinalTitle();
    stage.style.top = finalTop();
    mark.style.opacity = '0';
    scene?.setProgress(1);
    introControl.innerHTML = motionPreference.matches ? 'Motion reduced' : 'Replay intro <span aria-hidden="true">↻</span>';
    introControl.disabled = motionPreference.matches;
  }
  async function startOpening() {
    body.dataset.opening = visitOpening.variantId;
    if (motionPreference.matches) { finishOpening(); return; }
    cancelOpeningAnimations();
    const run = openingRun;
    openingFinished = false;
    footer.inert = true;
    if (heroDetails) heroDetails.inert = true;
    body.classList.remove('is-loading', 'is-revealing', 'is-portrait-revealing', 'is-ready');
    body.classList.add('is-opening');
    nameWord.style.display = 'flex';
    nameWord.style.opacity = '1';
    portfolioWord.style.opacity = '0';
    stage.style.top = '50%';
    mark.style.opacity = '0';
    titleHalves.forEach(half => { half.style.transform = 'none'; });
    portfolioWord.style.columnGap = '0px';
    nameLetters.forEach((letter, index) => {
      letter.textContent = originalName[index] || '';
      letter.dataset.letter = originalName[index] || '';
      letter.style.opacity = '0';
      letter.style.transform = 'none';
    });
    portfolioLetters.forEach(letter => { letter.style.opacity = '1'; letter.style.transform = 'none'; });
    scene?.setProgress(0);
    scene?.setFormation(visitOpening.variantId);
    introControl.innerHTML = 'Skip intro <span aria-hidden="true">↗</span>';
    introControl.disabled = false;
    try { await document.fonts?.ready; } catch { /* System fonts remain usable. */ }
    if (run !== openingRun || openingFinished) return;

    const variant = visitOpening.variantId;
    const wordRect = nameWord.getBoundingClientRect();
    const glyphRects = nameLetters.map(letter => letter.getBoundingClientRect());
    const pivotIndex = Math.floor((nameLetters.length - 1) / 2);
    const pivot = nameLetters[pivotIndex];
    const pivotRect = glyphRects[pivotIndex];
    const fontSize = parseFloat(getComputedStyle(nameWord).fontSize) || 120;
    const landingX = pivotRect.left + pivotRect.width / 2;
    const landingY = pivotRect.top + pivotRect.height * .92;
    const dotSize = Math.max(16, Math.min(42, fontSize * .21));
    mark.style.left = `${landingX}px`;
    mark.style.top = `${landingY + fontSize * .1}px`;
    mark.style.width = `${dotSize}px`;
    mark.style.height = `${dotSize}px`;
    const dot = mark.querySelector('span');
    if (dot) { dot.style.width = '100%'; dot.style.height = '100%'; dot.style.margin = '0'; }
    const fallingDistance = Math.max(300, wordRect.top + fontSize * 1.5);
    animate(mark, [
      { opacity: 0, transform: `translate(-50%,calc(-50% - ${fallingDistance}px)) scale(.9)` },
      { opacity: 1, transform: `translate(-50%,calc(-50% - ${fallingDistance * .6}px)) scale(.82,1.2)`, offset: .25 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1.35,.58)', offset: .43 },
      { opacity: 1, transform: `translate(-50%,calc(-50% - ${fontSize * .3}px)) scale(.98,1.02)`, offset: .61 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1.18,.78)', offset: .76 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .9 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.2)' }
    ], { duration: 1770, easing: 'linear' });
    pivot.style.transformOrigin = '50% 92%';
    animate(pivot, [
      { opacity: 0, transform: `translateY(${-fallingDistance}px)` },
      { opacity: 1, transform: `translateY(${-fontSize * .25}px) scale(.9,1.1)`, offset: .33 },
      { opacity: 1, transform: 'translateY(0) scale(1.22,.76)', offset: .5 },
      { opacity: 1, transform: `translateY(${-fontSize * .09}px) scale(1) rotate(-5deg)`, offset: .69 },
      { opacity: 1, transform: 'translateY(0) scale(1) rotate(0deg)' }
    ], { delay: 770, duration: 830, easing: 'cubic-bezier(.25,.5,.4,1)' });
    animate(pivot, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-61deg)', offset: .19 },
      { transform: 'rotate(-66deg)', offset: .25 },
      { transform: 'rotate(-59deg)', offset: .34 },
      { transform: 'rotate(61deg)', offset: .62 },
      { transform: 'rotate(67deg)', offset: .69 },
      { transform: 'rotate(58deg)', offset: .79 },
      { transform: 'rotate(-4deg)', offset: .92 },
      { transform: 'rotate(0deg)' }
    ], { delay: 1580, duration: 1840, easing: 'cubic-bezier(.22,.7,.3,1)' });
    const left = nameLetters.map((_, index) => index).filter(index => index < pivotIndex).reverse();
    const right = nameLetters.map((_, index) => index).filter(index => index > pivotIndex);
    function toss(indices, side, begins) {
      indices.forEach((index, order) => {
        const glyph = glyphRects[index];
        const x = landingX + side * fontSize * .54 - (glyph.left + glyph.width / 2);
        const y = landingY - fontSize * .48 - (glyph.top + glyph.height / 2);
        const height = fontSize * (variant === 'rise' ? .95 : .6) + Math.abs(x) * .23;
        const rotation = -side * (variant === 'scatter' ? 285 : 205) + order * 11;
        const duration = 780 + Math.min(170, Math.abs(x) * .25);
        const delay = begins + order * (variant === 'scatter' ? 85 : 110);
        animate(nameLetters[index], [
          { opacity: 0, transform: `translate(${x}px,${y}px) rotate(${rotation}deg) scale(.3)` },
          { opacity: 1, transform: `translate(${x * .62}px,${Math.min(y, 0) - height}px) rotate(${rotation * .56}deg) scale(.88)`, offset: .38 },
          { opacity: 1, transform: 'translate(0,0) rotate(0deg) scale(1)', offset: .82 },
          { opacity: 1, transform: `translateY(${-fontSize * .035}px) rotate(0deg) scale(1)`, offset: .9 },
          { opacity: 1, transform: 'translate(0,0) rotate(0deg) scale(1)' }
        ], { delay, duration, easing: 'cubic-bezier(.2,.65,.35,1)' });
      });
    }
    toss(left, -1, 1810);
    toss(right, 1, 2490);
    const glideAt = 5200;
    const portraitAt = 5480;
    const separation = titleSeparation();
    animate(stage, [{ top: '50%' }, { top: finalTop() }], { delay: glideAt, duration: 1500, easing: 'cubic-bezier(.65,0,.2,1)' });
    // Animate layout spacing instead of compositing transformed gradient glyphs.
    animate(portfolioWord, [
      { columnGap: '0px' },
      { columnGap: `${separation}px` }
    ], { delay: glideAt + 320, duration: 1500, easing: 'cubic-bezier(.16,.7,.25,1)' });
    openingStarted = performance.now();
    let changedLetters = 0;
    let titleShown = false;
    function tick(now) {
      if (openingFinished || run !== openingRun) return;
      const elapsed = now - openingStarted;
      const morphCount = Math.min(finalTitle.length, Math.max(0, Math.floor((elapsed - 3750) / 145)));
      while (changedLetters < morphCount) {
        const glyph = nameLetters[changedLetters];
        if (glyph) { glyph.textContent = finalTitle[changedLetters]; glyph.dataset.letter = finalTitle[changedLetters]; }
        ++changedLetters;
      }
      if (!titleShown && elapsed >= 5110) {
        titleShown = true;
        nameWord.style.display = 'none';
        portfolioWord.style.opacity = '1';
      }
      if (elapsed > portraitAt) body.classList.add('is-portrait-revealing');
      if (elapsed > glideAt + 480) { body.classList.add('is-revealing'); footer.inert = false; if (heroDetails) heroDetails.inert = false; }
      scene?.setProgress(clamp((elapsed - portraitAt) / 1950));
      if (elapsed >= 7650) { finishOpening(); return; }
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
    canvas.setAttribute('aria-label', `${photo.alt}, rendered in a fine grayscale mosaic`);
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
    resizeFrame = requestAnimationFrame(() => { scene?.resize(); if (openingFinished) { stage.style.top = finalTop(); setFinalTitle(); } });
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
