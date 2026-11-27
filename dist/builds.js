/* 30 Days of Builds — card library for the Works page.

   ADDING A NEW DAY (two edits, both in this file):
   1. Add one line to PROJECTS:
        [day, "Name", "One-line description.", "group", "folder-name", "sceneKey"],
      group is one of: "body", "ai", "signals" (see GROUPS to add a new filter).
      folder-name is the day's folder in the GitHub repo.
   2. Add a drawing function to DRAW named sceneKey:
        sceneKey(g, t) { ... }   // g = canvas 2D context on a 320×200 stage, t = seconds
      Use the C.fg / C.dim / C.faint / C.line / C.accent / C.warm colors so it matches the theme.
   The progress bar and "/ 30 shipped" count update automatically. */
(function () {
  const REPO = "https://github.com/asadbektillayev7-byte/30daychallenge/tree/main/";
  const PROJECTS = [
    [1, "RockLook", "Look down and the music plays.", "body", "01-rocklook", "rocklook"],
    [2, "AirCanvas", "Pinch your fingers to draw in the air.", "body", "02-aircanvas", "aircanvas"],
    [3, "VolumeKnuckle", "A raised fist turns the volume up.", "body", "03-volumeknuckle", "knuckle"],
    [4, "BlinkLock", "Blinks and winks, detected live.", "body", "04-blinklock", "blink"],
    [5, "FaceEQ", "Turn your head to scrub a song.", "body", "05-faceeq", "faceeq"],
    [6, "BreathClock", "The microphone counts your breaths.", "body", "06-breathclock", "breath"],
    [7, "KeyboardOscilloscope", "Keys play tones and visible chords.", "body", "07-keyboardoscilloscope", "keys"],
    [8, "PocketAgent", "A local AI chat. No internet.", "ai", "08-pocketagent", "agent"],
    [9, "WhisperDesk", "Talk, and it types. Offline.", "ai", "09-whisperdesk", "whisper"],
    [10, "TerminalBrain", "Errors explained by a local AI.", "ai", "10-terminalbrain", "terminal"],
    [11, "MoodSynth", "Type a mood, hear it play.", "ai", "11-moodsynth", "mood"],
    [12, "SnapAnnotator", "Webcam snaps, AI labels what it sees.", "ai", "12-snapannotator", "snap"],
    [13, "DailyDebrief", "Git commits become a daily report.", "ai", "13-dailydebrief", "debrief"],
    [14, "RegisterBot", "A tiny CPU running inside Python.", "signals", "14-registerbot", "cpu"],
    [15, "AudioScope", "See sound as dancing frequencies.", "signals", "15-audioscope", "scope"],
    [16, "EchoKiller", "Add an echo, then filter it out.", "signals", "16-echokiller", "echo"],
    [17, "DutyGlow", "Slide a duty cycle, watch an LED dim.", "signals", "17-dutyglow", "pwm"],
    [18, "DepthPaint", "Webcam paints depth like a thermal camera.", "signals", "18-depthpaint", "depth"],
    [19, "BusTalk", "Watch chips talk over I2C.", "signals", "19-bustalk", "i2c"],
    [20, "SenseDeck", "Mic, camera, CPU and network, live.", "signals", "20-sensedeck", "sensedeck"],
    [21, "WaveCast", "A wave sent over UDP to a live scope.", "signals", "21-wavecast", "wavecast"],
    [22, "SketchNet", "Photo of a drawn circuit, solved by local AI.", "ai", "22-sketchnet", "sketchnet"],
    [23, "HueHunter", "Click a color, the webcam tracks it.", "body", "23-huehunter", "huehunter"],
    [24, "PinPoint", "Datasheet answers with the exact page.", "ai", "24-pinpoint", "pinpoint"],
    [25, "HexHound", "Sniffs out what hides in firmware bytes.", "signals", "25-hexhound", "hexhound"],
  ];
  const GROUPS = [["all", "All"], ["body", "Body"], ["ai", "Local AI"], ["signals", "Signals"]];
  const GH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

  const root = document.querySelector(".dob");
  if (!root) return;
  const grid = document.getElementById("dob-grid");
  const days = document.getElementById("dob-days");
  for (let i = 1; i <= 30; i++) { const d = document.createElement("i"); if (i <= PROJECTS.length) d.className = "on"; days.appendChild(d); }
  document.getElementById("dob-done").textContent = PROJECTS.length;
  const cardCount = document.getElementById("dob-card-count");
  if (cardCount) cardCount.textContent = PROJECTS.length + " / 30 built";
  /* On the Works page, show this section only for the All and Software filters. */
  document.querySelectorAll("[data-project-filter]").forEach(btn => btn.addEventListener("click", () => {
    const f = btn.dataset.projectFilter; root.hidden = !(f === "all" || f === "software");
  }));

  const chips = document.getElementById("dob-chips");
  if (chips) GROUPS.forEach(([key, label]) => {
    const count = key === "all" ? PROJECTS.length : PROJECTS.filter(p => p[3] === key).length;
    const b = document.createElement("button");
    b.type = "button"; b.className = "dob-chip"; b.dataset.group = key;
    b.setAttribute("aria-pressed", key === "all" ? "true" : "false");
    b.innerHTML = label + "<span>" + count + "</span>";
    b.addEventListener("click", () => {
      chips.querySelectorAll(".dob-chip").forEach(c => c.setAttribute("aria-pressed", String(c === b)));
      grid.querySelectorAll(".dob-card").forEach(card => { card.hidden = key !== "all" && card.dataset.group !== key; });
    });
    chips.appendChild(b);
  });

  const scenes = [];
  PROJECTS.forEach(([n, name, line, group, folder, scene]) => {
    const a = document.createElement("a");
    a.className = "dob-card"; a.href = REPO + folder; a.target = "_blank"; a.rel = "noopener"; a.dataset.group = group;
    a.setAttribute("aria-label", "Day " + n + ": " + name + ". " + line + " Open on GitHub.");
    const dd = String(n).padStart(2, "0");
    a.innerHTML =
      '<div class="dob-stage"><canvas aria-hidden="true"></canvas><span class="dob-day">D·' + dd + '</span><span class="dob-repo">' + GH + '</span></div>' +
      '<div class="dob-info"><h3 class="dob-name">' + name + '</h3><p class="dob-line">' + line + '</p></div>';
    grid.appendChild(a);
    scenes.push({ canvas: a.querySelector("canvas"), scene, visible: true, seed: n });
  });

  let C = {};
  function readColors() {
    const s = getComputedStyle(root);
    C = { fg: s.getPropertyValue("--dob-fg").trim(), dim: s.getPropertyValue("--dob-dim").trim(), faint: s.getPropertyValue("--dob-faint").trim(),
      line: s.getPropertyValue("--dob-line").trim(), accent: s.getPropertyValue("--dob-accent").trim(), warm: s.getPropertyValue("--dob-warm").trim(),
      stage: s.getPropertyValue("--dob-stage").trim(), mono: s.getPropertyValue("--dob-mono").trim() };
  }
  readColors();
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", readColors);
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const W = 320, H = 200;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function txt(g, s, x, y, size, color, align) { g.font = (size || 10) + "px " + C.mono; g.fillStyle = color || C.dim; g.textAlign = align || "left"; g.textBaseline = "middle"; g.fillText(s, x, y); }
  function bars(g, x, y, w, h, n, f, color) { const bw = w / n; g.fillStyle = color || C.fg; for (let i = 0; i < n; i++) { const v = clamp(f(i), 0.04, 1); rr(g, x + i * bw + bw * 0.2, y + h - v * h, bw * 0.6, v * h, 1.5); g.fill(); } }
  function thermal(v) {
    const stops = [[0, [20, 30, 110]], [0.3, [0, 140, 230]], [0.5, [40, 200, 140]], [0.66, [240, 220, 40]], [0.82, [245, 120, 20]], [1, [230, 30, 80]]];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const [p0, c0] = stops[i - 1], [p1, c1] = stops[i], k = (v - p0) / (p1 - p0); return "rgb(" + c0.map((c, j) => Math.round(lerp(c, c1[j], k))).join(",") + ")"; }
    return "rgb(230,30,80)";
  }

  const DRAW = {
    rocklook(g, t) {
      const tilt = Math.sin(t * 1.4) * 0.45, playing = tilt > 0.08;
      g.save(); g.translate(92, 108); g.rotate(tilt * 0.6);
      g.strokeStyle = C.fg; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 34, 0, Math.PI * 2); g.stroke();
      g.fillStyle = C.fg; g.beginPath(); g.arc(-11, 4 + tilt * 14, 2.6, 0, 7); g.arc(11, 4 + tilt * 14, 2.6, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = C.faint; g.setLineDash([3, 4]); g.beginPath(); g.arc(92, 108, 50, -2.6, -0.5); g.stroke(); g.setLineDash([]);
      bars(g, 160, 70, 140, 76, 14, i => playing ? 0.35 + 0.6 * Math.abs(Math.sin(t * 6 + i * 1.7) * Math.cos(t * 2.3 + i)) : 0.05);
      txt(g, playing ? "▶ PLAYING" : "❚❚ PAUSED", 160, 164, 10, playing ? C.accent : C.dim);
    },
    aircanvas(g, t) {
      const p = (t % 6) / 4.6, pts = [];
      for (let i = 0; i <= 120; i++) { const u = i / 120; pts.push([40 + u * 240, 115 + Math.sin(u * 7.5) * 34 * Math.sin(u * 3.1) - u * 20]); }
      const end = Math.floor(clamp(p, 0, 1) * 120);
      g.strokeStyle = C.line; g.setLineDash([2, 6]); g.strokeRect(24, 48, 272, 132); g.setLineDash([]);
      g.strokeStyle = C.fg; g.lineWidth = 2; g.lineCap = "round"; g.beginPath(); pts.slice(0, end + 1).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
      const [px, py] = pts[end], pinch = 6 + Math.sin(t * 5) * 2;
      g.strokeStyle = C.accent; g.lineWidth = 1.5; g.beginPath(); g.arc(px, py, 9, 0, 7); g.stroke();
      g.fillStyle = C.accent; g.beginPath(); g.arc(px - pinch, py - 14, 3, 0, 7); g.arc(px + pinch, py - 14, 3, 0, 7); g.fill();
    },
    knuckle(g, t) {
      const lv = (Math.sin(t * 1.1) + 1) / 2, y = 130 - lv * 60;
      g.strokeStyle = C.fg; g.lineWidth = 1.6; rr(g, 40, y, 54, 34, 12); g.stroke();
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(50 + i * 11, y, 5.5, Math.PI, 0); g.stroke(); }
      g.strokeStyle = C.faint; g.beginPath(); g.moveTo(67, 64); g.lineTo(67, 176); g.stroke();
      rr(g, 120, 100, 170, 14, 7); g.fillStyle = C.line; g.fill();
      rr(g, 120, 100, 170 * lv, 14, 7); g.fillStyle = C.fg; g.fill();
      txt(g, String(Math.round(lv * 100)), 290, 146, 30, C.fg, "right");
      txt(g, "VOLUME", 120, 84, 10);
    },
    blink(g, t) {
      const c = t % 4, blinks = [0.4, 0.8, 1.2];
      let lid = 0; blinks.forEach(b => { const d = Math.abs(c - b); if (d < 0.12) lid = 1 - d / 0.12; });
      const count = blinks.filter(b => c > b).length, open = c > 1.4 && c < 3.6;
      g.save(); g.translate(98, 110);
      g.strokeStyle = C.fg; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-56, 0); g.quadraticCurveTo(0, -40 * (1 - lid), 56, 0); g.quadraticCurveTo(0, 40 * (1 - lid), -56, 0); g.stroke();
      if (lid < 0.7) { g.beginPath(); g.arc(0, 0, 14 * (1 - lid), 0, 7); g.stroke(); g.fillStyle = C.fg; g.beginPath(); g.arc(0, 0, 5 * (1 - lid), 0, 7); g.fill(); }
      g.restore();
      g.strokeStyle = open ? C.accent : C.fg; g.lineWidth = 2;
      g.beginPath(); g.arc(240, open ? 84 : 92, 16, Math.PI, 0); g.lineTo(256, open ? 90 : 104); g.stroke();
      rr(g, 218, 102, 44, 40, 5); g.stroke();
      g.fillStyle = open ? C.accent : C.fg; g.beginPath(); g.arc(240, 118, 4, 0, 7); g.fill(); g.fillRect(238.5, 118, 3, 12);
      for (let i = 0; i < 3; i++) { g.fillStyle = i < count ? C.fg : C.line; g.beginPath(); g.arc(60 + i * 12, 172, 4, 0, 7); g.fill(); }
      txt(g, count + " / 3", 104, 172, 10);
    },
    faceeq(g, t) {
      const a = Math.sin(t * 0.9) * 0.9;
      g.strokeStyle = C.line; g.lineWidth = 1.2; g.beginPath(); g.arc(84, 112, 46, 0, 7); g.stroke();
      g.strokeStyle = C.fg; g.lineWidth = 2; g.beginPath(); g.moveTo(84, 112); g.lineTo(84 + Math.sin(a) * 42, 112 - Math.cos(a) * 42); g.stroke();
      g.fillStyle = C.fg; g.beginPath(); g.arc(84, 112, 4, 0, 7); g.fill();
      const pos = (t * 0.08) % 1;
      g.fillStyle = C.line; g.fillRect(160, 82, 130, 3); g.fillStyle = C.fg; g.fillRect(160, 82, 130 * pos, 3); g.fillRect(158 + 130 * pos, 74, 3, 19);
      txt(g, "0" + Math.floor(pos * 4) + ":" + String(Math.floor(pos * 240) % 60).padStart(2, "0"), 160, 64, 10);
      rr(g, 160, 110, 130, 56, 6); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
      const py = 138 - a * 22; g.fillStyle = C.fg; rr(g, 221, py - 13, 8, 26, 2); g.fill();
      txt(g, "PITCH", 168, 124, 9);
    },
    breath(g, t) {
      g.strokeStyle = C.fg; g.lineWidth = 1.6; rr(g, 40, 82, 22, 38, 11); g.stroke();
      g.beginPath(); g.arc(51, 112, 18, 0.2, Math.PI - 0.2); g.stroke(); g.beginPath(); g.moveTo(51, 130); g.lineTo(51, 142); g.stroke();
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.arc(51, 106, 34, 0, 7); g.stroke();
      g.strokeStyle = C.fg; g.lineWidth = 2; g.beginPath();
      for (let x = 100; x <= 236; x += 2) { const y = 106 + Math.sin((x - 100) / 22 - t * 2) * 26; x === 100 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      txt(g, String(14 + Math.round(Math.sin(t * 0.3))), 296, 104, 36, C.fg, "right"); txt(g, "BPM", 296, 132, 10, C.dim, "right");
    },
    keys(g, t) {
      const chords = [[0], [0, 2], [1, 3], [0, 1, 2], [3]], on = chords[Math.floor(t / 0.9) % chords.length], hz = [261, 329, 392, 523], k = "QWER";
      for (let i = 0; i < 4; i++) {
        const y = 52 + i * 34, act = on.includes(i);
        rr(g, 28, y, 104, 26, 4); g.fillStyle = act ? C.fg : "transparent"; g.fill(); g.strokeStyle = act ? C.fg : C.line; g.lineWidth = 1; g.stroke();
        txt(g, k[i], 38, y + 13, 11, act ? C.stage : C.dim); txt(g, hz[i] + " Hz", 124, y + 13, 9, act ? C.stage : C.dim, "right");
      }
      g.strokeStyle = C.fg; g.lineWidth = 1.6; g.beginPath();
      for (let x = 150; x <= 300; x += 1.5) { let y = 0; on.forEach(i => { y += Math.sin((x - 150) * hz[i] / 2600 + t * 4); }); y = 112 - y * 30 / Math.max(1, on.length * 0.75); x === 150 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    },
    agent(g, t) {
      rr(g, 24, 46, 272, 136, 8); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
      [C.warm, C.faint, C.accent].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(38 + i * 10, 58, 3, 0, 7); g.fill(); });
      txt(g, "pocketagent · offline", 284, 58, 9, C.dim, "right");
      const lines = [["~/agent $ ./pa --local", C.accent], ["> what's a closure?", C.fg], ["A closure keeps the variables", C.dim], ["from where a function was made.", C.dim]];
      let chars = Math.floor((t % 8) * 22);
      lines.forEach(([s, c], i) => { const shown = s.slice(0, clamp(chars, 0, s.length)); chars -= s.length; if (shown) txt(g, shown, 36, 84 + i * 20, 10, c); });
      if (Math.floor(t * 2) % 2) { g.fillStyle = C.fg; g.fillRect(36, 160, 7, 12); }
    },
    whisper(g, t) {
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.arc(70, 92, 34, 0, 7); g.stroke();
      g.strokeStyle = C.fg; g.lineWidth = 1.6; rr(g, 62, 74, 16, 28, 8); g.stroke(); g.beginPath(); g.arc(70, 96, 13, 0.2, Math.PI - 0.2); g.stroke();
      bars(g, 120, 62, 176, 56, 22, i => 0.15 + 0.85 * Math.abs(Math.sin(t * 5 + i * 0.9) * Math.sin(i * 0.4 + t)));
      rr(g, 24, 140, 272, 40, 6); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
      const s = "Take notes for the standup at three"; txt(g, s.slice(0, Math.floor((t % 6) * 9)), 36, 160, 10, C.fg);
    },
    terminal(g, t) {
      rr(g, 24, 40, 272, 144, 8); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
      const c = t % 6;
      txt(g, "$ python train.py", 36, 62, 10, C.fg);
      if (c > 0.6) { txt(g, "Traceback (most recent call last):", 36, 80, 9, C.dim); txt(g, "ModuleNotFoundError: numpy", 36, 96, 9, C.dim); }
      if (c > 1.2) { g.fillStyle = "rgba(230,90,90,0.85)"; rr(g, 36, 108, 220 * clamp((c - 1.2) * 2, 0, 1), 8, 2); g.fill(); }
      if (c > 2.4) txt(g, "AI: install it with", 36, 134, 10, C.accent);
      if (c > 3) txt(g, "uv pip install numpy", 36, 152, 10, C.fg);
      if (c > 3.6) txt(g, "✓ fixed", 36, 170, 10, C.accent);
    },
    mood(g, t) {
      const moods = ["nocturnal", "sunrise", "storm", "rainy cafe"], m = moods[Math.floor(t / 3) % moods.length];
      rr(g, 24, 42, 272, 34, 6); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
      g.font = "600 17px " + getComputedStyle(root).getPropertyValue("--dob-display"); g.fillStyle = C.fg; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(m, 36, 60);
      [[C.fg, 22, 0.9, 1], [C.dim, 14, 1.7, 0.6], [C.faint, 9, 2.6, 0.3]].forEach(([c, amp, f, sp]) => {
        g.strokeStyle = c; g.lineWidth = 1.5; g.beginPath();
        for (let x = 24; x <= 296; x += 2) { const y = 132 + Math.sin(x / 30 * f + t * sp) * amp * (0.7 + 0.3 * Math.sin(t * 0.5)); x === 24 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      });
    },
    snap(g, t) {
      const c = t % 5, flash = c < 0.15;
      g.strokeStyle = C.line; g.setLineDash([2, 5]); g.strokeRect(20, 40, 280, 146); g.setLineDash([]);
      g.fillStyle = C.faint; rr(g, 52, 120, 64, 34, 17); g.fill(); rr(g, 140, 66, 52, 104, 6); g.fill(); g.beginPath(); g.arc(246, 112, 34, 0, 7); g.fill();
      [[46, 114, 76, 46, "cup 81%", 0.5], [134, 60, 64, 116, "phone 93%", 1], [206, 72, 80, 80, "ball 88%", 1.5]].forEach(([x, y, w, h, l, at]) => {
        if (c > at) { g.strokeStyle = C.accent; g.lineWidth = 1.5; g.strokeRect(x, y, w, h); g.fillStyle = C.accent; g.fillRect(x, y - 13, l.length * 6.4 + 8, 13); txt(g, l, x + 4, y - 6.5, 9, C.stage); }
      });
      if (flash) { g.fillStyle = C.fg; g.globalAlpha = 0.35; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    },
    debrief(g, t) {
      const n = Math.floor((t % 6) * 2) + 1;
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(28, 82); g.lineTo(292, 82); g.stroke();
      for (let i = 0; i < Math.min(n, 9); i++) { g.fillStyle = i === Math.min(n, 9) - 1 ? C.accent : C.fg; g.beginPath(); g.arc(40 + i * 30, 82, 5, 0, 7); g.fill(); }
      txt(g, "COMMITS", 28, 60, 9); txt(g, String(Math.min(n, 9)), 292, 60, 12, C.fg, "right");
      [["BUILT", 0.85], ["NEXT", 0.55], ["ONE-LINER", 0.7]].forEach(([l, w], i) => {
        const y = 112 + i * 24; txt(g, l, 28, y, 9);
        g.fillStyle = C.line; rr(g, 104, y - 4, 188, 8, 4); g.fill();
        g.fillStyle = C.dim; rr(g, 104, y - 4, 188 * w * clamp((t % 6) / 4, 0, 1), 8, 4); g.fill();
      });
    },
    cpu(g, t) {
      const step = Math.floor(t / 0.7) % 8, fact = [1, 5, 20, 60, 120, 120, 120, 120], cnt = [5, 4, 3, 2, 1, 0, 0, 0];
      const regs = [["R0", cnt[step]], ["R1", fact[step]], ["PC", 2 + (step % 5)], ["ACC", fact[step]]];
      regs.forEach(([n, v], i) => {
        const x = 24 + (i % 2) * 104, y = 52 + Math.floor(i / 2) * 36, hot = (i === 1 || i === 0) && Math.floor(t / 0.7) !== Math.floor((t - 0.2) / 0.7);
        rr(g, x, y, 96, 28, 4); g.strokeStyle = hot ? C.accent : C.line; g.lineWidth = 1; g.stroke();
        txt(g, n, x + 8, y + 14, 9); txt(g, "0x" + v.toString(16).toUpperCase().padStart(4, "0"), x + 88, y + 14, 10, C.fg, "right");
      });
      g.strokeStyle = C.fg; g.lineWidth = 1.4; g.beginPath(); g.moveTo(244, 62); g.lineTo(288, 62); g.lineTo(300, 82); g.lineTo(288, 102); g.lineTo(244, 102); g.lineTo(254, 82); g.closePath(); g.stroke();
      txt(g, "ALU", 272, 82, 10, C.fg, "center");
      g.strokeStyle = C.faint; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(224, 66); g.lineTo(250, 76); g.moveTo(224, 102); g.lineTo(250, 88); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < 16; i++) { const x = 24 + (i % 8) * 34, y = 140 + Math.floor(i / 8) * 22, on = i === step + 2; rr(g, x, y, 28, 16, 3); g.strokeStyle = on ? C.fg : C.line; g.stroke(); txt(g, ((i * 37 + 11) % 256).toString(16).toUpperCase().padStart(2, "0"), x + 14, y + 8, 8, on ? C.fg : C.dim, "center"); }
    },
    scope(g, t) {
      const n = 30;
      bars(g, 20, 40, 280, 136, n, i => { const f = i / n; return 0.15 + 0.55 * Math.exp(-((f - 0.22) ** 2) / 0.01) * (0.8 + 0.2 * Math.sin(t * 3)) + 0.5 * Math.exp(-((f - 0.55) ** 2) / 0.012) * (0.7 + 0.3 * Math.sin(t * 2.2 + 1)) + 0.08 * Math.sin(t * 9 + i * 2); });
      ["20 Hz", "200", "2k", "20k"].forEach((l, i) => txt(g, l, 20 + i * 93, 188, 8, C.faint));
    },
    echo(g, t) {
      g.strokeStyle = C.dim; g.lineWidth = 1.5; g.beginPath();
      for (let x = 20; x <= 300; x += 1.5) { let y = 0; for (let e = 0; e < 4; e++) y += Math.pow(0.55, e) * Math.sin((x - 20 - e * 52) / 9 - t * 2) * Math.exp(-(((x - 20 - e * 52 - ((t * 40) % 60)) / 22) ** 2)); y = 64 - y * 22; x === 20 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      rr(g, 120, 92, 80, 22, 4); g.strokeStyle = C.fg; g.lineWidth = 1; g.stroke(); txt(g, "FIR FILTER", 160, 103, 9, C.fg, "center");
      g.beginPath(); g.moveTo(160, 116); g.lineTo(160, 126); g.moveTo(156, 122); g.lineTo(160, 126); g.lineTo(164, 122); g.stroke();
      g.strokeStyle = C.accent; g.lineWidth = 1.8; g.beginPath();
      for (let x = 20; x <= 300; x += 1.5) { const y = 156 - 22 * Math.sin((x - 20) / 9 - t * 2) * Math.exp(-(((x - 20 - ((t * 40) % 60)) / 22) ** 2)); x === 20 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      txt(g, "IN · echo", 20, 36, 9); txt(g, "OUT · clean", 20, 184, 9, C.accent);
    },
    pwm(g, t) {
      const duty = 0.08 + 0.84 * (Math.sin(t * 0.8) + 1) / 2;
      g.fillStyle = C.line; rr(g, 24, 58, 150, 4, 2); g.fill(); g.fillStyle = C.accent; rr(g, 24, 58, 150 * duty, 4, 2); g.fill();
      g.fillStyle = C.fg; g.beginPath(); g.arc(24 + 150 * duty, 60, 7, 0, 7); g.fill();
      txt(g, Math.round(duty * 100) + "%", 24, 40, 11, C.fg);
      g.save(); g.globalAlpha = 0.15 + 0.85 * duty; g.fillStyle = C.warm; g.beginPath(); g.arc(256, 70, 26, 0, 7); g.fill(); g.restore();
      g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.arc(256, 70, 30, 0, 7); g.stroke();
      g.strokeStyle = C.dim; g.beginPath(); g.moveTo(248, 100); g.lineTo(248, 120); g.moveTo(264, 100); g.lineTo(264, 116); g.stroke();
      g.strokeStyle = C.fg; g.lineWidth = 1.6; g.beginPath(); const per = 34, top = 140, bot = 174; g.moveTo(20, bot);
      for (let x0 = 20; x0 < 300; x0 += per) { g.lineTo(x0, bot); g.lineTo(x0, top); g.lineTo(Math.min(x0 + per * duty, 300), top); g.lineTo(Math.min(x0 + per * duty, 300), bot); }
      g.lineTo(300, bot); g.stroke();
      g.strokeStyle = C.accent; g.setLineDash([5, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(20, bot - (bot - top) * duty); g.lineTo(300, bot - (bot - top) * duty); g.stroke(); g.setLineDash([]);
    },
    depth(g, t) {
      const cols = 14, rows = 10, cw = 136 / cols, ch = 132 / rows, pulse = 0.12 * Math.sin(t * 1.5);
      g.fillStyle = C.faint; rr(g, 30, 64, 28, 94, 5); g.fill(); g.beginPath(); g.ellipse(88, 112, 22, 32, 0, 0, 7); g.fill(); rr(g, 118, 82, 18, 72, 4); g.fill();
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = c / cols, y = r / rows;
        let v = 0.15 + 0.25 * y;
        if (Math.abs(x - 0.48) / 0.16 + Math.abs(y - 0.5) / 0.38 < 1) v = 0.86 + pulse;
        else if (x < 0.22 && y > 0.12 && y < 0.82) v = 0.55;
        else if (x > 0.78 && y > 0.22 && y < 0.78) v = 0.42;
        g.fillStyle = thermal(clamp(v + 0.05 * Math.sin(t * 2 + c * 0.7 + r), 0, 1)); g.fillRect(164 + c * cw, 46 + r * ch, cw - 1, ch - 1);
      }
      const grad = g.createLinearGradient(164, 0, 300, 0); [0, 0.3, 0.5, 0.66, 0.82, 1].forEach(s => grad.addColorStop(s, thermal(1 - s)));
      g.fillStyle = grad; g.fillRect(164, 184, 136, 4); txt(g, "NEAR", 164, 194, 7, C.faint); txt(g, "FAR", 300, 194, 7, C.faint, "right");
    },
    i2c(g, t) {
      const chip = (x, label, sub) => { rr(g, x, 46, 74, 54, 6); g.strokeStyle = C.fg; g.lineWidth = 1.3; g.stroke(); txt(g, label, x + 37, 68, 9, C.fg, "center"); txt(g, sub, x + 37, 84, 8, C.dim, "center");
        for (let i = 0; i < 4; i++) { g.fillStyle = C.dim; g.fillRect(x - 5, 52 + i * 12, 5, 3); g.fillRect(x + 74, 52 + i * 12, 5, 3); } };
      chip(20, "MASTER", "MCU"); chip(226, "SLAVE", "0x68");
      g.strokeStyle = C.fg; g.lineWidth = 1.3; g.beginPath(); g.moveTo(99, 60); g.lineTo(221, 60); g.stroke();
      g.strokeStyle = C.dim; g.setLineDash([3, 3]); g.lineDashOffset = -t * 20; g.beginPath(); g.moveTo(99, 86); g.lineTo(221, 86); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
      const c = t % 4.5, seq = [["START", "M"], ["0x68", "M"], ["ACK", "S"], ["0xA5", "M"], ["ACK", "S"], ["STOP", "M"]], idx = Math.min(5, Math.floor(c / 0.75)), k = (c % 0.75) / 0.75;
      const [label, who] = seq[idx], x = who === "M" ? lerp(104, 182, k) : lerp(182, 104, k);
      g.fillStyle = who === "M" ? C.accent : C.warm; rr(g, x, 53, 36, 14, 3); g.fill(); txt(g, label, x + 18, 60, 8, C.stage, "center");
      txt(g, "LOG", 24, 124, 8, C.faint);
      const log = ["START · 0x68 · WRITE", "0xA5 · ACK", "STOP"], shown = idx >= 5 ? 3 : idx >= 3 ? 2 : idx >= 1 ? 1 : 0;
      for (let i = 0; i < shown; i++) txt(g, ">  " + log[i], 24, 144 + i * 16, 9, C.fg);
    },
    sensedeck(g, t) {
      const panels = [["MIC", 100, v => 18 + 14 * Math.abs(Math.sin(v * 2.1)) + (((v % 5) > 3.6 && (v % 5) < 4.1) ? 62 : 0)],
        ["CAM", 255, v => 150 + 40 * Math.sin(v * 0.7)], ["CPU %", 100, v => 34 + 20 * Math.sin(v * 0.9) + 8 * Math.sin(v * 3.3)], ["NET kB/s", 900, v => 300 + 260 * Math.abs(Math.sin(v * 0.5))]];
      panels.forEach(([label, max, f], i) => {
        const x = 20 + (i % 2) * 144, y = 38 + Math.floor(i / 2) * 78, now = f(t), hot = i === 0 && now > 70;
        rr(g, x, y, 136, 70, 6); g.strokeStyle = hot ? "rgba(230,90,90,0.9)" : C.line; g.lineWidth = 1; g.stroke();
        txt(g, label, x + 8, y + 12, 8, C.faint); txt(g, String(Math.round(now)), x + 128, y + 14, 14, hot ? "rgba(230,90,90,0.95)" : C.fg, "right");
        g.strokeStyle = i === 0 ? C.accent : C.dim; g.lineWidth = 1.2; g.beginPath();
        for (let k = 0; k <= 40; k++) { const v = f(t - (40 - k) * 0.1), px = x + 8 + k * 3, py = y + 62 - clamp(v / max, 0, 1) * 34; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
      });
      if ((t % 2) < 1) { g.fillStyle = "rgba(230,90,90,0.9)"; g.beginPath(); g.arc(24, 194, 3, 0, 7); g.fill(); } txt(g, "REC · log.csv", 32, 194, 8, C.dim);
    },
    wavecast(g, t) {
      rr(g, 20, 70, 60, 46, 6); g.strokeStyle = C.fg; g.lineWidth = 1.3; g.stroke(); txt(g, "SENDER", 50, 86, 8, C.fg, "center");
      g.strokeStyle = C.dim; g.lineWidth = 1.2; g.beginPath(); for (let x = 30; x <= 70; x++) { const y = 102 + Math.sin((x - 30) / 6.4 + t * 3) * 6; x === 30 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      g.strokeStyle = C.faint; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(84, 93); g.lineTo(156, 93); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < 4; i++) { const k = ((t * 0.9 + i / 4) % 1), lost = i === 2 && (Math.floor(t * 0.9) % 3 === 0);
        if (lost && k > 0.5) continue; g.fillStyle = lost ? "rgba(230,90,90,0.85)" : C.accent; rr(g, 84 + k * 64, 87, 9, 12, 2); g.fill(); }
      txt(g, "UDP", 120, 76, 8, C.faint, "center");
      const sx = 164, sy = 40, sw = 136, sh = 106;
      g.strokeStyle = C.line; g.lineWidth = 1; rr(g, sx, sy, sw, sh, 6); g.stroke();
      for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(sx + i * sw / 6, sy); g.lineTo(sx + i * sw / 6, sy + sh); g.stroke(); }
      for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(sx, sy + i * sh / 4); g.lineTo(sx + sw, sy + i * sh / 4); g.stroke(); }
      g.strokeStyle = C.accent; g.lineWidth = 1.6; g.beginPath();
      for (let x = 0; x <= sw; x += 1.5) { const y = sy + sh / 2 + Math.sin(x / 11 - t * 3) * 30; x ? g.lineTo(sx + x, y) : g.moveTo(sx + x, y); } g.stroke();
      txt(g, "SCOPE", sx, 160, 8, C.faint); txt(g, "LOST " + (Math.floor(t * 0.3) % 4) + "  ·  DELAY " + (12 + Math.round(3 * Math.sin(t))) + " ms", sx + sw, 160, 8, C.fg, "right");
    },
    sketchnet(g, t) {
      const c = t % 6, wob = (x, y, i) => [x + Math.sin(i * 1.7) * 2.2, y + Math.cos(i * 2.3) * 2.2];
      g.strokeStyle = C.dim; g.lineWidth = 1.5; g.beginPath();
      [[30, 60], [120, 58], [122, 150], [28, 152], [30, 60]].forEach(([x, y], i) => { const [a, b] = wob(x, y, i); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke();
      g.fillStyle = C.stage; g.fillRect(20, 92, 22, 26); g.fillRect(64, 50, 34, 18); g.fillRect(112, 92, 22, 26);
      g.strokeStyle = C.dim; g.beginPath(); g.moveTo(22, 100); g.lineTo(38, 99); g.moveTo(25, 108); g.lineTo(35, 108); g.stroke();
      g.beginPath(); g.moveTo(64, 59); for (let i = 0; i < 6; i++) g.lineTo(68 + i * 5.5, i % 2 ? 53 : 65); g.lineTo(98, 59); g.stroke();
      g.beginPath(); g.moveTo(114, 96); g.lineTo(130, 96); g.lineTo(122, 110); g.closePath(); g.moveTo(114, 111); g.lineTo(130, 111); g.stroke();
      txt(g, "10V", 14, 120, 8, C.dim); txt(g, "220", 81, 44, 8, C.dim, "center");
      const k = clamp((c - 0.8) / 1.2, 0, 1);
      g.strokeStyle = C.faint; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(146, 104); g.lineTo(146 + 26 * k, 104); g.stroke(); g.setLineDash([]);
      if (k > 0.95) txt(g, "AI", 158, 94, 8, C.accent, "center");
      if (c > 2) {
        g.strokeStyle = C.fg; g.lineWidth = 1.4; g.strokeRect(190, 58, 100, 92);
        g.fillStyle = C.stage; g.fillRect(184, 92, 14, 24); g.fillRect(226, 52, 30, 12); g.fillRect(284, 92, 14, 24);
        g.strokeStyle = C.fg; g.beginPath(); g.moveTo(183, 100); g.lineTo(197, 100); g.moveTo(186, 108); g.lineTo(194, 108); g.stroke();
        rr(g, 226, 53, 30, 10, 2); g.stroke();
        g.beginPath(); g.moveTo(284, 97); g.lineTo(296, 97); g.lineTo(290, 108); g.closePath(); g.moveTo(284, 110); g.lineTo(296, 110); g.stroke();
      }
      if (c > 2.8) { const d = ((t * 40) % 384); const p = d < 100 ? [190 + d, 58] : d < 192 ? [290, 58 + d - 100] : d < 292 ? [290 - (d - 192), 150] : [190, 150 - (d - 292)];
        g.fillStyle = C.accent; g.beginPath(); g.arc(p[0], p[1], 2.6, 0, 7); g.fill(); txt(g, "34.8 mA", 240, 166, 10, C.fg, "center"); }
      if (c > 3.6) txt(g, "⚠ LED gets too much current", 240, 184, 8, C.warm, "center");
    },
    huehunter(g, t) {
      g.strokeStyle = C.line; g.setLineDash([2, 5]); g.strokeRect(20, 36, 280, 140); g.setLineDash([]);
      g.strokeStyle = C.faint; g.lineWidth = 1; g.beginPath(); g.moveTo(150, 111); g.lineTo(170, 111); g.moveTo(160, 101); g.lineTo(160, 121); g.stroke();
      g.fillStyle = C.faint; rr(g, 186, 92, 40, 60, 4); g.fill();
      const pos = s => [160 + Math.cos(s * 0.9) * 100, 106 + Math.sin(s * 1.8) * 42];
      const [bx, by] = pos(t), hidden = bx > 182 && bx < 230 && by > 88 && by < 156;
      g.fillStyle = C.dim; for (let i = 1; i < 26; i++) { const [x, y] = pos(t - i * 0.06); g.globalAlpha = 1 - i / 26; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); } g.globalAlpha = 1;
      if (!hidden) { g.fillStyle = C.warm; g.beginPath(); g.arc(bx, by, 11, 0, 7); g.fill(); }
      g.strokeStyle = hidden ? C.dim : C.accent; g.lineWidth = 1.4; if (hidden) g.setLineDash([3, 3]); g.strokeRect(bx - 16, by - 16, 32, 32); g.setLineDash([]);
      txt(g, hidden ? "predicted" : (90 + Math.round(6 * Math.abs(Math.sin(t)))) + "%", bx - 16, by - 22, 8, hidden ? C.dim : C.accent);
      const dx = bx - 160, dy = by - 111, steer = (Math.abs(dx) < 18 && Math.abs(dy) < 14) ? "CENTERED" : [dx < -18 ? "LEFT" : dx > 18 ? "RIGHT" : "", dy < -14 ? "UP" : dy > 14 ? "DOWN" : ""].filter(Boolean).join(" ");
      txt(g, "STEER · " + steer, 20, 188, 8, C.fg);
    },
    pinpoint(g, t) {
      const c = t % 7, q = "What's the max GPIO current?";
      rr(g, 64, 38, 236, 24, 5); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
      txt(g, "ask ›", 72, 50, 9, C.accent); txt(g, q.slice(0, Math.floor(clamp(c, 0, 1.6) / 1.6 * q.length)), 102, 50, 8.5, C.fg);
      if (c > 1.8) { txt(g, "BM25 · best 4 of 8 passages", 20, 78, 8, C.faint);
        [0.92, 0.71, 0.55, 0.38].forEach((w, i) => { const y = 90 + i * 13; g.fillStyle = C.line; rr(g, 20, y, 200, 6, 3); g.fill();
          g.fillStyle = i === 0 ? C.accent : C.dim; rr(g, 20, y, 200 * w * clamp((c - 1.8) * 1.5, 0, 1), 6, 3); g.fill(); txt(g, "§6.3." + (16 - i * 3), 230, y + 3, 8, C.dim); }); }
      if (c > 3.2) txt(g, "Max GPIO source current is 25 mA. [1]", 20, 156, 10, C.fg);
      if (c > 3.9) { g.strokeStyle = C.accent; g.lineWidth = 1; rr(g, 20, 168, 178, 18, 4); g.stroke(); txt(g, "[1] orca-m4 · §6.3.16 · pg 14", 28, 177, 8, C.accent); }
    },
    hexhound(g, t) {
      const cols = 12, rows = 6, cw = 20.5, chh = 14, ox = 70, oy = 46, scan = Math.floor(t * 6) % (cols * rows);
      for (let r = 0; r < rows; r++) {
        txt(g, "0x" + (r * 16).toString(16).toUpperCase().padStart(4, "0"), 28, oy + r * chh + 7, 7, C.faint);
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c, magic = r === 2 && c >= 3 && c < 7, pad = r === 4, txtb = r === 3 && c > 5;
          const b = magic ? [0x7A, 0x3C, 0xE1, 0x01][c - 3] : pad ? 0xFF : ((i * 73 + 41) % 256);
          const col = i === scan ? C.fg : magic ? C.warm : txtb ? C.accent : pad ? C.faint : C.dim;
          if (magic) { g.fillStyle = "rgba(242,180,90,0.14)"; g.fillRect(ox + c * cw - 2, oy + r * chh, cw, chh - 2); }
          txt(g, b.toString(16).toUpperCase().padStart(2, "0"), ox + c * cw + 8, oy + r * chh + 7, 8, col, "center");
        }
      }
      txt(g, "ENTROPY", 28, 156, 7, C.faint);
      for (let i = 0; i < 24; i++) { const e = [0.3, 0.6, 0.62, 0.6, 0.05, 0.3, 0.95, 0.9, 0.05][Math.floor(i / 3)] || 0.5; g.fillStyle = e > 0.85 ? C.warm : e > 0.5 ? C.fg : e > 0.2 ? C.dim : C.faint; const h = 4 + e * 16; g.fillRect(72 + i * 9.2, 162 - h, 6.5, h); }
      txt(g, "magic 7A 3C E1 01", 28, 178, 8, C.warm); txt(g, "CRC32 ✓ valid", 292, 178, 8, C.accent, "right");
    },
  };

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size(s) {
    const r = s.canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    s.canvas.width = Math.max(1, Math.round(r.width * d)); s.canvas.height = Math.max(1, Math.round(r.height * d));
    s.scale = Math.min(s.canvas.width / W, s.canvas.height / H); s.ox = (s.canvas.width - W * s.scale) / 2; s.oy = (s.canvas.height - H * s.scale) / 2;
  }
  function draw(s, t) {
    const g = s.canvas.getContext("2d"); if (!g) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, s.canvas.width, s.canvas.height);
    g.setTransform(s.scale, 0, 0, s.scale, s.ox, s.oy); g.lineCap = "round"; g.lineJoin = "round";
    try { DRAW[s.scene](g, t + s.seed * 0.37); } catch (e) {}
  }
  scenes.forEach(size);
  window.addEventListener("resize", () => { scenes.forEach(size); scenes.forEach(s => draw(s, 2.2)); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { const s = scenes.find(x => x.canvas === e.target); if (s) s.visible = e.isIntersecting; }), { rootMargin: "80px" });
    scenes.forEach(s => io.observe(s.canvas));
  }
  scenes.forEach(s => draw(s, 2.2));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => scenes.forEach(s => draw(s, 2.2)));
  if (!reduce) {
    const start = performance.now(); let last = 0;
    (function loop(now) {
      if (now - last > 33) { last = now; const t = (now - start) / 1000; scenes.forEach(s => { if (s.visible && !s.canvas.closest("[hidden]")) draw(s, t); }); }
      requestAnimationFrame(loop);
    })(start);
  }
  /* Works-grid card art: a 30-day calendar. Built days light up, a highlight walks
     through them showing each project's name, and the next day pulses. */
  const artCanvas = document.querySelector("canvas[data-dob-art]");
  if (artCanvas) {
    const A = { fg: "#e5e7e5", dim: "#8b948e", faint: "#4b524e", line: "rgba(255,255,255,0.09)", accent: "#b8cce9", warm: "#f2b45a", bg: "#0b0d0d" };
    const mono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    let aw = 0, ah = 0, dpr = 1, artVisible = true;
    const sizeArt = () => { const r = artCanvas.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); aw = r.width; ah = r.height; artCanvas.width = Math.max(1, Math.round(aw * dpr)); artCanvas.height = Math.max(1, Math.round(ah * dpr)); };
    const drawArt = t => {
      const g = artCanvas.getContext("2d"); if (!g || !aw) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, aw, ah);
      const done = PROJECTS.length, cols = 10, rows = 3, gap = Math.max(4, aw * 0.012);
      const tile = Math.min((aw * 0.84 - gap * (cols - 1)) / cols, (ah * 0.46 - gap * (rows - 1)) / rows);
      const gw = tile * cols + gap * (cols - 1), gx = (aw - gw) / 2, gy = ah * 0.2;
      const step = 1.5, hi = Math.floor(t / step) % done, k = (t % step) / step;
      for (let i = 0; i < 30; i++) {
        const x = gx + (i % cols) * (tile + gap), y = gy + Math.floor(i / cols) * (tile + gap), day = i + 1;
        g.beginPath(); g.roundRect ? g.roundRect(x, y, tile, tile, Math.max(3, tile * 0.14)) : g.rect(x, y, tile, tile);
        if (i === hi) { g.fillStyle = A.accent; g.fill(); }
        else if (i < done) { g.fillStyle = "rgba(184,204,233,0.12)"; g.fill(); g.strokeStyle = "rgba(184,204,233,0.32)"; g.lineWidth = 1; g.stroke(); }
        else if (i === done) { g.save(); g.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 3)); g.setLineDash([3, 3]); g.strokeStyle = A.warm; g.lineWidth = 1.2; g.stroke(); g.restore(); }
        else { g.strokeStyle = A.line; g.lineWidth = 1; g.stroke(); }
        g.font = "500 " + Math.max(8, tile * 0.3).toFixed(1) + "px " + mono; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillStyle = i === hi ? A.bg : i < done ? A.accent : i === done ? A.warm : A.faint;
        g.fillText(String(day).padStart(2, "0"), x + tile / 2, y + tile / 2);
      }
      const [n, name, line] = PROJECTS[hi], ty = gy + rows * tile + (rows - 1) * gap + Math.max(26, ah * 0.1);
      const fade = Math.min(1, k * 6, (1 - k) * 6);
      g.globalAlpha = fade; g.textAlign = "left"; g.textBaseline = "middle";
      g.font = "500 " + Math.max(10, aw * 0.022).toFixed(1) + "px " + mono; g.fillStyle = A.accent; g.fillText("D·" + String(n).padStart(2, "0"), gx, ty);
      const off = g.measureText("D·00  ").width;
      g.font = "600 " + Math.max(15, aw * 0.042).toFixed(1) + "px -apple-system, BlinkMacSystemFont, sans-serif"; g.fillStyle = A.fg; g.fillText(name, gx + off, ty);
      g.font = Math.max(11, aw * 0.024).toFixed(1) + "px -apple-system, BlinkMacSystemFont, sans-serif"; g.fillStyle = A.dim; g.fillText(line, gx + off, ty + Math.max(20, aw * 0.045));
      g.globalAlpha = 1;
      g.textAlign = "right"; g.font = "500 " + Math.max(9, aw * 0.018).toFixed(1) + "px " + mono; g.fillStyle = A.warm;
      g.fillText("NEXT · D·" + String(done + 1).padStart(2, "0"), gx + gw, ty);
    };
    sizeArt(); drawArt(2);
    window.addEventListener("resize", () => { sizeArt(); drawArt(2); });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { artVisible = es[0].isIntersecting; }, { rootMargin: "60px" }).observe(artCanvas);
    if (!reduce) {
      const s0 = performance.now(); let last = 0;
      (function artLoop(now) {
        if (artVisible && now - last > 33) { last = now; if (Math.abs(artCanvas.getBoundingClientRect().width - aw) > 1) sizeArt(); drawArt((now - s0) / 1000); }
        requestAnimationFrame(artLoop);
      })(s0);
    }
  }
})();
