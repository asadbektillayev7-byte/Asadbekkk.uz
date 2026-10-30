/* Display name, chosen photograph, and editable project slots. */
window.HOME_CONTENT = {
  name: 'Asadbek', introName: 'ASADBEK', title: 'PORTFOLIO', initialPhoto: 0,
  photos: [{src: 'assets/cutouts/cutout-2.webp', alt: 'Asadbek facing the camera in a white collared shirt', label: 'A portrait', focus: [.51,.34,.25,.30]}]
};
window.PERSONAL_CONTENT = {
  projects: [
    {
      id: 'mechanical', kind: 'Mechanical · project slot', title: 'Something that moves.',
      summary: 'A space for a mechanical project. The real story, sketches, and results will go here when they are ready.',
      prompts: ['What was the question or problem?', 'What did I make, and what was my part?', 'Add sketches, a prototype or simulation, and what I learned.']
    },
    {
      id: 'software', kind: 'Software · project slot', title: 'An idea, on screen.',
      summary: 'A space for a software experiment. A small useful tool, a playful idea, or something I made while learning.',
      prompts: ['What did I want this to do?', 'What did I build, and where did I use AI or other help?', 'Add screenshots, a working link or source, and what I learned.']
    },
    {
      id: 'research', kind: 'Research · in preparation', title: 'A question worth following.',
      summary: 'Research is on the way. The question, my contribution, and any findings will be added as the work develops.',
      prompts: ['What question am I investigating?', 'Describe the method and my contribution.', 'Add findings and references when there are results to share.']
    }
  ]
};

/* Book insights and ratings stay empty until Asadbek supplies them. */
window.SITE_CONTENT = {
  resumePdf: null,
  contacts: {
    email: 'asadbektillayev7@gmail.com',
    twitter: 'https://x.com/AsadbekTillayev',
    linkedin: 'https://www.linkedin.com/in/asadbek-tillayev-7540ab329',
    telegram: 'https://t.me/asadbektillayev'
  },
  books: [
    {
        "id": "atomic-habits",
        "title": "Atomic Habits",
        "author": "James Clear",
        "status": "finished",
        "cover": "assets/books/atomic-habits.jpg",
        "coverAspect": 0.66222,
        "spineColor": "#e9e4d8",
        "ink": "#5a4931",
        "height": 87,
        "thickness": 32,
        "rating": null,
        "insights": "",
        "source": "https://www.penguinrandomhouse.com/books/543993/atomic-habits-by-james-clear/9780735211292/"
    },
    {
        "id": "inequality",
        "title": "This Is What Inequality Looks Like",
        "author": "Teo You Yenn",
        "status": "finished",
        "cover": "assets/books/inequality.png",
        "coverAspect": 0.68213,
        "spineColor": "#e7d76b",
        "ink": "#222c29",
        "height": 86,
        "thickness": 29,
        "rating": null,
        "insights": "",
        "source": "https://www.ethosbooks.com.sg/products/this-is-what-inequality-looks-like"
    },
    {
        "id": "mans-search-for-meaning",
        "title": "Man’s Search for Meaning",
        "author": "Viktor E. Frankl",
        "status": "finished",
        "cover": "assets/books/mans-search-for-meaning.jpg",
        "coverAspect": 0.64667,
        "spineColor": "#e6d9c5",
        "ink": "#333746",
        "height": 80,
        "thickness": 25,
        "rating": null,
        "insights": "",
        "source": "https://www.penguinrandomhouse.com/books/206272/mans-search-for-meaning-beacon-classics-by-viktor-e-frankl/9780807000007/"
    },
    {
        "id": "art-of-thinking-clearly",
        "title": "The Art of Thinking Clearly",
        "author": "Rolf Dobelli",
        "status": "reading",
        "cover": "assets/books/art-of-thinking-clearly.jpg",
        "coverAspect": 0.654,
        "spineColor": "#e4553e",
        "ink": "#fff5dc",
        "height": 87,
        "thickness": 31,
        "rating": null,
        "insights": "",
        "source": "https://www.hodder.co.uk/titles/rolf-dobelli/the-art-of-thinking-clearly/9781444759563/"
    },
    {
        "id": "structure-of-scientific-revolutions",
        "title": "The Structure of Scientific Revolutions",
        "author": "Thomas S. Kuhn",
        "status": "reading",
        "cover": "assets/books/structure-of-scientific-revolutions.jpg",
        "coverAspect": 0.64,
        "spineColor": "#d8d9dc",
        "ink": "#223047",
        "height": 88,
        "thickness": 27,
        "rating": null,
        "insights": "",
        "source": "https://www.bibliovault.org/BV.book.epl?ISBN=9780226458120"
    },
    {
        "id": "1984",
        "title": "1984",
        "author": "George Orwell",
        "status": "finished",
        "cover": "assets/books/1984.jpg",
        "coverAspect": 0.68,
        "spineColor": "#222c2b",
        "ink": "#eee5cd",
        "height": 85,
        "thickness": 30,
        "rating": null,
        "insights": "",
        "source": "https://www.penguinrandomhouse.com/books/326569/1984-by-george-orwell-with-a-foreword-by-thomas-pynchon/9780451524935/"
    },
    {
        "id": "animal-farm",
        "title": "Animal Farm",
        "author": "George Orwell",
        "status": "finished",
        "cover": "assets/books/animal-farm.jpg",
        "coverAspect": 0.68,
        "spineColor": "#c14437",
        "ink": "#f4e9d6",
        "height": 79,
        "thickness": 22,
        "rating": null,
        "insights": "",
        "source": "https://www.penguinrandomhouse.com/books/327220/animal-farm-by-george-orwell-with-a-foreword-by-ann-patchett-and-a-new-introduction-by-tea-obreht/"
    },
    {
        "id": "count-of-monte-cristo",
        "title": "The Count of Monte Cristo",
        "author": "Alexandre Dumas",
        "status": "finished",
        "cover": "assets/books/count-of-monte-cristo.jpg",
        "coverAspect": 0.63111,
        "spineColor": "#273e52",
        "ink": "#dbd3bb",
        "height": 94,
        "thickness": 49,
        "rating": null,
        "insights": "",
        "source": "https://www.penguinrandomhouse.com/books/286345/the-count-of-monte-cristo-by-alexandre-dumas-pere-translated-with-an-introduction-and-notes-by-robin-buss-cover-ilustration-by-coralie-bickford-smith/9780140449266/"
    },
    {
        "id": "outliers",
        "title": "Outliers",
        "author": "Malcolm Gladwell",
        "status": "finished",
        "cover": "assets/books/outliers.jpg",
        "coverAspect": 0.65808,
        "spineColor": "#efede7",
        "ink": "#353b3e",
        "height": 86,
        "thickness": 31,
        "rating": null,
        "insights": "",
        "source": "https://www.gladwellbooks.com/titles/malcolm-gladwell/outliers/9780316017923/"
    },
    {
        "id": "mindset",
        "title": "Mindset",
        "author": "Carol S. Dweck",
        "status": "finished",
        "cover": "assets/books/mindset.jpg",
        "coverAspect": 0.64444,
        "spineColor": "#1c437c",
        "ink": "#f4e4a4",
        "height": 87,
        "thickness": 30,
        "rating": null,
        "insights": "",
        "source": "https://penguinrandomhousehighereducation.com/book/?isbn=9780345472328"
    }
]
};
