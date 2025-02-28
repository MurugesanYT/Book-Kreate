export interface Book {
  id: string;
  userId: string;
  title: string;
  type: string; // Fiction, Non-Fiction, Children's Book, Poetry
  category: string;
  chapterCount: number;
  coverImageUrl?: string;
  coverDescription?: string;
  bookDescription?: string;
  endPageContent?: string;
  chapters: Chapter[];
  authorName: string;
  acknowledgements?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  status: 'draft' | 'in-progress' | 'completed';
}

export interface Chapter {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  wordCount?: number;
  status: 'incomplete' | 'generating' | 'completed';
  order: number;
}

export interface BookFormData {
  title: string;
  type: string;
  category: string;
  chapterCount: number;
  authorName: string;
  acknowledgements: string;
}
