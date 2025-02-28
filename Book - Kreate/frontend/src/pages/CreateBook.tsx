import { useUserGuardContext } from "app";
import { useUserStore } from "../utils/userStore";
import { canCreateBook, updateUserBookCount } from "../utils/bookService";
import { useBookStore } from "../utils/bookStore";
import { BookFormData } from "../utils/bookTypes";
import { BOOK_TYPES } from "../utils/constants";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Book categories by type
const BOOK_CATEGORIES = {
  Fiction: [
    'Fantasy',
    'Science Fiction',
    'Mystery',
    'Thriller',
    'Romance',
    'Historical Fiction',
    'Horror',
    'Adventure',
    'Young Adult',
    'Dystopian',
    'Literary Fiction',
    'Magical Realism'
  ],
  'Non-Fiction': [
    'Biography',
    'Autobiography',
    'Memoir',
    'Self-Help',
    'Business',
    'History',
    'Science',
    'Philosophy',
    'Psychology',
    'Travel',
    'Health & Wellness',
    'Politics'
  ],
  "Children's Book": [
    'Picture Book',
    'Early Readers',
    'Middle Grade',
    'Educational',
    'Bedtime Stories',
    'Adventure',
    'Fantasy',
    'Fairy Tales',
    'Animals',
    'Science',
    'Historical',
    'Mystery'
  ],
  'Poetry': [
    'Lyric Poetry',
    'Narrative Poetry',
    'Sonnet',
    'Haiku',
    'Free Verse',
    'Epic Poetry',
    'Ballad',
    'Ode',
    'Elegy',
    'Concrete Poetry',
    'Slam Poetry',
    'Contemporary'
  ]
};

// Using BookFormData from bookTypes.ts

export default function CreateBook() {
  const { user } = useUserGuardContext();
  const { userProfile, fetchUserProfile } = useUserStore();
  const { createBook } = useBookStore();
  const [isLoading, setIsLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    type: BOOK_TYPES[0],
    category: BOOK_CATEGORIES[BOOK_TYPES[0] as keyof typeof BOOK_CATEGORIES][0],
    chapterCount: 3,
    authorName: '',
    acknowledgements: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      await fetchUserProfile(user.uid);
      
      // Check if user can create a book
      const result = await canCreateBook(user.uid);
      setCanCreate(result.canCreate);
      
      if (!result.canCreate && result.reason) {
        setErrorMessage(result.reason);
      }
      
      setIsLoading(false);
    };
    
    loadProfile();
  }, [user.uid, fetchUserProfile]);

  useEffect(() => {
    // When type changes, update category to first one for that type
    if (formData.type) {
      setFormData(prev => ({
        ...prev,
        category: BOOK_CATEGORIES[formData.type as keyof typeof BOOK_CATEGORIES][0]
      }));
    }
  }, [formData.type]);

  useEffect(() => {
    // Pre-fill author name if profile has display name
    if (userProfile?.displayName) {
      setFormData(prev => ({
        ...prev,
        authorName: userProfile.displayName || ''
      }));
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreate) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the book in Firestore
      const bookId = await createBook({
        userId: user.uid,
        title: formData.title,
        type: formData.type,
        category: formData.category,
        chapterCount: formData.chapterCount,
        authorName: formData.authorName,
        acknowledgements: formData.acknowledgements,
        coverImageUrl: '',
        chapters: [], // This will be created by bookStore based on chapterCount
        status: 'draft'
      });
      
      // Update the user's book count
      await updateUserBookCount(user.uid);
      
      // Redirect to dashboard for now (will redirect to book page in future)
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating book:', error);
      setErrorMessage('There was an error creating your book. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    // Apply subscription tier limits
    let maxChapters = 999; // Default high number
    
    if (userProfile) {
      switch(userProfile.subscriptionTier.toLowerCase()) {
        case 'explorer':
          maxChapters = 5;
          break;
        case 'writer':
          maxChapters = 20;
          break;
        case 'author':
        case 'publisher':
          maxChapters = 999; // Unlimited
          break;
      }
    }
    
    const limitedValue = Math.min(Math.max(1, numValue), maxChapters);
    
    setFormData(prev => ({
      ...prev,
      [name]: limitedValue
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="mt-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mt-3"></div>
              <div className="h-64 bg-gray-200 rounded w-full mx-auto mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span 
              className="text-2xl font-serif font-bold text-indigo-700 cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
              Book Kreate
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {userProfile?.displayName || user.displayName || user.email}
            </button>
            <button 
              onClick={() => navigate("/logout")}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Create New Book</h1>
            <p className="text-gray-600">Enter the details for your new book below.</p>
          </div>
          
          {!canCreate && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {errorMessage || 'You cannot create more books at this time.'}
                  </p>
                  <p className="mt-2 text-sm">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="text-yellow-700 font-medium underline"
                    >
                      Return to dashboard
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={!canCreate}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Book Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={!canCreate}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {BOOK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Book Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={!canCreate}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {formData.type && BOOK_CATEGORIES[formData.type as keyof typeof BOOK_CATEGORIES]?.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="chapterCount" className="block text-sm font-medium text-gray-700">
                  Number of Chapters <span className="text-red-500">*</span>
                  {userProfile?.subscriptionTier === 'Explorer' && (
                    <span className="text-xs text-gray-500 ml-2">(Max 5 for Explorer tier)</span>
                  )}
                  {userProfile?.subscriptionTier === 'Writer' && (
                    <span className="text-xs text-gray-500 ml-2">(Max 20 for Writer tier)</span>
                  )}
                </label>
                <input
                  type="number"
                  id="chapterCount"
                  name="chapterCount"
                  min="1"
                  max={userProfile?.subscriptionTier === 'Explorer' ? 5 : userProfile?.subscriptionTier === 'Writer' ? 20 : 999}
                  required
                  value={formData.chapterCount}
                  onChange={handleNumberChange}
                  disabled={!canCreate}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    name="authorName"
                    required
                    value={formData.authorName}
                    onChange={handleInputChange}
                    disabled={!canCreate}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="acknowledgements" className="block text-sm font-medium text-gray-700">
                  Acknowledgements
                </label>
                <textarea
                  id="acknowledgements"
                  name="acknowledgements"
                  rows={3}
                  value={formData.acknowledgements}
                  onChange={handleInputChange}
                  disabled={!canCreate}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Optional acknowledgements to include in your book"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canCreate || isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}