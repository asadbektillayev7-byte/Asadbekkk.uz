/* The portrait is sampled live from Asadbek's photographs. No generated face or
   replacement image is used: every luminous point keeps its source pixel. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const hash = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const inside = (x, y, poly) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
  };
  // Loose silhouettes remove rooms and backgrounds while preserving the actual
  // face, hair, clothing, and pose. Coordinates refer to the original files.
  const presets = {
    portrait: { face: [.52, .43, .24, .30], crop: [.03, 0, .97, 1], polygon: [[.49,.038],[.65,.052],[.74,.12],[.77,.24],[.75,.38],[.72,.55],[.65,.67],[.67,.74],[.83,.80],[.99,.95],[1,1],[0,1],[.03,.91],[.26,.80],[.35,.73],[.35,.65],[.29,.52],[.29,.30],[.30,.14],[.37,.07]] },
    laptop: { face: [.62, .58, .24, .23], crop: [0, .10, 1, .98], polygon: [[.41,.145],[.61,.12],[.80,.14],[.94,.19],[.98,.30],[.96,.43],[.87,.57],[.79,.585],[.76,.66],[.69,.75],[.64,.80],[.60,.85],[.61,.98],[.13,.99],[0,.92],[0,.67],[.14,.61],[.31,.57],[.34,.48],[.34,.37],[.34,.25]] },
    statue: { face: [.74, .39, .16, .20], crop: [.19,.13,1,1], polygon: [[.68,.25],[.78,.23],[.86,.27],[.89,.35],[.85,.44],[.85,.51],[1,.56],[1,1],[.66,1],[.55,.75],[.55,.59],[.35,.55],[.28,.50],[.30,.45],[.46,.49],[.58,.49],[.58,.44],[.61,.40],[.62,.34]] },
    school: { face: [.51,.35,.20,.24], crop: [.05,.07,.96,1], polygon: [[.44,.13],[.59,.14],[.67,.20],[.70,.30],[.68,.43],[.62,.52],[.62,.58],[.77,.63],[.90,.75],[.98,1],[.05,1],[.12,.76],[.27,.64],[.39,.59],[.39,.52],[.33,.41],[.32,.28],[.35,.19]] },
    outdoors: { face: [.55,.53,.23,.27], crop: [.03,.24,.99,1], polygon: [[.45,.26],[.60,.26],[.71,.31],[.76,.40],[.77,.54],[.73,.66],[.66,.75],[.66,.80],[.81,.82],[1,.86],[1,1],[0,1],[0,.91],[.23,.85],[.39,.81],[.39,.75],[.35,.63],[.33,.47],[.36,.34]] },
    selfie: { face: [.59,.48,.14,.24], crop: [.17,.20,.97,1], polygon: [[.53,.25],[.63,.25],[.69,.29],[.72,.39],[.70,.54],[.67,.63],[.67,.70],[.83,.78],[1,.87],[1,1],[.20,1],[.27,.85],[.48,.72],[.50,.66],[.46,.53],[.46,.38],[.49,.29]] }
  };

  class PortraitParticles {
    constructor({ canvas, photos = [], initialIndex = 1, reducedMotion = false } = {}) {
      if (!canvas || !canvas.getContext) throw new Error('PortraitParticles requires a canvas.');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.photos = photos;
      this.index = clamp(initialIndex, 0, Math.max(0, photos.length - 1));
      this.reducedMotion = !!reducedMotion;
      this.progress = this.reducedMotion ? 1 : 0;
      this.pointer = { x: 0, y: 0 };
      this.pointerSmoothed = { x: 0, y: 0 };
      this.paused = false;
      this.ready = false;
      this.destroyed = false;
      this.particles = [];
      this.cache = new Map();
      this.requestToken = 0;
      this.frame = null;
      this.transition = null;
      this.startedAt = performance.now();
      this.lastFrame = 0;
      this.palette = Array.from({ length: 24 }, (_, i) => {
        const light = Math.round(44 + i / 23 * 211);
        return `rgb(${Math.round(light * .94)},${Math.round(light * .97)},${light})`;
      });
      this.stars = Array.from({ length: 180 }, (_, i) => ({ x: hash(i + 700), y: hash(i + 900), size: .3 + hash(i + 500) * .7, alpha: .08 + hash(i + 650) * .36, phase: hash(i + 320) * TAU }));
      this._tick = this._tick.bind(this);
      this.resize();
    }

    async init() {
      if (this.destroyed || !this.photos.length || !this.ctx) return false;
      try {
        const result = await this._loadPhoto(this.index);
        if (this.destroyed) return false;
        this.particles = result.particles;
        this.photoAspect = result.aspect;
        this.photoAnchor = result.anchor;
        this.photoKey = result.key;
        this.ready = true;
        this._render(performance.now());
        this._requestFrame();
        return true;
      } catch (error) {
        this.error = error;
        this._render(performance.now());
        return false;
      }
    }

    setProgress(value) {
      this.progress = this.reducedMotion ? 1 : clamp(Number(value) || 0);
      if (this.ready) {
        if (this.reducedMotion || this.paused) this._render(performance.now());
        this._requestFrame();
      }
    }

    async setPhoto(index, { animate = true } = {}) {
      index = Math.round(Number(index));
      if (!Number.isFinite(index) || index < 0 || index >= this.photos.length || this.destroyed) return false;
      const token = ++this.requestToken;
      try {
        const result = await this._loadPhoto(index);
        if (this.destroyed || token !== this.requestToken) return false;
        if (index === this.index && this.ready) return true;
        this.index = index;
        if (animate && !this.reducedMotion && this.ready && !this.paused) {
          this.transition = { started: performance.now(), duration: 1320, next: result, switched: false };
        } else {
          this.particles = result.particles;
          this.photoAspect = result.aspect;
        this.photoAnchor = result.anchor;
        this.photoKey = result.key;
          this.transition = null;
        }
        this.ready = true;
        this._render(performance.now());
        this._requestFrame();
        return true;
      } catch (error) {
        this.error = error;
        return false;
      }
    }

    setPointer(x, y) {
      this.pointer.x = clamp(Number(x) || 0, -1, 1);
      this.pointer.y = clamp(Number(y) || 0, -1, 1);
      if (!this.reducedMotion) this._requestFrame();
    }

    setPaused(value) {
      this.paused = !!value;
      if (this.paused) {
        if (this.frame !== null) cancelAnimationFrame(this.frame);
        this.frame = null;
      } else this._requestFrame();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, rect.width || window.innerWidth);
      this.height = Math.max(1, rect.height || window.innerHeight);
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.mobile = this.width < 700;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      if (this.ctx) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.ready) this._render(performance.now());
    }

    destroy() {
      this.destroyed = true;
      ++this.requestToken;
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      this.cache.clear();
      this.particles.length = 0;
    }

    async _loadPhoto(index) {
      const source = this.photos[index];
      if (!source || !source.src) throw new Error('Missing portrait photograph.');
      if (this.cache.has(source.src)) return this.cache.get(source.src);
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          try { resolve(this._sample(img, source, index)); }
          catch (error) { reject(error); }
        };
        img.onerror = () => reject(new Error('Unable to load portrait photograph.'));
        img.src = source.src;
      });
      this.cache.set(source.src, promise);
      try { return await promise; }
      catch (error) { this.cache.delete(source.src); throw error; }
    }

    _sample(img, source, index) {
      const key = Object.keys(presets).find(name => source.src.includes(name)) || 'portrait';
      const config = presets[key];
      const sample = document.createElement('canvas');
      const aspect = img.naturalWidth / img.naturalHeight;
      sample.height = 440;
      sample.width = Math.round(440 * aspect);
      const context = sample.getContext('2d', { willReadFrequently: true });
      context.drawImage(img, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      const [cx, cy, cw, ch] = config.crop;
      const candidates = [];
      const max = this.mobile ? 16000 : 32000;
      const face = config.face;
      for (let y = 0; y < sample.height; y += 1) {
        const v = y / sample.height;
        for (let x = 0; x < sample.width; x += 1) {
          const u = x / sample.width;
          if (u < cx || u > cw || v < cy || v > ch || !inside(u, v, config.polygon)) continue;
          const pixel = (y * sample.width + x) * 4;
          const raw = (pixels[pixel] * .2126 + pixels[pixel + 1] * .7152 + pixels[pixel + 2] * .0722) / 255;
          const f = Math.exp(-(((u - face[0]) / face[2]) ** 2 * 1.8 + ((v - face[1]) / face[3]) ** 2 * 1.8));
          // Portrait edges and dark eyes remain dark, rather than losing the
          // identity in a uniformly bright particle silhouette.
          let luma = Math.pow(clamp((raw - .028) / .972), .68);
          luma = clamp(.025 + luma * .975 + f * smooth((raw - .12) / .35) * .12);
          const seed = x * 157 + y * 311 + index * 173;
          const priority = hash(seed) / (.28 + Math.pow(luma, .55) * .72 + f * 1.30);
          candidates.push({ u: (u - cx) / (cw - cx), v: (v - cy) / (ch - cy), luma, priority, seed });
        }
      }
      candidates.sort((a, b) => a.priority - b.priority);
      const particles = candidates.slice(0, max).map(p => {
        const azimuth = hash(p.seed + 10) * TAU;
        const z = hash(p.seed + 20) * 2 - 1;
        const radial = Math.sqrt(1 - z * z);
        const shell = .65 + hash(p.seed + 30) * .35;
        const luma = p.luma;
        return {
          u: p.u, v: p.v, luma, seed: p.seed,
          sx: Math.cos(azimuth) * radial * shell,
          sy: Math.sin(azimuth) * radial * shell,
          sz: z * shell,
          tone: clamp(Math.round(Math.pow(luma, .72) * 23), 0, 23),
          size: .78 + luma * .62 + hash(p.seed + 40) * .32,
          delay: hash(p.seed + 50) * .16
        };
      });
      // Grouping by tone avoids thousands of context state changes per frame.
      particles.sort((a, b) => a.tone - b.tone);
      return { particles, aspect: aspect * (cw - cx) / (ch - cy), anchor: (face[0] - cx) / (cw - cx), key };
    }

    _requestFrame() {
      if (this.destroyed || this.paused || !this.ready || this.reducedMotion || this.frame !== null) return;
      this.frame = requestAnimationFrame(this._tick);
    }

    _tick(now) {
      this.frame = null;
      if (this.paused || this.destroyed) return;
      // A steady 30fps keeps dense points gentle on laptop and mobile GPUs.
      if (now - this.lastFrame > 30) {
        this.lastFrame = now;
        this._render(now);
      }
      const pointerSettled = Math.abs(this.pointer.x - this.pointerSmoothed.x) < .003 && Math.abs(this.pointer.y - this.pointerSmoothed.y) < .003;
      // The assembled face rests instead of continuously spending CPU. A new
      // pointer, photo, opening-progress or resize event renders it again.
      if (this.progress >= .999 && !this.transition && pointerSettled && this.lastFrame === now) return;
      this._requestFrame();
    }

    _render(now) {
      const ctx = this.ctx;
      if (!ctx) return;
      const w = this.width, h = this.height;
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#020303';
      ctx.fillRect(0, 0, w, h);
      const time = this.reducedMotion ? 0 : (now - this.startedAt) * .001;
      for (const star of this.stars) {
        ctx.globalAlpha = star.alpha * (.76 + Math.sin(time * .45 + star.phase) * .24);
        ctx.fillStyle = '#adb9bb';
        ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
      }
      if (!this.ready) { ctx.globalAlpha = 1; return; }
      let progress = this.reducedMotion ? 1 : this.progress;
      if (this.transition) {
        const t = clamp((now - this.transition.started) / this.transition.duration);
        if (t < .38) progress = 1 - smooth(t / .38);
        else {
          if (!this.transition.switched) {
            this.particles = this.transition.next.particles;
            this.photoAspect = this.transition.next.aspect;
            this.photoAnchor = this.transition.next.anchor;
            this.photoKey = this.transition.next.key;
            this.transition.switched = true;
          }
          progress = smooth((t - .38) / .62);
        }
        if (t >= 1) this.transition = null;
      }
      this.pointerSmoothed.x += (this.pointer.x - this.pointerSmoothed.x) * .055;
      this.pointerSmoothed.y += (this.pointer.y - this.pointerSmoothed.y) * .055;
      const px = this.reducedMotion ? 0 : this.pointerSmoothed.x;
      const py = this.reducedMotion ? 0 : this.pointerSmoothed.y;
      const ph = this.mobile ? Math.min(h * .72, w * 1.15) : h * (this.photoKey === 'laptop' ? .80 : .87);
      const pw = ph * (this.photoAspect || .75);
      const x0 = w * .50 - pw * (this.photoAnchor || .5);
      const y0 = this.mobile ? h * .14 : h * (this.photoKey === 'laptop' ? .025 : .085);
      const radius = Math.min(w * .35, h * .36);
      const angle = time * .10;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const shimmer = this.reducedMotion ? 0 : .07;
      let lastTone = -1;
      const drawCount = Math.min(this.particles.length, this.mobile ? 16000 : 32000);
      const stride = this.particles.length / Math.max(1, drawCount);
      for (let i = 0; i < drawCount; i++) {
        const point = this.particles[Math.floor(i * stride)];
        const t = this.reducedMotion ? 1 : smooth(clamp((progress - point.delay * (1 - progress)) / (1 - point.delay)));
        const scatter = 1 - t;
        const rx = point.sx * cos + point.sz * sin;
        const rz = point.sz * cos - point.sx * sin;
        const perspective = 1 + rz * .16;
        const cloudX = w * .5 + rx * radius * perspective;
        const cloudY = h * .47 + point.sy * radius * perspective;
        const portraitX = x0 + point.u * pw + px * 7;
        const portraitY = y0 + point.v * ph + py * 5;
        const float = this.reducedMotion ? 0 : Math.sin(time * .7 + point.seed) * .15;
        const x = cloudX * scatter + portraitX * t + float;
        const y = cloudY * scatter + portraitY * t;
        const size = point.size * (this.mobile ? .90 : 1.05) * (1 + scatter * .2);
        if (point.tone !== lastTone) { lastTone = point.tone; ctx.fillStyle = this.palette[lastTone]; }
        const spark = Math.sin(point.seed + time * .7) * shimmer;
        ctx.globalAlpha = clamp((.80 + point.luma * .20 + spark * .5) * (.68 + t * .32));
        ctx.fillRect(x, y, size, size);
      }
      // A few very fine glints share the same sampled positions, adding depth
      // without an image overlay or a glow that would blur facial details.
      ctx.globalAlpha = .30;
      ctx.fillStyle = '#eaf2f3';
      if (progress > .96) {
        for (let i = 97; i < this.particles.length; i += 997) {
          const p = this.particles[i];
          if (p.luma < .3) continue;
          const x = x0 + p.u * pw + px * 7, y = y0 + p.v * ph + py * 5;
          const a = this.reducedMotion ? .12 : Math.max(0, Math.sin(time * .55 + p.seed) - .76) * .9;
          ctx.globalAlpha = a;
          ctx.fillRect(x - 2, y, 5, .45);
          ctx.fillRect(x, y - 2, .45, 5);
        }
      }
      ctx.globalAlpha = 1;
    }
  }
  window.PortraitParticles = PortraitParticles;
})();
