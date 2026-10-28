/* The portrait is sampled live from Asadbek's photographs. No generated face or
   replacement image is used: every luminous point keeps its source pixel. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const hash = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  // The supplied cutout's alpha channel is its complete silhouette.
  // No polygon, inferred outline, or background removal is applied.

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
      const sample = document.createElement('canvas');
      const aspect = img.naturalWidth / img.naturalHeight;
      sample.height = Math.min(512, img.naturalHeight);
      sample.width = Math.round(sample.height * aspect);
      const context = sample.getContext('2d', { willReadFrequently: true });
      context.drawImage(img, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      const candidates = [];
      const max = this.mobile ? 16000 : 32000;
      // Focus adds facial detail only; it never crops or masks the cutout.
      const face = source.focus || [.5, .33, .28, .28];
      for (let y = 0; y < sample.height; y++) {
        const v = y / sample.height;
        for (let x = 0; x < sample.width; x++) {
          const pixel = (y * sample.width + x) * 4;
          const alpha = pixels[pixel + 3] / 255;
          if (alpha === 0) continue;
          const u = x / sample.width;
          const raw = (pixels[pixel] * .2126 + pixels[pixel + 1] * .7152 + pixels[pixel + 2] * .0722) / 255;
          const f = Math.exp(-(((u - face[0]) / face[2]) ** 2 * 1.8 + ((v - face[1]) / face[3]) ** 2 * 1.8));
          let luma = Math.pow(clamp((raw - .028) / .972), .68);
          luma = clamp(.025 + luma * .975 + f * smooth((raw - .12) / .35) * .12);
          const seed = x * 157 + y * 311 + index * 173;
          const priority = hash(seed) / ((.28 + Math.pow(luma, .55) * .72 + f * 1.30) * Math.max(.01, alpha));
          candidates.push({ u, v, alpha, luma, priority, seed });
        }
      }
      candidates.sort((a, b) => a.priority - b.priority);
      const particles = candidates.slice(0, max).map(p => {
        const azimuth = hash(p.seed + 10) * TAU;
        const z = hash(p.seed + 20) * 2 - 1;
        const radial = Math.sqrt(1 - z * z);
        const shell = .65 + hash(p.seed + 30) * .35;
        return {
          u: p.u, v: p.v, alpha: p.alpha, luma: p.luma, seed: p.seed,
          sx: Math.cos(azimuth) * radial * shell,
          sy: Math.sin(azimuth) * radial * shell,
          sz: z * shell,
          tone: clamp(Math.round(Math.pow(p.luma, .72) * 23), 0, 23),
          size: .78 + p.luma * .62 + hash(p.seed + 40) * .32,
          delay: hash(p.seed + 50) * .16
        };
      });
      particles.sort((a, b) => a.tone - b.tone);
      return { particles, aspect };
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
      // Contain the full cutout so even the widest pose keeps both hands.
      const aspect = this.photoAspect || 1;
      const ph = Math.min(h * (this.mobile ? .65 : .80), w * (this.mobile ? .92 : .76) / aspect);
      const pw = ph * aspect;
      const x0 = (w - pw) * .5;
      const y0 = h * (this.mobile ? .71 : .87) - ph;
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
        ctx.globalAlpha = point.alpha * clamp((.80 + point.luma * .20 + spark * .5) * (.68 + t * .32));
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
          const a = p.alpha * (this.reducedMotion ? .12 : Math.max(0, Math.sin(time * .55 + p.seed) - .76) * .9);
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
