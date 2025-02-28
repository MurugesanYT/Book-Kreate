import { create } from 'zustand';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';
import { Book, Chapter } from './bookTypes';

interface BookStore {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  fetchBooks: (userId: string) => Promise<void>;
  getBook: (bookId: string) => Promise<Book | null>;
  createBook: (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBook: (bookId: string, bookData: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateChapter: (bookId: string, chapterId: string, chapterData: Partial<Chapter>) => Promise<void>;
  clearError: () => void;
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  isLoading: false,
  error: null,

  fetchBooks: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const booksQuery = query(
        collection(db, 'books'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(booksQuery);
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];

      set({ books, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching books:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  getBook: async (bookId: string) => {
    try {
      const bookDoc = await getDoc(doc(db, 'books', bookId));
      if (bookDoc.exists()) {
        return { id: bookDoc.id, ...bookDoc.data() } as Book;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting book:', error);
      set({ error: error.message });
      return null;
    }
  },

  createBook: async (bookData) => {
    set({ isLoading: true, error: null });
    try {
      // Create empty chapter objects based on chapterCount
      const chapters: Chapter[] = [];
      
      for (let i = 0; i < bookData.chapterCount; i++) {
        chapters.push({
          id: `chapter-${i+1}`,
          title: `Chapter ${i+1}`,
          summary: '',
          content: '',
          wordCount: 0,
          status: 'incomplete',
          order: i + 1
        });
      }
      
      // Create the new book document
      const newBookData = {
        ...bookData,
        chapters,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'draft'
      };
      
      const docRef = await addDoc(collection(db, 'books'), newBookData);
      
      // Update local state
      const { books } = get();
      set({
        books: [{ id: docRef.id, ...newBookData } as Book, ...books],
        isLoading: false
      });
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating book:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateBook: async (bookId, bookData) => {
    set({ isLoading: true, error: null });
    try {
      const bookRef = doc(db, 'books', bookId);
      await updateDoc(bookRef, {
        ...bookData,
        updatedAt: Timestamp.now()
      });

      // Update local state
      const { books } = get();
      const updatedBooks = books.map(book => 
        book.id === bookId ? { ...book, ...bookData, updatedAt: new Date().toISOString() } : book
      );
      
      set({ books: updatedBooks, isLoading: false });
    } catch (error: any) {
      console.error('Error updating book:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  deleteBook: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'books', bookId));

      // Update local state
      const { books } = get();
      set({
        books: books.filter(book => book.id !== bookId),
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error deleting book:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  updateChapter: async (bookId, chapterId, chapterData) => {
    try {
      const bookRef = doc(db, 'books', bookId);
      const bookDoc = await getDoc(bookRef);
      
      if (!bookDoc.exists()) {
        throw new Error('Book not found');
      }
      
      const bookData = bookDoc.data() as Book;
      const updatedChapters = bookData.chapters.map(chapter => 
        chapter.id === chapterId ? { ...chapter, ...chapterData } : chapter
      );
      
      await updateDoc(bookRef, {
        chapters: updatedChapters,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      const { books } = get();
      const updatedBooks = books.map(book => {
        if (book.id === bookId) {
          const updatedBook = {...book};
          updatedBook.chapters = updatedBook.chapters.map(chapter => 
            chapter.id === chapterId ? { ...chapter, ...chapterData } : chapter
          );
          updatedBook.updatedAt = new Date().toISOString();
          return updatedBook;
        }
        return book;
      });
      
      set({ books: updatedBooks });
    } catch (error: any) {
      console.error('Error updating chapter:', error);
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null })
}));
