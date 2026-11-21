/* Asadbek’s reading list. Personal insights and ratings come from content.js. */
(() => {
  'use strict';

  function initBookshelf() {
    const shelf = document.getElementById('book-shelf');
    if (!shelf || shelf.dataset.ready === 'true') return;
    shelf.dataset.ready = 'true';

    const swatches = [
      ['#daa0bc', '#653b57'], ['#2b784f', '#f7edc8'], ['#e3decc', '#393e31'],
      ['#d6e6ed', '#167bb4'], ['#3d4541', '#f0cad6'], ['#f2cf5c', '#875f31'],
      ['#bb7893', '#f7dba6'], ['#344d8c', '#d0d4e1'], ['#e5575c', '#681e2e'],
      ['#c7dfe4', '#415e69'], ['#c3beb0', '#414038'], ['#f3d461', '#896e39'],
      ['#263f69', '#f2eccd'], ['#b0a4b4', '#403b46'], ['#53564b', '#e4dfd0']
    ];
    const heights = [86, 79, 81, 87, 86, 82, 90, 85, 96, 92, 85, 91, 78, 84, 87];
    const thicknesses = [34, 28, 20, 37, 27, 38, 27, 31, 23, 34, 37, 32, 25, 31, 40];
    const supplied = window.SITE_CONTENT && window.SITE_CONTENT.books;
    const isSample = !Array.isArray(supplied) || supplied.length === 0;
    const books = isSample ? swatches.map((colors, index) => ({
      id: `sample-${index + 1}`,
      title: 'Title to add', author: 'Author to add', cover: '',
      spineColor: colors[0], ink: colors[1], height: heights[index],
      thickness: thicknesses[index], notes: 'The real book title, cover, and my thoughts will be added here.',
      rating: null, sample: true
    })) : supplied.map((book, index) => ({
      ...book, id: book.id || `book-${index + 1}`, title: book.title || 'Title to add',
      author: book.author || '', cover: book.cover || '',
      spineColor: book.spineColor || swatches[index % swatches.length][0],
      ink: book.ink || swatches[index % swatches.length][1],
      height: Number(book.height) || heights[index % heights.length],
      thickness: Number(book.thickness) || thicknesses[index % thicknesses.length],
      rating: normalizeRating(book.rating),
      status: book.status === 'reading' ? 'reading' : 'finished',
      insights: typeof book.insights === 'string' ? book.insights : (book.notes || '')
    }));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const title = document.getElementById('book-title');
    const author = document.getElementById('book-author');
    const status = document.getElementById('book-status');
    const note = document.getElementById('book-note');
    const counter = document.getElementById('book-counter');
    const live = document.getElementById('book-live');
    const previous = document.getElementById('book-prev');
    const next = document.getElementById('book-next');
    const dialog = document.getElementById('book-detail-dialog');
    const buttons = [];
    const track = document.createElement('div');
    track.className = 'book-shelf-track';
    let selectedIndex = 0;
    let centerTimer = 0;
    let pointerStart = null;
    let wasDragging = false;
    let wheelUntil = 0;

    function normalizeRating(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return null;
      return Math.round(Math.max(1, Math.min(5, value)) * 2) / 2;
    }

    function ratingText(book) {
      return book.rating === null ? 'Not rated yet' : `${book.rating}/5`;
    }

    function ratingBadge(book) {
      const badge = element('span', 'book-rating', book.rating === null ? '★ —' : `★ ${book.rating}/5`);
      badge.title = `My rating: ${ratingText(book)}`;
      return badge;
    }

    function element(tag, className, text) {
      const result = document.createElement(tag);
      if (className) result.className = className;
      if (text !== undefined) result.textContent = text;
      return result;
    }

    function placeholderArt(book, index) {
      const art = element('span', 'book-placeholder-art');
      const kicker = element('span', 'cover-kicker');
      kicker.append(element('span', '', book.sample ? 'Sample cover' : 'Reading room'), element('span', '', String(index + 1).padStart(2, '0')));
      art.append(kicker);
      const coverTitle = element('span', 'cover-title', book.sample ? 'Title\nto add' : book.title);
      coverTitle.style.whiteSpace = 'pre-line';
      art.append(coverTitle, element('span', 'cover-author', book.sample ? 'Author to add' : book.author), element('span', 'cover-shape'));
      const footer = element('span', 'cover-footer');
      footer.append(element('span', '', 'Asadbek’s shelf'), element('span', '', book.sample ? 'Cover to come' : 'My reading room'));
      art.append(footer);
      return art;
    }

    books.forEach((book, index) => {
      const button = element('button', 'shelf-book');
      button.type = 'button';
      button.dataset.bookIndex = String(index);
      button.dataset.bookId = book.id;
      button.dataset.readingStatus = book.status;
      button.style.setProperty('--book-color', book.spineColor);
      button.style.setProperty('--book-ink', book.ink);
      button.style.setProperty('--book-height', `${Math.max(63, Math.min(100, book.height))}%`);
      if (Number.isFinite(book.coverAspect) && book.coverAspect > 0) {
        const scale = Math.max(63, Math.min(100, book.height)) / 100 * book.coverAspect;
        button.style.setProperty('--book-cover-width', `calc(var(--shelf-height) * ${scale})`);
      }
      button.style.setProperty('--book-thickness', `${Math.max(20, Math.min(60, book.thickness))}px`);
      button.style.setProperty('--book-lean', `${index === 8 ? 2 : index === 12 ? -3 : 0}deg`);
      button.setAttribute('aria-label', bookLabel(book, index, false));
      button.title = book.sample ? `Sample book ${index + 1}` : book.title;
      button.setAttribute('aria-pressed', 'false');
      const volume = element('span', 'book-volume');
      volume.setAttribute('aria-hidden', 'true');
      const front = element('span', 'book-face book-front');
      if (book.cover) {
        const cover = document.createElement('img');
        cover.src = book.cover;
        cover.alt = '';
        cover.loading = index === selectedIndex ? 'eager' : 'lazy';
        cover.decoding = 'async';
        cover.addEventListener('error', () => front.replaceChildren(placeholderArt(book, index)), { once: true });
        front.append(cover);
      } else front.append(placeholderArt(book, index));
      const spine = element('span', 'book-face book-spine');
      spine.append(element('span', 'book-spine-title', book.sample ? `BOOK ${String(index + 1).padStart(2, '0')}` : book.title), element('span', 'book-spine-number', book.sample ? 'COVER TO COME' : book.author));
      volume.append(front, spine, element('span', 'book-face book-pages'), element('span', 'book-face book-top'));
      button.append(volume);
      button.addEventListener('click', event => {
        if (wasDragging) { event.preventDefault(); return; }
        if (index === selectedIndex) openBook(button);
        else selectBook(index, false, true);
      });
      button.addEventListener('keydown', event => {
        let targetIndex = null;
        if (event.key === 'ArrowRight') targetIndex = (selectedIndex + 1) % books.length;
        else if (event.key === 'ArrowLeft') targetIndex = (selectedIndex - 1 + books.length) % books.length;
        else if (event.key === 'Home') targetIndex = 0;
        else if (event.key === 'End') targetIndex = books.length - 1;
        if (targetIndex !== null) {
          event.preventDefault();
          selectBook(targetIndex, true, true);
        }
      });
      buttons.push(button);
      track.append(button);
    });
    shelf.replaceChildren(track);
    shelf.dataset.sample = String(isSample);

    function centerSelected(animate = true) {
      const button = buttons[selectedIndex];
      if (!button) return;
      const shelfBox = shelf.getBoundingClientRect();
      const bookBox = button.getBoundingClientRect();
      const left = shelf.scrollLeft + bookBox.left - shelfBox.left - (shelf.clientWidth - bookBox.width) * .5;
      shelf.scrollTo({ left: Math.max(0, left), behavior: animate && !reducedMotion.matches ? 'smooth' : 'auto' });
    }

    function selectBook(index, focus = false, announce = false) {
      selectedIndex = Math.max(0, Math.min(books.length - 1, index));
      const book = books[selectedIndex];
      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === selectedIndex;
        button.setAttribute('aria-pressed', String(active));
        button.tabIndex = active ? 0 : -1;
        button.setAttribute('aria-label', bookLabel(books[buttonIndex], buttonIndex, active));
      });
      shelf.dataset.selected = String(selectedIndex);
      if (title) title.textContent = book.sample ? `Book ${String(selectedIndex + 1).padStart(2, '0')} · cover placeholder` : book.title;
      if (author) author.textContent = book.sample ? 'A space for a book I’ve read.' : book.author;
      if (status) status.textContent = book.status === 'reading' ? 'Reading now' : 'Finished';
      if (note) note.textContent = isSample ? 'Sample covers for now. My books and notes are coming soon.' : 'Open the selected cover for my insights.';
      if (counter) counter.textContent = `${String(selectedIndex + 1).padStart(2, '0')} / ${String(books.length).padStart(2, '0')}`;
      if (announce && live) live.textContent = book.sample ? `Sample book ${selectedIndex + 1} selected. Its real title has not been added yet.` : `${book.title}${book.author ? ` by ${book.author}` : ''} selected.`;
      if (focus) buttons[selectedIndex].focus({ preventScroll: true });
      window.clearTimeout(centerTimer);
      window.requestAnimationFrame(() => centerSelected(announce));
      centerTimer = window.setTimeout(() => centerSelected(announce), reducedMotion.matches ? 0 : 790);
    }

    function bookLabel(book, index, active) {
      const name = book.sample ? `Sample book ${index + 1}` : `${book.title}${book.author ? ` by ${book.author}` : ''}`;
      return `${name}. ${book.status === 'reading' ? 'Reading now' : 'Finished'}. ${active ? 'Cover selected. Open my insights.' : 'Show cover.'}`;
    }

    function openBook(opener) {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      const book = books[selectedIndex];
      const fields = {
        'book-detail-title': book.sample ? `Book ${String(selectedIndex + 1).padStart(2, '0')} — a place on the shelf` : book.title,
        'book-detail-author': book.sample ? 'Title and author to add' : book.author,
        'book-detail-status': book.status === 'reading' ? 'Reading now' : 'Finished',
        'book-detail-notes': book.insights || 'My insights are coming soon.'
      };
      Object.entries(fields).forEach(([id, value]) => {
        const target = document.getElementById(id);
        if (target) target.textContent = value;
      });
      const notes = document.getElementById('book-detail-notes');
      if (notes) notes.classList.toggle('insights-pending', !book.insights);
      const source = document.getElementById('book-detail-source');
      if (source) {
        const validSource = typeof book.source === 'string' && /^https:\/\//.test(book.source);
        source.hidden = !validSource;
        if (validSource) source.href = book.source;
        else source.removeAttribute('href');
      }
      if (!dialog.open) {
        dialog.showModal();
        document.body.classList.add('dialog-open');
      }
      dialog.addEventListener('close', () => {
        document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]')));
        opener.focus({ preventScroll: true });
      }, { once: true });
    }

    if (previous) previous.addEventListener('click', () => selectBook((selectedIndex - 1 + books.length) % books.length, false, true));
    if (next) next.addEventListener('click', () => selectBook((selectedIndex + 1) % books.length, false, true));

    shelf.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      wasDragging = false;
    });
    shelf.addEventListener('pointermove', event => {
      if (!pointerStart || event.pointerId !== pointerStart.id) return;
      const horizontal = Math.abs(event.clientX - pointerStart.x);
      const vertical = Math.abs(event.clientY - pointerStart.y);
      if (horizontal > 12 && horizontal > vertical * 1.25) wasDragging = true;
    });
    shelf.addEventListener('pointerup', event => {
      if (!pointerStart || event.pointerId !== pointerStart.id) return;
      const delta = event.clientX - pointerStart.x;
      const vertical = Math.abs(event.clientY - pointerStart.y);
      if (Math.abs(delta) > 35 && Math.abs(delta) > vertical * 1.25) {
        selectBook((selectedIndex + (delta < 0 ? 1 : -1) + books.length) % books.length, false, true);
      }
      pointerStart = null;
      window.setTimeout(() => { wasDragging = false; }, 0);
    });
    shelf.addEventListener('pointercancel', () => { pointerStart = null; wasDragging = false; });
    shelf.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 8) return;
      event.preventDefault();
      const now = Date.now();
      if (now < wheelUntil) return;
      wheelUntil = now + 650;
      selectBook((selectedIndex + (event.deltaX > 0 ? 1 : -1) + books.length) % books.length, false, true);
    }, { passive: false });
    window.addEventListener('resize', () => {
      centerSelected(false);
      window.clearTimeout(centerTimer);
      centerTimer = window.setTimeout(() => centerSelected(false), reducedMotion.matches ? 0 : 790);
    }, { passive: true });
    selectBook(selectedIndex);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => centerSelected(false));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBookshelf, { once: true });
  else initBookshelf();
})();
