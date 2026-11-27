(() => {
  'use strict';
  const data = window.HOME_CONTENT;
  if (!data?.photos?.length) return;
  const body = document.body;
  const stage = document.querySelector('#title-stage');
  const nameWord = document.querySelector('#name-word');
  const portfolioWord = document.querySelector('#portfolio-word');
  const introControl = document.querySelector('#intro-control') || document.createElement('button');
  const mark = document.querySelector('.opening-mark');
  const canvas = document.querySelector('#portrait-canvas');
  const fallback = document.querySelector('#portrait-fallback');
  const hero = document.querySelector('.homepage');
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
  const currentPhoto = 0;
  let scene = null;
  let openingFrame = null;
  let openingStarted = 0;
  let openingRun = 0;
  let openingFinished = false;
  let animations = [];
  let resizeFrame = null;
  let heroInView = !hero || (hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight);
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
  // One knob for the whole intro: 1 = original pace, lower = faster.
  const PACE = .68;
  function animate(element, keyframes, options) {
    const timed = { ...options };
    if (timed.delay) timed.delay *= PACE;
    if (timed.duration) timed.duration *= PACE;
    const animation = element.animate(keyframes, { fill: 'forwards', ...timed });
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
    return 0;
  }
  function setFinalTitle() {
    const separation = titleSeparation();
    portfolioWord.style.columnGap = `${separation}px`;
  }
  function finishOpening() {
    cancelOpeningAnimations();
    openingFinished = true;
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
    if (motionPreference.matches || document.hidden || !heroInView) { finishOpening(); return; }
    cancelOpeningAnimations();
    const run = openingRun;
    openingFinished = false;
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
    nameLetters.forEach(letter => {
      letter.style.opacity = '0';
      letter.style.transform = 'none';
    });
    portfolioLetters.forEach(letter => { letter.style.opacity = '0'; letter.style.transform = 'none'; });
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
    // The two words have different lengths. Each source glyph turns away while
    // the complete title is already laid out, so the last two letters also
    // arrive without mutating the name or changing its width mid-animation.
    const titleRects = portfolioLetters.map(letter => letter.getBoundingClientRect());
    nameLetters.forEach((letter, index) => {
      const from = glyphRects[index];
      const to = titleRects[index];
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      animate(letter, [
        { opacity: 1, transform: 'translateX(0) rotateX(0deg)' },
        { opacity: 0, transform: `translateX(${dx}px) rotateX(90deg)` }
      ], { delay: 3830 + index * 115, duration: 320, easing: 'cubic-bezier(.5,0,.8,.5)' });
    });
    portfolioWord.style.opacity = '1';
    portfolioLetters.forEach((letter, index) => {
      const source = glyphRects[Math.min(index, glyphRects.length - 1)];
      const target = titleRects[index];
      const dx = source.left + source.width / 2 - (target.left + target.width / 2);
      animate(letter, [
        { opacity: 0, transform: `translateX(${dx * .16}px) translateY(8px) rotateX(-90deg)` },
        { opacity: 1, transform: 'translateX(0) translateY(0) rotateX(0deg)' }
      ], { delay: 4000 + index * 115, duration: 420, easing: 'cubic-bezier(.18,.8,.2,1)' });
    });
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
    let nameHidden = false;
    function tick(now) {
      if (openingFinished || run !== openingRun) return;
      const elapsed = (now - openingStarted) / PACE;
      if (!nameHidden && elapsed >= 4880) {
        nameHidden = true;
        nameWord.style.display = 'none';
      }
      if (elapsed > portraitAt) body.classList.add('is-portrait-revealing');
      if (elapsed > glideAt + 480) { body.classList.add('is-revealing'); if (heroDetails) heroDetails.inert = false; }
      scene?.setProgress(clamp((elapsed - portraitAt) / 1950));
      if (elapsed >= 7650) { finishOpening(); return; }
      openingFrame = requestAnimationFrame(tick);
    }
    openingFrame = requestAnimationFrame(tick);
  }
  introControl.addEventListener('click', () => openingFinished ? startOpening() : finishOpening());
  fallback.src = data.photos[currentPhoto].src;
  fallback.alt = data.photos[currentPhoto].alt;
  canvas.setAttribute('aria-label', `${data.photos[currentPhoto].alt}, rendered in a fine grayscale mosaic`);
  if (status) status.textContent = '';
  function updateScenePause() {
    scene?.setPaused(document.hidden || !heroInView);
  }
  function createScene() {
    scene?.destroy();
    try {
      const createdScene = new window.PortraitParticles({ canvas, photos: data.photos, initialIndex: currentPhoto, reducedMotion: motionPreference.matches });
      scene = createdScene;
      createdScene.setFormation(visitOpening.variantId);
      if (openingFinished) createdScene.setProgress(1);
      createdScene.init().then(success => {
        if (scene !== createdScene) return false;
        setSceneFallback(!success);
        updateScenePause();
        return success;
      }).catch(() => {
        if (scene === createdScene) setSceneFallback(true);
        return false;
      });
    } catch {
      scene = null;
      setSceneFallback(true);
    }
  }
  createScene();
  startOpening();
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash && link.hash !== '#home' && !openingFinished) finishOpening();
  });
  if (hero && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      heroInView = entries[0].isIntersecting;
      if (!heroInView && !openingFinished) finishOpening();
      updateScenePause();
    }, { threshold: 0 });
    observer.observe(hero);
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motionPreference.matches || !heroInView) return;
    const bounds = hero?.getBoundingClientRect() || { left: 0, top: 0, width: innerWidth, height: innerHeight };
    scene?.setPointer((event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => scene?.setPointer(0, 0));
  window.addEventListener('resize', () => {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { scene?.resize(); if (openingFinished) { stage.style.top = finalTop(); setFinalTitle(); } });
  });
  document.addEventListener('visibilitychange', updateScenePause);
  motionPreference.addEventListener('change', () => { finishOpening(); createScene(); });
  window.addEventListener('pagehide', () => { cancelOpeningAnimations(); scene?.destroy(); scene = null; });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    visitOpening = pickVisitOpening();
    createScene();
    startOpening();
  });
})();
