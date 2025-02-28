export const SUBSCRIPTION_TIERS = [
  {
    name: 'Explorer',
    price: 'Free',
    features: [
      'Create 1 book per month',
      'Maximum 5 chapters per book',
      'Basic cover page generation',
      'PDF export',
      'Basic editing tools'
    ],
    highlighted: false,
    buttonText: 'Get Started'
  },
  {
    name: 'Writer',
    price: '$9.99',
    features: [
      'Create 5 books per month',
      'Maximum 20 chapters per book',
      'Enhanced cover page generation',
      'PDF export',
      'Advanced editing tools'
    ],
    highlighted: true,
    buttonText: 'Subscribe'
  },
  {
    name: 'Author',
    price: '$19.99',
    features: [
      'Create 15 books per month',
      'Unlimited chapters per book',
      'Premium text generation',
      'Advanced cover page customization',
      'PDF/EPUB/MOBI export',
      'AI editing tools'
    ],
    highlighted: false,
    buttonText: 'Subscribe'
  },
  {
    name: 'Publisher',
    price: '$49.99',
    features: [
      'Unlimited book creation',
      'Collaborative book access',
      'Customizable book templates',
      'Advanced analytics',
      'Priority processing',
      'Commercial use rights'
    ],
    highlighted: false,
    buttonText: 'Subscribe'
  }
];

export const FEATURES = [
  {
    title: 'AI-Generated Book Plans',
    description: 'Generate comprehensive book plans including chapter titles and summaries based on your inputs.',
    icon: '📝'
  },
  {
    title: 'Cover Page Generation',
    description: 'Create stunning cover pages with AI-generated background images based on your book title and category.',
    icon: '🎨'
  },
  {
    title: 'Chapter Content Generation',
    description: 'Generate content for each chapter with appropriate word count based on book type and category.',
    icon: '📚'
  },
  {
    title: 'Interactive Checklist',
    description: 'Track your progress with an interactive checklist showing the status of each book element.',
    icon: '✅'
  },
  {
    title: 'Content Editing',
    description: 'Edit and refine AI-generated content to match your vision and style.',
    icon: '✏️'
  },
  {
    title: 'PDF Export',
    description: 'Export your completed book as a professionally formatted PDF document.',
    icon: '📄'
  }
];

export const BOOK_TYPES = [
  'Fiction',
  'Non-Fiction',
  'Children\'s Book',
  'Poetry'
];

export const SAMPLE_EXCERPTS = [
  {
    title: 'The Midnight Oracle',
    type: 'Fiction',
    excerpt: 'The moonlight cascaded through the stained-glass windows, painting the ancient library floor in a kaleidoscope of colors. Elara traced her fingers along the spines of forgotten tomes, feeling the whispers of a thousand stories beneath her fingertips. The Midnight Oracle was waiting, hidden among these shelves for centuries, and tonight she would finally uncover its secrets.',
    author: 'Alexandra Rivers'
  },
  {
    title: 'Understanding Quantum Computing',
    type: 'Non-Fiction',
    excerpt: 'Quantum computing represents a paradigm shift in how we process information. Unlike classical bits that exist in a state of either 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously through a phenomenon known as superposition. This fundamental difference enables quantum computers to solve certain problems exponentially faster than their classical counterparts.',
    author: 'Dr. Robert Chen'
  },
  {
    title: 'The Adventures of Luna the Brave',
    type: 'Children\'s Book',
    excerpt: 'Luna wasn\'t like the other fireflies. Her light shone in all the colors of the rainbow, while everyone else glowed a simple yellow. "Why can\'t I be normal?" she asked her mother one evening. "Because you\'re meant to light up the world in your own special way," her mother replied with a smile. Little did Luna know that her unique light would soon save the entire forest.',
    author: 'Marcus Johnson'
  }
];