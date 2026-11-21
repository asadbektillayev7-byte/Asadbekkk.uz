/* Engine-sound research — animated figures for the Works page.
   Any <canvas data-rsx-scene="name"> is drawn by DRAW[name](g, t, W, H).
   The drawing space is always 480 wide; H follows the canvas's shape. These are
   illustrations of the planned method, not recorded data. */
(function () {
  const canvases = Array.from(document.querySelectorAll("canvas[data-rsx-scene]"));
  if (!canvases.length) return;

  /* Hide the write-up when a Works filter other than All/Research is chosen. */
  const section = document.getElementById("engine-audio");
  document.querySelectorAll("[data-project-filter]").forEach(btn => btn.addEventListener("click", () => {
    const f = btn.dataset.projectFilter;
    if (section) section.hidden = !(f === "all" || f === "research");
  }));

  const css = getComputedStyle(canvases[0]);
  const v = n => css.getPropertyValue("--rsx-" + n).trim();
  const C = { fg: v("fg"), dim: v("dim"), faint: v("faint"), line: v("line"), accent: v("accent"), warm: v("warm"), stage: v("stage"), card: v("card"), mono: v("mono") };

  const W = 480;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function txt(g, s, x, y, size, color, align, weight) { g.font = (weight || "") + " " + size + "px " + C.mono; g.fillStyle = color || C.dim; g.textAlign = align || "left"; g.textBaseline = "middle"; g.fillText(s, x, y); }
  function heat(k) {
    const stops = [[0, [11, 13, 13]], [0.35, [28, 39, 51]], [0.6, [61, 86, 117]], [0.82, [138, 166, 204]], [1, [229, 238, 251]]];
    k = clamp(k, 0, 1);
    for (let i = 1; i < stops.length; i++) if (k <= stops[i][0]) { const [p0, c0] = stops[i - 1], [p1, c1] = stops[i], f = (k - p0) / (p1 - p0); return "rgb(" + c0.map((c, j) => Math.round(lerp(c, c1[j], f))).join(",") + ")"; }
    return "rgb(229,238,251)";
  }

  /* Engine rhythm: decaying pulses every P units; in "fault" mode every 4th pulse is weak (a misfire). */
  function engine(x, scroll, P, fault) {
    let y = 0;
    const base = Math.floor((x + scroll) / P);
    for (let k = base - 1; k <= base; k++) {
      const d = x + scroll - k * P;
      if (d < 0 || d > P) continue;
      const amp = fault && ((k % 4) + 4) % 4 === 2 ? 0.12 : 1;
      y += amp * Math.exp(-d / (P * 0.24)) * Math.sin(d / (P * 0.042));
    }
    return y + 0.07 * Math.sin(x * 1.7 + scroll * 0.3) * Math.sin(x * 0.31);
  }
  function wave(g, x0, x1, cy, amp, scroll, P, fault, color, lw) {
    g.save(); g.beginPath(); g.rect(x0, cy - amp * 1.4, x1 - x0, amp * 2.8); g.clip();
    g.strokeStyle = color; g.lineWidth = lw || 1.5; g.beginPath();
    for (let x = x0; x <= x1; x += 1) { const y = cy - engine(x, scroll, P, fault) * amp; x === x0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke(); g.restore();
  }

  const DRAW = {
    /* FIG 01 — the same car before and after the repair */
    pair(g, t, w, H) {
      const x0 = 24, x1 = w - 24, P = 46, scroll = t * 38, amp = H * 0.085;
      const rows = [
        { label: "BEFORE REPAIR · MISFIRE", color: C.warm, ly: H * 0.19, cy: H * 0.35, fault: true },
        { label: "AFTER REPAIR · SAME CAR", color: C.accent, ly: H * 0.63, cy: H * 0.79, fault: false },
      ];
      rows.forEach(r => {
        txt(g, r.label, x0, r.ly, 11, r.color);
        g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, r.cy); g.lineTo(x1, r.cy); g.stroke();
        wave(g, x0, x1, r.cy, amp, scroll, P, r.fault, r.fault ? C.fg : C.accent, 1.5);
      });
      /* mark each missed beat on the top row */
      const first = Math.floor((x0 + scroll) / P) - 1;
      for (let k = first; k < first + Math.ceil((x1 - x0) / P) + 3; k++) {
        if (((k % 4) + 4) % 4 !== 2) continue;
        const xs = k * P - scroll;
        if (xs < x0 - 4 || xs + P * 0.75 > x1 + 4) continue;
        g.strokeStyle = C.warm; g.lineWidth = 1; g.setLineDash([3, 3]);
        rr(g, xs - 4, rows[0].cy - amp * 1.25, P * 0.75, amp * 2.5, 4); g.stroke(); g.setLineDash([]);
        txt(g, "missed beat", xs + P * 0.75 / 2 - 4, rows[0].cy + amp * 1.25 + 10, 9, C.warm, "center");
      }
      txt(g, "✓ diagnosed by a mechanic", x1, rows[1].ly, 10, C.dim, "right");
    },

    /* FIG 02 — the planned pipeline: mic → sound → spectrogram → features → classifier */
    pipeline(g, t, w, H) {
      const tall = H > w * 0.85;
      const stages = [
        ["MIC", "phone recording"], ["SOUND", "raw waveform"], ["SPECTROGRAM", "time × frequency"],
        ["FEATURES", "MFCC · wavelet"], ["CLASSIFIER", "not trained yet"],
      ];
      const boxes = [];
      if (!tall) {
        const pw = 78, gap = (w - 32 - pw * 5) / 4, top = H * 0.27, ph = H * 0.42;
        stages.forEach((s, i) => boxes.push({ x: 16 + i * (pw + gap), y: top, w: pw, h: ph, lx: 16 + i * (pw + gap) + pw / 2, ly: top + ph + 18, align: "center", s }));
      } else {
        const top = H * 0.1, rowH = (H * 0.86) / 5, pw = 220;
        stages.forEach((s, i) => boxes.push({ x: 24, y: top + i * rowH + 6, w: pw, h: rowH - 26, lx: 24 + pw + 22, ly: top + i * rowH + 6 + (rowH - 26) / 2, align: "left", s }));
      }
      const big = tall ? 15 : 10, small = tall ? 12 : 8;

      /* connectors with a travelling dot */
      for (let i = 0; i < 4; i++) {
        const a = boxes[i], b = boxes[i + 1];
        const [ax, ay, bx, by] = tall ? [a.x + a.w / 2, a.y + a.h, b.x + b.w / 2, b.y] : [a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2];
        g.strokeStyle = C.faint; g.lineWidth = 1; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
        const k = ((t * 0.9 - i * 0.25) % 1 + 1) % 1;
        g.fillStyle = C.accent; g.beginPath(); g.arc(lerp(ax, bx, k), lerp(ay, by, k), 2.2, 0, 7); g.fill();
      }

      boxes.forEach((b, i) => {
        rr(g, b.x, b.y, b.w, b.h, 6); g.fillStyle = C.card; g.fill(); g.strokeStyle = i === 4 ? C.warm : C.line; g.lineWidth = 1;
        if (i === 4) g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]);
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, m = 8;
        g.save(); rr(g, b.x + 1, b.y + 1, b.w - 2, b.h - 2, 5); g.clip();
        if (i === 0) {
          const s = Math.min(b.w, b.h) / 70;
          g.strokeStyle = C.fg; g.lineWidth = 1.5; rr(g, cx - 6 * s, cy - 16 * s, 12 * s, 22 * s, 6 * s); g.stroke();
          g.beginPath(); g.arc(cx, cy - 2 * s, 11 * s, 0.25, Math.PI - 0.25); g.stroke();
          g.beginPath(); g.moveTo(cx, cy + 9 * s); g.lineTo(cx, cy + 16 * s); g.stroke();
          for (let r = 0; r < 3; r++) { const k = ((t * 0.8 + r / 3) % 1); g.strokeStyle = "rgba(184,204,233," + (0.5 * (1 - k)).toFixed(3) + ")"; g.beginPath(); g.arc(cx, cy - 4 * s, (14 + k * 26) * s, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(cx, cy - 4 * s, (14 + k * 26) * s, Math.PI - 0.9, Math.PI + 0.9); g.stroke(); }
        } else if (i === 1) {
          wave(g, b.x + m, b.x + b.w - m, cy, b.h * 0.3, t * 30, Math.max(18, b.w / 4), true, C.fg, 1.3);
        } else if (i === 2) {
          const cols = tall ? 28 : 12, rows = tall ? 8 : 12, cw = (b.w - m * 2) / cols, ch = (b.h - m * 2) / rows, shift = t * 4;
          for (let c = 0; c < cols; c++) {
            const col = Math.floor(c + shift), missed = ((col % 4) + 4) % 4 === 2;
            for (let r = 0; r < rows; r++) {
              const f = 1 - r / rows;
              let e = 0.18 + 0.1 * Math.sin(col * 1.3 + r * 2.1);
              if (r === rows - 2 || r === rows - 4 || r === rows - 7) e += 0.55 * (missed ? 0.25 : 1);
              e += 0.15 * f * Math.sin(col * 0.7 + t);
              g.fillStyle = heat(e); g.fillRect(b.x + m + (c - (shift % 1)) * cw, b.y + m + r * ch, cw + 0.5, ch - 0.6);
            }
          }
        } else if (i === 3) {
          const n = 12, bw = (b.w - m * 2) / n;
          for (let k = 0; k < n; k++) {
            const val = clamp(0.25 + 0.45 * Math.abs(Math.sin(k * 1.9 + 0.6)) + 0.18 * Math.sin(t * 1.6 + k), 0.08, 0.95);
            const hgt = val * (b.h - m * 2);
            g.fillStyle = k % 3 === 0 ? C.accent : C.dim; rr(g, b.x + m + k * bw + bw * 0.18, b.y + b.h - m - hgt, bw * 0.64, hgt, 1.5); g.fill();
          }
        } else {
          const labels = ["healthy", "misfire", "belt", "knock"], rowH = (b.h - m * 2) / 4;
          labels.forEach((l, k) => {
            const y = b.y + m + k * rowH + rowH / 2;
            if (tall) txt(g, l, b.x + m + 4, y, 11, C.dim);
            g.strokeStyle = C.faint; g.setLineDash([2, 3]); rr(g, b.x + (tall ? 90 : m), y - rowH * 0.2, b.w - (tall ? 90 : m) - m, rowH * 0.4, 2); g.stroke(); g.setLineDash([]);
          });
          const a = 0.55 + 0.45 * Math.sin(t * 2.4);
          g.globalAlpha = a; txt(g, "?", tall ? b.x + 90 + (b.w - 98) / 2 : cx, cy, tall ? 26 : 22, C.warm, "center"); g.globalAlpha = 1;
        }
        g.restore();
        txt(g, b.s[0], b.lx, b.ly - (tall ? 9 : 0), big, i === 4 ? C.warm : C.fg, b.align);
        txt(g, b.s[1], b.lx, b.ly + (tall ? 11 : 14), small, i === 4 ? C.warm : C.dim, b.align);
      });
      txt(g, tall ? "PLANNED METHOD" : "PLANNED METHOD · NO RESULTS YET", w - 16, tall ? H * 0.045 : 26, 10, C.faint, "right");
    },
  };

  const scenes = canvases.map(canvas => ({ canvas, scene: canvas.dataset.rsxScene, visible: true }));
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size(s) {
    const r = s.canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    s.canvas.width = Math.max(1, Math.round(r.width * d)); s.canvas.height = Math.max(1, Math.round(r.height * d));
    s.scale = s.canvas.width / W; s.H = r.width ? (W * r.height) / r.width : 300;
  }
  function draw(s, t) {
    const g = s.canvas.getContext("2d"); if (!g || !DRAW[s.scene]) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, s.canvas.width, s.canvas.height);
    g.setTransform(s.scale, 0, 0, s.scale, 0, 0); g.lineCap = "round"; g.lineJoin = "round";
    try { DRAW[s.scene](g, t, W, s.H); } catch (e) {}
  }
  scenes.forEach(size);
  window.addEventListener("resize", () => { scenes.forEach(size); scenes.forEach(s => draw(s, 3)); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { const s = scenes.find(x => x.canvas === e.target); if (s) s.visible = e.isIntersecting; }), { rootMargin: "80px" });
    scenes.forEach(s => io.observe(s.canvas));
  }
  scenes.forEach(s => draw(s, 3));
  if (!reduce) {
    const start = performance.now(); let last = 0;
    (function loop(now) {
      if (now - last > 33) {
        last = now; const t = (now - start) / 1000;
        scenes.forEach(s => {
          if (!s.visible || s.canvas.closest("[hidden]")) return;
          const r = s.canvas.getBoundingClientRect();
          if (Math.abs(r.width * Math.min(window.devicePixelRatio || 1, 2) - s.canvas.width) > 2) size(s);
          draw(s, t);
        });
      }
      requestAnimationFrame(loop);
    })(start);
  }
})();
