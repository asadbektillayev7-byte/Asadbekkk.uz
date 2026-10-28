# Asadbek’s personal website

A first version of a personal portfolio for mechanical engineering, software, photography, and life beyond projects. The project and experience entries are clearly marked placeholders. They do not claim completed work or achievements.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000> in your browser. Stop the preview with Control+C.

The website is static: there is no build step, database, or account required.

## Make it yours

Edit `dist/content.js` to replace the profile, three project entries, experience entries, and photographs. Keep the field names and quotation marks intact. The site reads the `window.PORTFOLIO_CONTENT` object when it loads.

- **Profile:** update `name` and `intro`. Add an email address, CV file path, and GitHub URL when ready. Set `portraitSrc` and `portraitAlt` to add your portrait. Leave optional links and images empty until you have real content. The empty `location` field is reserved for later and is not currently displayed.
- **Projects:** add your actual role, dates, tools, and project story. Describe the question, your process, and the real outcome. State clearly when something is a simulation or work in progress. Set `imageSrc` and `imageAlt` to replace each project illustration. Add `demoUrl` and `repoUrl` when available. Change `status` from `Placeholder` only after replacing its content.
- **Experience:** replace the organization, dates, and short description. Set `placeholder` to `false` after adding a real entry.
- **Photographs:** set `imageSrc` and `alt`, replace the title and caption, then set `placeholder` to `false`.

Place your photographs, project images, and CV in `dist/assets/`. Use paths relative to the website root, such as `assets/my-photo.jpg` or `assets/asadbek-cv.pdf`. For example, a photo entry can use:

```js
imageSrc: "assets/my-photo.jpg",
alt: "A short description of what the photograph shows",
placeholder: false
```

The site automatically displays images when you add these paths; no changes to `app.js` are needed. Empty image fields keep the existing illustrations. Use descriptive alternative text for every real photograph.

The main page layout and additional introduction/about text are in `dist/index.html`. The profile introduction and content lists live in `dist/content.js`. Styling is in `dist/styles.css`, and interactive behavior is in `dist/app.js`.

## Deployment

Planned hosted preview, publication pending: [Asadbek in Motion](https://asadbek-in-motion.fuzzybetta33.chatgpt.site).

Publish the contents of `dist/` as a static website. No environment variables or secrets are needed. The `.openai/` source manifest is private Sites packaging metadata and belongs outside the public `dist/` directory. Keep any deployment credentials out of the website files.

Before sharing the site with universities, replace or remove the placeholder content, add your actual contact and CV links, and review the site on a phone.
