/* Asadbek's real cutout supplies a regular mosaic and its faint detail layer.
   The tiles retain the photograph's shadows instead of adding white noise. */
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
      this.formation = 'tumble';
      this.pointer = { x: 0, y: 0 };
      this.pointerSmoothed = { x: 0, y: 0 };
      this.paused = false;
      this.ready = false;
      this.destroyed = false;
      this.particles = [];
      this.detail = null;
      this.gridWidth = 1;
      this.photoFocus = [.5, .33];
      this.cache = new Map();
      this.requestToken = 0;
      this.frame = null;
      this.transition = null;
      this.startedAt = performance.now();
      this.lastFrame = 0;
      this.palette = Array.from({ length: 48 }, (_, i) => {
        const light = Math.round(i / 47 * 246);
        return `rgb(${Math.round(light * .90)},${Math.round(light * .95)},${light})`;
      });
      this.stars = Array.from({ length: 220 }, (_, i) => ({ x: hash(i + 700), y: hash(i + 900), size: .20 + hash(i + 500) * .35, alpha: .025 + hash(i + 650) * .10, phase: hash(i + 320) * TAU }));
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
        this.detail = result.detail;
        this.gridWidth = result.gridWidth;
        this.photoFocus = result.focus;
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
          this.detail = result.detail;
          this.gridWidth = result.gridWidth;
          this.photoFocus = result.focus;
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

    setFormation(value) {
      this.formation = ['tumble', 'rise', 'scatter'].includes(value) ? value : 'tumble';
      if (this.ready) this._requestFrame();
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
      this.mobile = this.width < 768;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      if (this.ctx) {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.backgroundGradient = this.ctx.createRadialGradient(
          this.width * .5, this.height * .43, 0,
          this.width * .5, this.height * .43, Math.max(this.width * .52, this.height * .64)
        );
        this.backgroundGradient.addColorStop(0, '#121414');
        this.backgroundGradient.addColorStop(.55, '#080a0a');
        this.backgroundGradient.addColorStop(1, '#020303');
      }
      if (this.ready) this._render(performance.now());
    }

    destroy() {
      this.destroyed = true;
      ++this.requestToken;
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      this.cache.clear();
      this.particles.length = 0;
      this.detail = null;
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
      const imageData = context.getImageData(0, 0, sample.width, sample.height);
      const pixels = imageData.data;
      for (let pixel = 0; pixel < pixels.length; pixel += 4) {
        if (!pixels[pixel + 3]) continue;
        const raw = (pixels[pixel] * .2126 + pixels[pixel + 1] * .7152 + pixels[pixel + 2] * .0722) / 255;
        const light = Math.round(Math.pow(clamp((raw - .025) / .975), 1.04) * 238);
        pixels[pixel] = Math.round(light * .94);
        pixels[pixel + 1] = Math.round(light * .97);
        pixels[pixel + 2] = light;
      }
      context.putImageData(imageData, 0, 0);

      // A uniform lattice makes tiny, distinct tiles with deliberate dark gaps.
      // Area sampling averages each tile's real source pixels, keeping the eyes
      // and mouth tonal instead of selecting random bright pixels from them.
      const geometry = this._geometry(aspect, source.focus);
      const grid = document.createElement('canvas');
      grid.width = Math.round(clamp(geometry.pw / (this.mobile ? 2.35 : 3.35), 72, 230));
      grid.height = Math.max(1, Math.round(grid.width / aspect));
      const gridContext = grid.getContext('2d', { willReadFrequently: true });
      gridContext.imageSmoothingQuality = 'high';
      gridContext.drawImage(img, 0, 0, grid.width, grid.height);
      const cells = gridContext.getImageData(0, 0, grid.width, grid.height).data;
      const particles = [];
      for (let y = 0; y < grid.height; y++) for (let x = 0; x < grid.width; x++) {
        const pixel = (y * grid.width + x) * 4;
        const alpha = cells[pixel + 3] / 255;
        if (alpha < .02) continue;
        const raw = (cells[pixel] * .2126 + cells[pixel + 1] * .7152 + cells[pixel + 2] * .0722) / 255;
        const luma = Math.pow(clamp((raw - .022) / .95), .96);
        if (luma < .012) continue;
        const seed = x * 157 + y * 311 + index * 173;
        const azimuth = hash(seed + 10) * TAU;
        const z = hash(seed + 20) * 2 - 1;
        const radial = Math.sqrt(1 - z * z);
        const shell = .65 + hash(seed + 30) * .35;
        particles.push({
          u: (x + .5) / grid.width, v: (y + .5) / grid.height, alpha, luma, seed,
          sx: Math.cos(azimuth) * radial * shell,
          sy: Math.sin(azimuth) * radial * shell,
          sz: z * shell,
          tone: clamp(Math.round(Math.pow(luma, .85) * 47), 0, 47),
          size: .50 + Math.sqrt(luma) * .43,
          delay: hash(seed + 50) * .16
        });
      }
      particles.sort((a, b) => a.tone - b.tone);
      return { particles, aspect, detail: sample, gridWidth: grid.width, focus: source.focus || [.5, .33] };
    }

    _geometry(aspect, focus = this.photoFocus) {
      const w = this.width, h = this.height;
      // Frontal portraits fill the phone frame; the wide pose keeps both hands.
      const widthRatio = this.mobile ? (aspect > 1.4 ? .92 : 1.22) : .76;
      const ph = Math.min(
        h * (this.mobile ? .65 : .84),
        w * widthRatio / aspect,
        this.mobile ? Infinity : h * .28 / Math.max(.01, focus?.[1] ?? .33)
      );
      const pw = ph * aspect;
      const x0 = (w - pw) * .5;
      const portraitLift = h * (this.mobile ? .035 : .05);
      const y0 = (this.mobile
        ? h * .98 - ph
        : Math.min(h * .98 - ph, h * .42 - (focus?.[1] ?? .33) * ph)) - portraitLift;
      return { ph, pw, x0, y0 };
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
      ctx.fillStyle = this.backgroundGradient || '#020303';
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
            this.detail = this.transition.next.detail;
            this.gridWidth = this.transition.next.gridWidth;
            this.photoFocus = this.transition.next.focus;
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
      const { ph, pw, x0, y0 } = this._geometry(aspect);
      const radius = Math.min(w * .35, h * .36);
      const angle = time * .10;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      // A faint source layer protects delicate facial shadows without filling
      // the mosaic's gaps or turning the effect back into a solid photograph.
      const detailMix = smooth((progress - .42) / .58);
      if (this.detail && detailMix > 0) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalAlpha = detailMix * .20;
        ctx.drawImage(this.detail, x0 + px * 7, y0 + py * 5, pw, ph);
      }
      let lastTone = -1;
      const drawCount = this.particles.length;
      const pitch = pw / this.gridWidth;
      for (let i = 0; i < drawCount; i++) {
        const point = this.particles[i];
        const delay = this.formation === 'rise' ? (1 - point.v) * .18 : point.delay;
        const t = this.reducedMotion ? 1 : smooth(clamp((progress - delay * (1 - progress)) / (1 - delay)));
        const scatter = 1 - t;
        const rx = point.sx * cos + point.sz * sin;
        const rz = point.sz * cos - point.sx * sin;
        const perspective = 1 + rz * .16;
        let cloudX = w * .5 + rx * radius * perspective;
        let cloudY = h * .47 + point.sy * radius * perspective;
        if (this.formation === 'rise') {
          cloudX = x0 + point.u * pw + point.sx * radius * .45;
          cloudY = h * (1.05 + Math.abs(point.sy) * .20);
        } else if (this.formation === 'scatter') {
          const spiralAngle = Math.atan2(point.sy, point.sx) + scatter * 2.7;
          const spiralRadius = radius * (1.4 + Math.abs(point.sz));
          cloudX = w * .5 + Math.cos(spiralAngle) * spiralRadius;
          cloudY = h * .45 + Math.sin(spiralAngle) * spiralRadius;
        }
        const portraitX = x0 + point.u * pw + px * 7;
        const portraitY = y0 + point.v * ph + py * 5;
        const float = this.reducedMotion ? 0 : Math.sin(time * .7 + point.seed) * .10 * scatter;
        const x = cloudX * scatter + portraitX * t + float;
        const y = cloudY * scatter + portraitY * t;
        const tileSize = pitch * point.size;
        const size = (.75 + point.luma * .45) * scatter + tileSize * t;
        if (point.tone !== lastTone) { lastTone = point.tone; ctx.fillStyle = this.palette[lastTone]; }
        ctx.globalAlpha = point.alpha * (.54 + t * .40);
        ctx.fillRect(x - size * .5, y - size * .5, size, size);
      }
      ctx.globalAlpha = 1;
    }
  }
  window.PortraitParticles = PortraitParticles;
})();
