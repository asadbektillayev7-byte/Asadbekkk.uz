# Asadbekkk’s homepage

A homepage inspired by the original Code and Chill portfolio demo. It uses a black canvas, fine silver-blue mosaic portraits, and a bouncing-dot / flying-letter opening that changes ASADBEKKK into PORTFOLIO.

Only the homepage is active. On desktop the large flat silver title sits over the lower portrait; on mobile it sits above the portrait, following the live demo’s composition. The supporting line is **Student. Still exploring.** Name-click opens a short personal introduction; Contact opens an honest placeholder until contact details are supplied. No service or professional-engineer claims are used.

## Photographs

Only original cutouts **2, 3, 5, and 6** are active. Photos 1 and 4 remain excluded. Source files are unchanged in `dist/assets/cutouts/`; the renderer uses their alpha channels and preserves their aspect and alpha edges. Desktop contains the complete cutout; mobile enlarges frontal portraits like the demo, with shoulders allowed to extend past the screen. The wide pose stays contained so both hands remain visible.

The portrait uses a regular square mosaic lattice sampled from the actual photograph. Tile brightness follows source luminance, with dark gaps and a faint grayscale source layer to retain facial detail. It does not generate or replace the face. Original files are around 439–512 pixels, so their resolution limits fine detail.

Edit names, photo paths, descriptions, and fallback selection in `dist/content.js`. The **Portraits** control opens the four-photo picker, with Next photo and keyboard arrow controls.

## Opening

Each new visit selects a portrait and one of three variations of the same opening sequence. Browser-local shuffle bags cycle through the photos and formations without consecutive repeats. Replay keeps the current visit’s choice. Skip intro immediately finishes the scene; opening Portraits also skips to the assembled state.

The introduction lasts about eight seconds. Reduced-motion preferences show a static completed portrait. The renderer pauses when the page is hidden, rests after assembly, and falls back to the source photograph if Canvas cannot initialize.

## Files

- `dist/index.html`, `dist/styles.css`: active homepage and responsive layout.
- `dist/app.js`: opening, photo controls, and lifecycle handling.
- `dist/portrait.js`: source-sampled mosaic renderer.
- `dist/home.js`: portrait panel and small homepage dialogs.
- `dist/visit-opening.js`: browser-local randomized selection.
- `drafts/full-site/`: inactive section draft retained for a later request; not served or deployed.

Static site, no build or database. Preview with `python3 -m http.server 4173 --directory dist`.

Hosted private preview: https://asadbek-in-motion.fuzzybetta33.chatgpt.site

Reference for design study: https://demo.codeandchill.store/portfolio/#home. Its source assets and template branding are not included.
