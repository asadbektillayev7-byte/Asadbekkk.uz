# Asadbekkk’s homepage

A single-screen personal homepage inspired by the supplied opening video. It uses a black background, rotating metallic letters, and a portrait assembled from particles sampled directly from Asadbekkk’s original photographs. The opening reads **ASADBEKKK → PORTFOLIO**. The supporting line is **Student. Still exploring.**

Only the homepage is implemented. There are no About, Projects, Experience, Contact, or other sections in this version. Previous versions remain in Git history.

## Personal photographs

Only the four requested cutouts are shown: original photos **2, 3, 5, and 6**. Photos 1 and 4 have been removed from the active selector and cutout assets. Supplied files remain unchanged in `dist/assets/cutouts/`; the particle renderer reads their actual alpha channels and preserves the entire silhouette and aspect ratio, including both hands in the wide pose.

Edit their order, file paths, descriptions, and initial selection in `dist/content.js`. `initialPhoto` is zero-based. Every photo can be selected with its thumbnail, the Next photo button, or the arrow keys while a thumbnail is focused.

## Opening and accessibility

Each new visit chooses a portrait and one of three opening styles: tumbling letters with a spherical particle cloud, a rising reveal, or scattered letters with a spiral particle formation. Browser-local shuffle bags cycle through the four portraits and three styles, avoiding consecutive repeats. Replay keeps the current visit’s selection; returning via browser Back chooses a new opening. Blocked browser storage is handled gracefully.

The opening lasts about six seconds. Skip intro jumps to the completed homepage. Replay intro restarts it. The operating system’s reduced-motion preference skips the opening and shows a static portrait; photo selection still works. The renderer pauses when the tab is hidden and falls back to an ordinary photograph if the particle scene cannot initialize.

The site includes keyboard controls, visible focus indicators, a screen-reader description of the portrait, and selection announcements. It loads no animation framework or analytics.

## Files

- `dist/index.html`: the homepage only.
- `dist/styles.css`: black-and-silver appearance and responsive layout.
- `dist/content.js`: display name and four selected cutouts.
- `dist/visit-opening.js`: browser-local visit selection and shuffle bags.
- `dist/app.js`: opening, replay, selection, and input handling.
- `dist/portrait.js`: live Canvas point-cloud portrait renderer.

## Preview

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 and stop the server with Control+C. This is a static site with no build step or database.

The existing private hosted preview is https://asadbek-in-motion.fuzzybetta33.chatgpt.site. Local changes appear there after publication through Sites. Preserve `.openai/hosting.json` and never put deployment credentials in website files.

The supplied reference video is used only for design study. It is not included in the published website.
