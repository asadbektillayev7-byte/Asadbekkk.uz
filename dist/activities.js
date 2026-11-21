/* Activities — cards for the Works page (finished work, each opens a popup) and the Personal page.

   EDITING: each entry in ACTIVITIES is one card.
     id: short name, also used for the popup (works page).
     page: "works" or "personal" — which page shows it.
     featured: true makes it a wide card (Personal page only).
     scene: the name of a drawing function in DRAW (320×200 stage, t = seconds).
     links: [["website" | "telegram" | "instagram", "https://..."], ...] — shown as icons.
     about / did: paragraphs for the popup ("What it is" / "What I did").

   This script must load BEFORE site.js so site.js can wire up the popups it creates. */
(function () {
  const ACTIVITIES = [
    {
      id: "muhandiss", name: "Muhandiss.uz", page: "works", role: "Co-founder · Project manager", when: "2025 – now", scene: "muhandiss",
      line: "Engineering for young people in Uzbek: translated articles, youth hackathons and podcasts with engineers.",
      links: [["website", "https://muhandiss.uz"], ["telegram", "https://t.me/Muhandis_e"]],
      about: ["A platform that makes engineering accessible in Uzbek. We translate and publish engineering articles, run hackathons and online challenges for young people, and record podcasts with working engineers."],
      did: ["I co-founded Muhandiss.uz and manage the project. I lead a team of 20 translators; together we have published 40+ articles read by 9k+ people.",
            "Once a month we host an interview with an expert, online or in person."],
    },
    {
      id: "pizik", name: "Pizik", page: "works", role: "Science communicator", when: "2025", scene: "lab",
      line: "Uzbekistan’s first outreach community for hands-on physics. I ran Saturday experiment demos for kids at school.",
      links: [["telegram", "https://t.me/pizik_lab"], ["instagram", "https://www.instagram.com/pizik_lab"]],
      about: ["Pizik brings hands-on physics experiments to school students across Uzbekistan. Its motto: from an apple to people — physics for everyone.",
              "The team has run experiment workshops in all 14 regions for 3.5K+ students, and its experiment videos have reached around 3 million views."],
      did: ["As a science communicator, I led physics demos at my school on Saturdays, showing kids experiments up close and explaining the physics behind them."],
    },
    {
      id: "ksu", name: "Karshi State University", page: "works", role: "Lab assistant · Physics", when: "2025 – 26", scene: "film",
      line: "Grew thin semiconductor films: prepped substrates, watched the vacuum, ran FTIR and UV scans.",
      links: [],
      about: ["The Department of Theoretical and Experimental Physics at Karshi State University’s physics faculty, where researchers grow and study thin semiconductor films."],
      did: ["I assisted with thin-film deposition: preparing substrates, monitoring the vacuum during deposition, and running FTIR and UV scans so the data was precise."],
    },
    {
      id: "shurtan", name: "Shurtan Gas Chemical Complex", page: "works", role: "Assistant technician", when: "Summer 2025", scene: "bearing",
      line: "Pump maintenance, turbine casing removal, valve tests. Installed compressor bearings on my own.",
      links: [],
      about: ["One of Uzbekistan’s largest chemical enterprises."],
      did: ["I assisted with pump maintenance and turbine casing removal, installed compressor bearings on my own, and checked pressure gauges during valve tests."],
    },
    {
      id: "mountains", name: "Mountains", page: "personal", role: "Hiking", when: "2025 – now", featured: true, scene: "peak",
      line: "10+ peaks, ~120 km across Uzbekistan and Kyrgyzstan. Summited Hazrati Sultan (4,643 m), Uzbekistan’s highest.",
      links: [],
    },
  ];

  const grids = Array.from(document.querySelectorAll("[data-act-grid]"));
  if (!grids.length) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Line icons (24×24, drawn with currentColor) */
  const ICON = {
    website: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5S9.4 5.1 12 2.5Z"/>',
    telegram: '<path d="M21.5 3.5 2.8 10.6c-.9.4-.9 1.6 0 1.9l4.7 1.6 1.8 5.5c.2.7 1.1.9 1.6.4l2.6-2.4 4.8 3.5c.6.5 1.5.1 1.7-.6L23 4.9c.2-1-.7-1.8-1.5-1.4Z"/><path d="m7.5 14.1 10.7-7.3-7.9 8.4"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/>',
  };
  const LABEL = { website: "Website", telegram: "Telegram", instagram: "Instagram" };
  const iconLinks = (a, cls) => a.links.length ? '<div class="' + cls + '">' + a.links.map(([k, u]) =>
    '<a href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + a.name + " on " + LABEL[k] + '" title="' + LABEL[k] + '">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICON[k] + "</svg></a>").join("") + "</div>" : "";

  const scenes = [];
  let seed = 0;
  const addScene = (canvas, scene, colors) => scenes.push({ canvas, scene, visible: true, seed: seed++, colors });

  grids.forEach(grid => {
    const page = grid.dataset.actGrid;
    const s0 = getComputedStyle(grid), v = n => s0.getPropertyValue("--act-" + n).trim();
    const colors = { fg: v("fg"), dim: v("dim"), faint: v("faint"), line: v("line"), accent: v("accent"), warm: v("warm"), stage: v("stage"), card: v("card"), mono: v("mono") };
    ACTIVITIES.filter(a => a.page === page).forEach(a => {
      const card = document.createElement("article");
      if (page === "works") {
        /* Same look as the other Works project cards; the whole card opens a popup */
        const dlg = "work-" + a.id;
        card.className = "project-card act-pcard reveal is-visible";
        card.dataset.openDialog = dlg;
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-haspopup", "dialog");
        card.setAttribute("aria-label", a.name + " — " + a.role + ". Open details.");
        card.innerHTML =
          '<div class="project-art act-pcard-art" aria-hidden="true"><canvas></canvas></div>' +
          '<div class="project-card-copy"><div class="card-topline"><span>' + esc(a.role) + '</span><span class="placeholder-label">' + esc(a.when) + "</span></div>" +
          "<h3>" + esc(a.name) + '<span class="card-arrow" aria-hidden="true">↗</span></h3><p>' + esc(a.line) + "</p>" + iconLinks(a, "act-icons") + "</div>";
        card.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === card) { e.preventDefault(); card.click(); } });

        /* The popup, in the same style as the book insights on the Reading page */
        const d = document.createElement("dialog");
        d.className = "personal-dialog work-dialog";
        d.id = dlg;
        d.setAttribute("aria-labelledby", dlg + "-title");
        d.innerHTML =
          '<button class="dialog-close" data-close-dialog aria-label="Close">✕</button>' +
          '<span class="eyebrow">' + esc(a.role) + " · " + esc(a.when) + "</span>" +
          '<h2 id="' + dlg + '-title">' + esc(a.name) + "</h2>" +
          '<div class="work-dialog-stage" aria-hidden="true"><canvas></canvas></div>' +
          '<section class="work-dialog-body"><h3>What it is</h3>' + a.about.map(p => "<p>" + esc(p) + "</p>").join("") +
          "<h3>What I did</h3>" + a.did.map(p => "<p>" + esc(p) + "</p>").join("") + "</section>" +
          iconLinks(a, "act-icons work-dialog-icons");
        document.body.appendChild(d);
        addScene(d.querySelector("canvas"), a.scene, colors);
      } else {
        card.className = "act-card" + (a.featured ? " is-featured" : "");
        card.innerHTML =
          '<div class="act-stage"><canvas aria-hidden="true"></canvas><span class="act-when">' + esc(a.when) + "</span></div>" +
          '<div class="act-info"><p class="act-role">' + esc(a.role) + '</p><h3 class="act-name">' + esc(a.name) + '</h3><p class="act-line">' + esc(a.line) + "</p>" + iconLinks(a, "act-icons") + "</div>";
      }
      grid.appendChild(card);
      addScene(card.querySelector(".project-art canvas, .act-stage canvas"), a.scene, colors);
    });
  });
  /* Icon links inside a card open the site, not the popup */
  document.querySelectorAll(".act-pcard .act-icons a").forEach(a => a.addEventListener("click", e => e.stopPropagation()));

  let C = scenes.length ? scenes[0].colors : {};
  const W = 320, H = 200;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function txt(g, s, x, y, size, color, align) { g.font = size + "px " + C.mono; g.fillStyle = color || C.dim; g.textAlign = align || "left"; g.textBaseline = "middle"; g.fillText(s, x, y); }

  const DRAW = {
    /* Muhandiss.uz — three things it does, in turn: articles, hackathons, podcasts */
    muhandiss(g, t) {
      const MODES = ["ARTICLES", "HACKATHONS", "PODCASTS"], dur = 4, mode = Math.floor(t / dur) % 3, c = t % dur;
      const fade = Math.min(1, c * 4, (dur - c) * 4);
      g.globalAlpha = fade;
      if (mode === 0) {
        const page = (x, label, filled, color) => {
          rr(g, x, 36, 92, 116, 6); g.fillStyle = C.card; g.fill(); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke();
          txt(g, label, x + 10, 50, 9, C.dim);
          for (let i = 0; i < 8; i++) { const w = [64, 72, 58, 70, 44, 68, 60, 38][i]; g.fillStyle = i < filled ? color : C.line; rr(g, x + 10, 64 + i * 10, w, 4, 2); g.fill(); }
        };
        page(46, "EN", 8, C.dim);
        page(182, "UZ", Math.floor(clamp(c / 3, 0, 1) * 8), C.accent);
        g.strokeStyle = C.faint; g.lineWidth = 1.2; g.beginPath(); g.moveTo(148, 94); g.lineTo(172, 94); g.moveTo(166, 88); g.lineTo(172, 94); g.lineTo(166, 100); g.stroke();
        g.fillStyle = C.accent; g.beginPath(); g.arc(lerp(148, 170, (t * 0.8) % 1), 94, 2.2, 0, 7); g.fill();
      } else if (mode === 1) {
        const secs = 59 - Math.floor(c * 4) % 60;
        txt(g, "47:59:" + String(secs).padStart(2, "0"), 160, 42, 15, C.warm, "center");
        g.strokeStyle = C.line; g.lineWidth = 1.2; g.beginPath(); g.ellipse(160, 126, 112, 16, 0, 0, 7); g.stroke();
        [[86, 0], [160, 1], [234, 2]].forEach(([x, i]) => {
          rr(g, x - 26, 78, 52, 34, 3); g.fillStyle = C.card; g.fill(); g.strokeStyle = C.fg; g.lineWidth = 1.2; g.stroke();
          g.beginPath(); g.moveTo(x - 32, 116); g.lineTo(x + 32, 116); g.lineTo(x + 26, 112); g.lineTo(x - 26, 112); g.closePath(); g.stroke();
          for (let l = 0; l < 3; l++) { const w = 12 + ((l * 7 + i * 5) % 20) + (l === 2 ? (Math.floor(t * 3 + i) % 3) * 6 : 0); g.fillStyle = l === 0 ? C.accent : C.dim; rr(g, x - 20, 85 + l * 7, w, 3, 1.5); g.fill(); }
          if (Math.floor(t * 2 + i) % 2) { g.fillStyle = C.fg; g.fillRect(x + 12, 98, 4, 6); }
        });
      } else {
        const mic = (x, dir) => {
          rr(g, x - 9, 72, 18, 34, 9); g.fillStyle = C.card; g.fill(); g.strokeStyle = C.fg; g.lineWidth = 1.3; g.stroke();
          for (let l = 0; l < 3; l++) { g.strokeStyle = C.faint; g.beginPath(); g.moveTo(x - 6, 80 + l * 7); g.lineTo(x + 6, 80 + l * 7); g.stroke(); }
          g.strokeStyle = C.fg; g.beginPath(); g.arc(x, 96, 14, 0.15, Math.PI - 0.15); g.stroke();
          g.beginPath(); g.moveTo(x, 110); g.lineTo(x, 140); g.moveTo(x - 14, 140); g.lineTo(x + 14, 140); g.stroke();
          txt(g, dir ? "ENGINEER" : "HOST", x, 156, 8, C.dim, "center");
        };
        mic(70, 0); mic(250, 1);
        const speaker = Math.floor(t * 0.9) % 2;
        for (let i = 0; i < 22; i++) {
          const x = 104 + i * 5.6, side = speaker ? i / 21 : 1 - i / 21;
          const a = (0.15 + 0.85 * side) * Math.abs(Math.sin(t * 7 + i * 1.3) * Math.cos(t * 2 + i * 0.4));
          g.fillStyle = C.accent; rr(g, x, 94 - a * 26, 3, a * 52 + 2, 1.5); g.fill();
        }
        if (Math.floor(t * 2) % 2) { g.fillStyle = C.warm; g.beginPath(); g.arc(144, 44, 3.5, 0, 7); g.fill(); }
        txt(g, "REC", 152, 44, 10, C.warm);
      }
      g.globalAlpha = 1;
      MODES.forEach((m, i) => txt(g, m, 82 + i * 78, 186, 8, i === mode ? C.fg : C.faint, "center"));
    },

    /* Pizik — a lab bench with three of its experiments: fire foam, tornado in a bottle, a balloon and hot air */
    lab(g, t) {
      g.strokeStyle = C.line; g.lineWidth = 1.2; g.beginPath(); g.moveTo(14, 168); g.lineTo(306, 168); g.stroke();

      /* 1 · Fire foam: gas-filled soap foam on an open palm burns for a moment */
      const fc = t % 5, foam = clamp(fc / 1.2, 0, 1), burning = fc > 1.6 && fc < 3.6, hx = 62;
      g.strokeStyle = C.fg; g.lineWidth = 1.4; g.fillStyle = C.card;
      g.save(); g.translate(hx + 22, 150); g.rotate(-0.75); rr(g, -4.5, -26, 9, 30, 4.5); g.fill(); g.stroke(); g.restore(); /* thumb (drawn first so the palm covers its base) */
      rr(g, hx - 24, 128, 48, 40, 14); g.fill(); g.stroke();                          /* palm */
      [[-17, 34], [-6, 40], [5, 38], [15, 30]].forEach(([dx, len]) => {               /* four fingers */
        rr(g, hx + dx - 4.5, 130 - len, 9, len + 6, 4.5); g.fill(); g.stroke(); });
      g.fillStyle = C.card; g.fillRect(hx - 22, 126, 44, 8);                          /* clean palm edge */
      const foamR = burning ? Math.max(0, 1 - (fc - 1.6) / 0.35) : foam;
      if (foamR > 0.02) for (let i = 0; i < 8; i++) {
        const bx = hx - 13 + (i % 4) * 8.5 + (i > 3 ? 4 : 0), by = 140 - (i > 3 ? 7 : 0), r = (3.5 + (i % 3) * 1.2) * foamR;
        g.strokeStyle = C.dim; g.lineWidth = 1; g.beginPath(); g.arc(bx, by, r, 0, 7); g.stroke(); }
      if (burning) {
        const k = Math.sin(((fc - 1.6) / 2) * Math.PI);
        const glow = g.createRadialGradient(hx, 120, 4, hx, 112, 60 * k + 1);
        glow.addColorStop(0, "rgba(242,160,70," + (0.35 * k).toFixed(2) + ")"); glow.addColorStop(1, "rgba(242,160,70,0)");
        g.fillStyle = glow; g.fillRect(hx - 64, 50, 128, 100);
        for (let f = 0; f < 6; f++) {
          const x0 = hx - 16 + f * 6.5, hgt = (52 + 22 * Math.sin(t * 11 + f * 2.1)) * k, sway = Math.sin(t * 8 + f * 1.7) * 6 * k;
          g.fillStyle = f % 2 ? "rgba(242,180,90,0.8)" : "rgba(240,110,55,0.65)";
          g.beginPath(); g.moveTo(x0 - 8, 142); g.quadraticCurveTo(x0 - 7 + sway, 142 - hgt * 0.55, x0 + sway * 1.5, 142 - hgt);
          g.quadraticCurveTo(x0 + 7 + sway, 142 - hgt * 0.55, x0 + 8, 142); g.closePath(); g.fill();
        }
        g.fillStyle = "rgba(255,236,190," + (0.7 * k).toFixed(2) + ")"; g.beginPath(); g.ellipse(hx, 136, 14 * k, 6 * k, 0, 0, 7); g.fill();
      }
      txt(g, "FIRE FOAM", hx, 186, 8, burning ? C.warm : C.dim, "center");

      /* 2 · Tornado in a bottle: two bottles neck to neck, water spins down through the neck */
      const cx = 160, cyc = (t % 7) / 7, upper = 1 - cyc;
      const shape = (top, bot, down) => { const p = new Path2D();
        if (down) { p.moveTo(cx - 20, top); p.lineTo(cx + 20, top); p.lineTo(cx + 20, bot - 24); p.quadraticCurveTo(cx + 20, bot - 12, cx + 5, bot - 6); p.lineTo(cx + 5, bot); p.lineTo(cx - 5, bot); p.lineTo(cx - 5, bot - 6); p.quadraticCurveTo(cx - 20, bot - 12, cx - 20, bot - 24); }
        else { p.moveTo(cx - 5, top); p.lineTo(cx + 5, top); p.lineTo(cx + 5, top + 6); p.quadraticCurveTo(cx + 20, top + 12, cx + 20, top + 24); p.lineTo(cx + 20, bot); p.lineTo(cx - 20, bot); p.lineTo(cx - 20, top + 24); p.quadraticCurveTo(cx - 20, top + 12, cx - 5, top + 6); }
        p.closePath(); return p; };
      const topB = shape(30, 98, true), botB = shape(106, 168, false);
      /* water in the upper bottle rests on the neck; the lower bottle fills from the bottom */
      g.save(); g.clip(topB); g.fillStyle = "rgba(184,204,233,0.22)"; const uh = 60 * upper; g.fillRect(cx - 21, 99 - uh, 42, uh); g.restore();
      g.save(); g.clip(botB); g.fillStyle = "rgba(184,204,233,0.22)"; const lh = 54 * cyc; g.fillRect(cx - 21, 169 - lh, 42, lh); g.restore();
      if (upper > 0.06) {                                                              /* the vortex funnel */
        const surf = 99 - 60 * upper;
        g.save(); g.clip(topB); g.strokeStyle = C.accent; g.lineWidth = 1.1;
        for (let i = 0; i < 7; i++) { const u = i / 6, yy = lerp(surf + 3, 93, u), rx = lerp(17, 2.5, u) * Math.min(1, upper * 2), ph = t * 10 + i * 0.9;
          g.beginPath(); g.ellipse(cx, yy, rx, 1.8 + 1.2 * (1 - u), 0, ph % 6.283, (ph % 6.283) + 3.8); g.stroke(); }
        g.restore();
        g.fillStyle = C.accent; g.fillRect(cx - 1.2, 98, 2.4, 10);
        for (let d = 0; d < 3; d++) { const dy = 110 + ((t * 60 + d * 12) % (Math.max(8, 52 - 54 * cyc))); g.beginPath(); g.arc(cx + Math.sin(t * 5 + d) * 1.5, dy, 1.3, 0, 7); g.fill(); }
      }
      g.strokeStyle = C.fg; g.lineWidth = 1.4; g.stroke(topB); g.stroke(botB);
      g.fillStyle = C.dim; g.fillRect(cx - 7, 97, 14, 9);
      txt(g, "VORTEX", cx, 186, 8, upper > 0.06 ? C.accent : C.dim, "center");

      /* 3 · Hot air: warming the bottle makes the air expand and inflates the balloon */
      const bx = 258, heat = 0.5 + 0.5 * Math.sin(t * 1.3), r = 9 + 15 * heat;
      const bot = new Path2D(); bot.moveTo(bx - 6, 98); bot.lineTo(bx - 6, 106); bot.quadraticCurveTo(bx - 22, 112, bx - 22, 126); bot.lineTo(bx - 22, 168); bot.lineTo(bx + 22, 168); bot.lineTo(bx + 22, 126); bot.quadraticCurveTo(bx + 22, 112, bx + 6, 106); bot.lineTo(bx + 6, 98);
      g.save(); g.clip(bot); g.fillStyle = "rgba(242,180,90," + (0.1 + 0.2 * heat).toFixed(2) + ")"; g.fillRect(bx - 23, 138, 46, 31); g.restore();
      g.strokeStyle = C.fg; g.lineWidth = 1.4; g.stroke(bot);
      for (let i = 0; i < 3; i++) { const x = bx - 11 + i * 11, rise = (t * 18 + i * 9) % 26;
        g.strokeStyle = "rgba(242,180,90," + ((0.2 + 0.55 * heat) * (1 - rise / 26)).toFixed(2) + ")"; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x, 162 - rise); g.quadraticCurveTo(x + 3, 158 - rise, x, 154 - rise); g.stroke(); }
      g.fillStyle = C.accent; g.beginPath(); g.ellipse(bx, 97 - r * 1.05, r * 0.88, r * 1.05, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(bx - 5.5, 99); g.lineTo(bx + 5.5, 99); g.lineTo(bx + 2.5, 95); g.lineTo(bx - 2.5, 95); g.fill();
      txt(g, "HOT AIR", bx, 186, 8, C.dim, "center");
    },

    /* Karshi State University — a thin film growing in a vacuum chamber, then a scan */
    film(g, t) {
      const c = t % 7, layers = Math.min(6, Math.floor(c / 0.7));
      g.strokeStyle = C.fg; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(34, 168); g.lineTo(34, 78); g.arc(94, 78, 60, Math.PI, 0); g.lineTo(154, 168); g.closePath(); g.stroke();
      g.fillStyle = C.dim; g.fillRect(84, 52, 20, 6);
      for (let i = 0; i < 10; i++) {
        const k = ((t * 1.3 + i * 0.37) % 1), x = 94 + Math.sin(i * 2.7) * 22 * k;
        g.fillStyle = "rgba(167,196,230," + (0.8 * (1 - k * 0.5)).toFixed(2) + ")"; g.beginPath(); g.arc(x, lerp(62, 150 - layers * 3, k), 1.6, 0, 7); g.fill();
      }
      g.fillStyle = C.faint; g.fillRect(56, 154, 76, 8);
      for (let i = 0; i < layers; i++) { g.fillStyle = i % 2 ? C.accent : "#7f9cc2"; g.fillRect(58, 151 - i * 3, 72, 3); }
      txt(g, "VACUUM", 94, 182, 8, C.faint, "center");
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(180, 168); g.lineTo(296, 168); g.moveTo(180, 168); g.lineTo(180, 74); g.stroke();
      const prog = clamp((c - 4.2) / 2, 0, 1);
      if (prog > 0) {
        g.strokeStyle = C.warm; g.lineWidth = 1.6; g.beginPath();
        for (let x = 180; x <= 180 + 116 * prog; x += 1.5) { const u = (x - 180) / 116; const y = 160 - 70 * (0.25 + 0.5 * Math.exp(-((u - 0.35) ** 2) / 0.008) + 0.35 * Math.exp(-((u - 0.72) ** 2) / 0.004) + 0.05 * Math.sin(u * 40)); x === 180 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.stroke();
      }
      txt(g, "FTIR · UV", 296, 182, 8, prog > 0 ? C.warm : C.faint, "right");
    },
    /* Shurtan — a turning compressor bearing and a pressure gauge */
    bearing(g, t) {
      const cx = 110, cy = 112, a = t * 0.9;
      g.strokeStyle = C.fg; g.lineWidth = 1.4;
      g.beginPath(); g.arc(cx, cy, 62, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.stroke();
      g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.stroke();
      for (let i = 0; i < 9; i++) { const b = a * 0.42 + i * (Math.PI * 2 / 9); g.fillStyle = C.accent; g.beginPath(); g.arc(cx + Math.cos(b) * 41, cy + Math.sin(b) * 41, 9, 0, 7); g.fill(); }
      g.strokeStyle = C.faint; g.beginPath(); g.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); g.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30); g.stroke();
      const gx = 246, gy = 106, val = 0.55 + 0.25 * Math.sin(t * 0.9) + 0.03 * Math.sin(t * 9);
      g.strokeStyle = C.line; g.lineWidth = 6; g.beginPath(); g.arc(gx, gy, 40, Math.PI * 0.8, Math.PI * 2.2); g.stroke();
      g.strokeStyle = C.warm; g.beginPath(); g.arc(gx, gy, 40, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * val)); g.stroke();
      const na = Math.PI * (0.8 + 1.4 * val); g.strokeStyle = C.fg; g.lineWidth = 1.6; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + Math.cos(na) * 30, gy + Math.sin(na) * 30); g.stroke();
      g.fillStyle = C.fg; g.beginPath(); g.arc(gx, gy, 3, 0, 7); g.fill();
      txt(g, "BAR", gx, gy + 26, 8, C.faint, "center");
    },
    /* Mountains — a climb to the 4,643 m summit */
    peak(g, t) {
      const pts = [[20, 172], [56, 142], [80, 154], [118, 104], [146, 124], [190, 58], [222, 98], [250, 84], [300, 160]];
      g.fillStyle = "rgba(167,196,230,0.06)"; g.beginPath(); g.moveTo(20, 176); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(300, 176); g.closePath(); g.fill();
      g.strokeStyle = C.fg; g.lineWidth = 1.5; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
      const route = pts.slice(0, 6); let total = 0; const segs = [];
      for (let i = 1; i < route.length; i++) { const d = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); segs.push(d); total += d; }
      const k = clamp(((t % 7) / 5), 0, 1); let dist = k * total, i = 0;
      while (i < segs.length - 1 && dist > segs[i]) { dist -= segs[i]; i++; }
      const f = clamp(dist / segs[i], 0, 1), px = lerp(route[i][0], route[i + 1][0], f), py = lerp(route[i][1], route[i + 1][1], f);
      g.strokeStyle = C.accent; g.setLineDash([3, 4]); g.lineWidth = 1.4; g.beginPath(); g.moveTo(route[0][0], route[0][1] - 4);
      for (let j = 1; j <= i; j++) g.lineTo(route[j][0], route[j][1] - 4);
      g.lineTo(px, py - 4); g.stroke(); g.setLineDash([]);
      g.fillStyle = C.accent; g.beginPath(); g.arc(px, py - 4, 3.5, 0, 7); g.fill();
      const top = k >= 1;
      g.strokeStyle = top ? C.warm : C.faint; g.lineWidth = 1.4; g.beginPath(); g.moveTo(190, 58); g.lineTo(190, 38); g.stroke();
      g.fillStyle = top ? C.warm : C.faint; g.beginPath(); g.moveTo(190, 38); g.lineTo(204, 43); g.lineTo(190, 48); g.fill();
      txt(g, "4,643 m", 210, 38, 10, top ? C.warm : C.dim);
    },
  };

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size(s) {
    const r = s.canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    s.canvas.width = Math.max(1, Math.round(r.width * d)); s.canvas.height = Math.max(1, Math.round(r.height * d));
    s.scale = Math.min(s.canvas.width / W, s.canvas.height / H); s.ox = (s.canvas.width - W * s.scale) / 2; s.oy = (s.canvas.height - H * s.scale) / 2;
  }
  function draw(s, t) {
    const g = s.canvas.getContext("2d"); if (!g || !DRAW[s.scene]) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, s.canvas.width, s.canvas.height);
    g.setTransform(s.scale, 0, 0, s.scale, s.ox, s.oy); g.lineCap = "round"; g.lineJoin = "round";
    C = s.colors;
    try { DRAW[s.scene](g, t + s.seed * 0.9); } catch (e) {}
  }
  scenes.forEach(size);
  window.addEventListener("resize", () => { scenes.forEach(size); scenes.forEach(s => draw(s, 6.5)); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { const s = scenes.find(x => x.canvas === e.target); if (s) s.visible = e.isIntersecting; }), { rootMargin: "80px" });
    scenes.forEach(s => io.observe(s.canvas));
  }
  scenes.forEach(s => draw(s, 6.5));
  /* When any popup opens, let every animation (including the 30-day builds) measure its new size */
  document.querySelectorAll("dialog").forEach(d => new MutationObserver(() => {
    if (!d.open) return;
    [0, 60, 260].forEach(ms => setTimeout(() => window.dispatchEvent(new Event("resize")), ms));
  }).observe(d, { attributes: true, attributeFilter: ["open"] }));
  if (!reduce) {
    const start = performance.now(); let last = 0;
    (function loop(now) {
      if (now - last > 33) {
        last = now; const t = (now - start) / 1000;
        scenes.forEach(s => {
          if (!s.visible) return;
          const w = s.canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2);
          if (!w) return;
          if (Math.abs(w - s.canvas.width) > 2) size(s);
          draw(s, t);
        });
      }
      requestAnimationFrame(loop);
    })(start);
  }
})();
