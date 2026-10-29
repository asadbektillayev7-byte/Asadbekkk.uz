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
