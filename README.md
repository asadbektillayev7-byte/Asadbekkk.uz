# Asadbek’s personal website

A personal portfolio for Asadbek’s mechanical engineering interests, software, experiences, and photography. The design uses bold sans-serif typography, graphite, cobalt, and lime accents, with varied layouts for projects, a timeline, community work, and photographs.

The navigation name **Asadbek** opens an **About me** post in a dialog. There is no separate About section. The page moves from the introduction to selected projects, experience and community, recognition, photography, and contact. Media and statistics are not standalone sections in this version.

Credentials and personal material that have not been supplied remain clearly marked placeholders. No awards, statistics, skills, schools, employers, project outcomes, or personal photographs are invented.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000> in your browser. Stop the preview with Control+C. This is a static website with no build step, database, or account required.

## Edit your content

All editable content is in `dist/content.js`, in the `window.CV_CONTENT` object. Keep its field names, commas, and quotation marks intact. Replace placeholder entries with your real information; remove unused entries from their arrays.

- `profile`: name, `heroTitle`, `heroLine`, introduction, portrait, location, contact details, CV, and social links. Empty links stay unavailable until a real destination is added.
- `aboutPost`: the post opened by clicking the navigation name. Edit its `eyebrow`, `title`, `lead`, and `paragraphs`. Add your own portrait with `portraitSrc` and descriptive `portraitAlt`.
- `projects`: mechanical, software, and integrated work. Give each project an accurate title, category, description, and current `status`. Replace `Content to add` when real information is present. Describe your role, process, and result. State clearly whether work is planned, in progress, a simulation, or working hardware/software.
- `experiences` and `education`: roles, organizations, dates, locations, and short explanations of your contribution or learning.
- `communities`: volunteering, leadership, extracurricular activities, and collaboration. Explain your own role and contribution.
- `achievements`: real awards, competitions, qualifications, or milestones for the recognition area. Add the organization, date, description, and an optional image. Only include entries that apply to you.
- `photography`: your own photographs and captions. Each entry has `id`, `title`, `caption`, `imageSrc`, and `imageAlt`. Empty image paths display designed placeholders. Captions can explain the place, subject, or reason you took the photograph.
- `skillGroups` and `languages`: supporting information shown in the education and toolkit panel. Add only details that accurately describe you.

Older fields such as `roles`, `aboutStats`, `communityStats`, `places`, `mediaStats`, `videos`, `mediaLinks`, `article`, `outlets`, `hobbies`, `facts`, and `availability` are retained for compatibility. They are not rendered in the current page. You can keep them for future use; unknown figures should remain an em dash.

Optional achievement and community links use objects with `label` and `url` fields, for example:

```js
links: [{ label: "View certificate", url: "https://example.com/certificate" }]
```

## Add photographs, project images, and your CV

Place files in `dist/assets/` and use paths relative to the public website root:

```js
portraitSrc: "assets/asadbek-portrait.jpg",
portraitAlt: "Portrait of Asadbek",
cvUrl: "assets/asadbek-cv.pdf"
```

Set a project’s `imageSrc` to a path such as `assets/project-prototype.jpg`. For photography, use an entry like:

```js
{
  id: "photograph-01",
  title: "A title for your photograph",
  caption: "Your own short description of this photograph.",
  imageSrc: "assets/photograph-01.jpg",
  imageAlt: "A clear description of what the photograph shows"
}
```

Replace the temporary collage and empty portrait/photo slots with your own images when ready. Use images you own or have permission to publish. Keep alternative text descriptive, and review crops on desktop and mobile.

The layout is in `dist/index.html`, styling in `dist/styles.css`, and rendering and interactions in `dist/app.js`.

## Hosted version

The existing private preview is [Asadbek’s personal website](https://asadbek-in-motion.fuzzybetta33.chatgpt.site). The source folder and preview address are retained for this redesign. Local edits appear there after the updated `dist/` files are uploaded through Sites; editing a file locally does not update the hosted version automatically.

Publish the contents of `dist/` as a static website. No environment variables or secrets are needed. The `.openai/` source manifest is private Sites packaging metadata and belongs outside the public `dist/` directory. Keep deployment credentials out of all website files.

Before sharing with universities, replace or remove placeholders, add your actual contact and CV links, and review the site on desktop and mobile.

## Temporary generated imagery

The placeholder collage is `dist/assets/hero-collage-v2.png`, created with the built-in image generation tool. It is sample imagery, not photographs of Asadbek or documentation of his work. The visible website labels it as a sample. Replace it with personal photographs when available.

Generation prompt: Wide 16:9 documentary contact-sheet collage, three irregular rows of workshop, gears, mechanism, code, notebook, camera, campus, landscape, and electronics photographs; thin white gutters, off-white backing, narrow Uzbek ikat textile corners, cool blue/yellow neutrals, no typography or identifiable faces. Temporary placeholder imagery.
