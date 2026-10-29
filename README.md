# Asadbek — Personal Space

A personal student portfolio with a video-inspired silver mosaic opening and five live sections: Works, Resume, Personal, Reading, Contact.

## Current content

Only the first photo from the previous set remains: `dist/assets/cutouts/cutout-2.webp`, the white collared-shirt portrait. Other deployed portrait assets were removed; original user files are untouched. The brand is **Asadbek** and links to the homepage. The Home and Portraits controls are removed.

The opening supports the seven-letter ASADBEK → nine-letter PORTFOLIO transition. Each visit can choose one of three opening variations with the same selected portrait. Replay retains the current variation; Skip and reduced motion show the finished scene. The portrait pauses when the hero leaves the screen.

Works has three project slots with category filters and detail dialogs. Resume has education, work/internships, leadership/activities, and volunteering slots plus a printable draft. Personal contains a short introduction and photography placeholders. Reading has current, finished, and next shelves ready for real titles. Contact has clear placeholders for email and social links. No unsupplied achievements, books, employers, dates, or contact information are invented.

## Editing

- `dist/content.js`: name, chosen photo, project titles/descriptions/prompts.
- `dist/index.html`: section content, resume draft, personal text, photography slots, contact fields.
- `dist/styles.css`: opening and base styles.
- `dist/sections.css`: navigation, sections, responsive layouts, and resume print styles.
- `dist/app.js`: intro and single-portrait lifecycle.
- `dist/portrait.js`: source-sampled mosaic; real source shadows and alpha edges are preserved.
- `dist/site.js`: menu, filters, dialogs, active section links, resume printing.
- `dist/visit-opening.js`: browser-local opening selection.

Replace clearly labeled placeholders with verified details before using the resume for applications. The Print / save as PDF button uses the browser's print dialog.

The inactive `drafts/full-site/` folder is retained from an earlier layout and is not served or deployed.

Static site: preview with `python3 -m http.server 4173 --directory dist`.

Hosted private preview: https://asadbek-in-motion.fuzzybetta33.chatgpt.site

Design reference: https://demo.codeandchill.store/portfolio/#home. Its source assets and branding are not included.
