# Asadbek — Personal Space

A static personal website with a two-screen landing and separate Works, Reading, Personal, and Reach pages.

## Landing

`dist/index.html` contains only the Asadbek / Portfolio opening and a neighboring screen titled **Little about me**. Arrows, swipe, and keyboard move horizontally between them. Neither screen adds vertical page length. Only the original first portrait (`cutout-2.webp`, white collared shirt) is used. The name links back to the landing.

## Navigation

**Works → Reading → Resume → Personal → Reach**

Works retains the project filters and honest project placeholders. Personal contains photography placeholders. Reach shows four linked names only: Email, Twitter, LinkedIn, Telegram, using the supplied contact destinations. There are no duplicate footer labels, link numbers, visible handles, or Get in touch footer.

Resume has no HTML page or generated placeholder PDF. Until the real PDF is supplied, clicking the control announces that the PDF is coming soon. When supplied, copy it into `dist/assets/` and set `SITE_CONTENT.resumePdf` in `dist/content.js` to its relative path. The navigation then uses a native direct link to the PDF.

## Reading bookshelf

The Reading page recreates the upright spine-to-cover accordion interaction of the Artspace reference. CSS 3D volumes have front covers, spines, page edges and thickness; selected books rotate open and their neighbors shift. It supports clicks, arrows, keyboard, horizontal swipes and wheel movement. Selected covers open a notes dialog. No large Reading Room header is shown.

The fifteen current books are clearly marked sample covers, not reading-history claims. Real books belong in `SITE_CONTENT.books` in `dist/content.js`:

```js
{
  id: 'unique-book-id',
  title: 'Actual title',
  author: 'Actual author',
  cover: 'assets/books/cover.jpg',
  spineColor: '#344d8c',
  ink: '#f5efe0',
  height: 90,
  thickness: 32,
  rating: 4.5,
  notes: 'Asadbek’s supplied thoughts.'
}
```

Ratings are author-supplied display data on a 1–5 scale, including half stars. The badge sits in the upper-right cover corner. Unrated samples show **★ —**. There is no visitor voting or fabricated rating.

## Files

- `index.html`, `landing.js`, `app.js`, `portrait.js`: landing screens and opening.
- `works.html`, `personal.html`, `reading.html`, `contact.html`: separate destinations.
- `site.js`: shared menu, direct-PDF configuration, notices, project dialogs.
- `bookshelf.js`, `bookshelf.css`: book models, accordion interaction and ratings.
- `content.js`: name, portrait, project slots, resume path, contacts and books.
- `styles.css`, `sections.css`, `pages.css`: shared appearance and responsive layouts.

Preview with `python3 -m http.server 4173 --directory dist`. No build or database.

Hosted private preview: https://asadbek-in-motion.fuzzybetta33.chatgpt.site

Design references: https://demo.codeandchill.store/portfolio/#home and https://dribbble.com/shots/23071484-Artspace-Book-Slider-Animation. Reference media, template branding, and actual book covers are not included.
