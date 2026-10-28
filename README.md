# Asadbek’s CV website

A personal CV and portfolio website with a spacious introduction, section navigation, achievement cards, experience and education, projects, community work, media, and personal interests. The layout follows the visual direction of the Dilafruza reference, with Asadbek’s mechanical engineering and software interests.

Credentials and personal material that have not been supplied are clearly marked placeholders. No awards, statistics, skills, schools, employers, or project outcomes are invented.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000> in your browser. Stop the preview with Control+C. This is a static website with no build step, database, or account required.

## Edit your content

All editable content is in `dist/content.js`, in the `window.CV_CONTENT` object. Keep its field names, commas, and quotation marks intact. Change the text and replace placeholder entries with your real information; remove unused entries from their arrays.

- `profile`: name, headline, introduction, portrait, location, contact details, CV, introduction video, and social links. Empty links remain unavailable until you provide a real destination.
- `roles` and `aboutStats`: the four introduction roles and six summary figures. Keep the em dash while a figure is unknown; add only verified numbers.
- `achievements`: eight reserved cards for awards, competitions, qualifications, or milestones. Update the title, organization, date, description, tags, and optional image. Links use objects with `label` and `url` fields, for example `{ label: "View certificate", url: "https://example.com/certificate" }`.
- `experiences` and `education`: roles, organizations, dates, locations, and brief explanations of your contribution or learning.
- `skillGroups` and `languages`: add only skills and language levels that accurately describe you.
- `projects`: three reserved project entries for mechanical, software, and integrated work. Describe your actual role, process, and result. State clearly when work is a simulation, planned, or in progress. Replace the `Placeholder` status after adding real content.
- `communityStats`, `communities`, and `places`: volunteering, leadership, activities, and places connected to your story. Community links use the same `label` and `url` objects as achievement links.
- `mediaStats`, `videos`, `mediaLinks`, `article`, and `outlets`: real interviews, presentations, appearances, and published features. Leave URLs empty until ready; remove sections or entries that do not apply.
- `hobbies`, `facts`, and `availability`: photography, other interests, personal stories, and current availability.

## Add images and your CV

Place files in `dist/assets/` and use paths relative to the public website root:

```js
portraitSrc: "assets/asadbek-portrait.jpg",
portraitAlt: "Portrait of Asadbek",
cvUrl: "assets/asadbek-cv.pdf"
```

Set a card’s `imageSrc` to a path such as `assets/project-prototype.jpg`. Empty image paths display designed placeholders. Use your own photographs or images you have permission to publish, and keep the portrait’s alternative text descriptive. Do not use another person’s portrait, certificates, or achievements as your own.

The layout is in `dist/index.html`, the styling in `dist/styles.css`, and the rendering and interactive behavior in `dist/app.js`.

## Hosted version

The existing private preview is [Asadbek’s personal website](https://asadbek-in-motion.fuzzybetta33.chatgpt.site). The source folder and preview address are retained for this redesign. Local edits appear there after the updated `dist/` files are uploaded through Sites; editing a file locally does not update the hosted version automatically.

Publish the contents of `dist/` as a static website. No environment variables or secrets are needed. The `.openai/` source manifest is private Sites packaging metadata and belongs outside the public `dist/` directory. Keep deployment credentials out of all website files.

Before sharing with universities, replace or remove placeholders, add your actual contact and CV links, and review the site on desktop and mobile.

## Temporary generated imagery

The placeholder collage is `dist/assets/hero-collage-v2.png`, created with the built-in image generation tool. It is sample imagery, not photographs of Asadbek or documentation of his work. The visible website labels it as a sample. Replace it with a personal photo collage when available.

Generation prompt: Wide 16:9 documentary contact-sheet collage, three irregular rows of workshop, gears, mechanism, code, notebook, camera, campus, landscape, and electronics photographs; thin white gutters, off-white backing, narrow Uzbek ikat textile corners, cool blue/yellow neutrals, no typography or identifiable faces. Temporary placeholder imagery.
