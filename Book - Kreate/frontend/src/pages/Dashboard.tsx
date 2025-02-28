import { useUserGuardContext } from "app";
import { useUserStore } from "../utils/userStore";
import { useBookStore } from "../utils/bookStore";
import { Book } from "../utils/bookTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useUserGuardContext();
  const { userProfile, fetchUserProfile } = useUserStore();
  const { books, fetchBooks, isLoading: booksLoading, error: booksError } = useBookStore();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user profile
        if (user.isAnonymous) {
          // Create a temporary profile for anonymous users
          // This won't be saved to Firestore, just used for UI
        } else {
          await fetchUserProfile(user.uid);
        }
        
        // Load user's books
        await fetchBooks(user.uid);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user.uid, user.isAnonymous, fetchUserProfile, fetchBooks]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
            <span className="text-2xl font-serif font-bold text-indigo-700">Book Kreate</span>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Your Books</h1>
          <button 
            onClick={() => navigate("/create-book")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create New Book
          </button>
        </div>

        {/* Books remaining status */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-semibold text-gray-900">Subscription Status</h2>
              {user.isAnonymous ? (
                <p className="text-gray-600">
                  You are currently using <span className="font-medium text-indigo-600">Guest</span> mode.
                  <span className="block mt-1 text-sm text-amber-600">
                    <a href="/signup" className="underline">Sign up</a> to save your books and access more features.
                  </span>
                </p>
              ) : (
                <p className="text-gray-600">
                  You are currently on the <span className="font-medium text-indigo-600">{userProfile?.subscriptionTier || 'Explorer'}</span> plan.
                </p>
              )}
            </div>
            <div className="text-right">
              {user.isAnonymous ? (
                <p className="text-gray-600">Books allowed: <span className="font-medium text-indigo-600">1</span></p>
              ) : (
                <>
                  <p className="text-gray-600">Books remaining this month: <span className="font-medium text-indigo-600">{userProfile?.booksRemaining || 0}</span></p>
                  <p className="text-sm text-gray-500">Resets on {userProfile?.nextResetDate ? new Date(userProfile.nextResetDate).toLocaleDateString() : 'N/A'}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {books.length === 0 ? (
          // Empty state
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-3xl mx-auto mb-4">📚</div>
            <h3 className="text-xl font-serif font-semibold mb-2">You don't have any books yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first book by clicking the button below. You can generate fiction, non-fiction, children's books, and poetry.</p>
            <button 
              onClick={() => navigate("/create-book")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Book
            </button>
          </div>
        ) : (
          // Book list
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: Book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="h-40 bg-indigo-100 flex items-center justify-center relative"
                  style={book.coverImageUrl ? { backgroundImage: `url(${book.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  {!book.coverImageUrl && (
                    <div className="text-indigo-300 text-5xl">📖</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white text-lg font-serif font-bold truncate">{book.title}</h3>
                    <p className="text-white/90 text-sm truncate">{book.type} - {book.category}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">{book.chapters.length} chapters</div>
                    <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 capitalize">{book.status}</div>
                  </div>
                  <div className="mb-3">
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600" 
                        style={{ width: `${Math.round((book.chapters.filter(ch => ch.status === 'completed').length / book.chapters.length) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(book.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate(`/book-details?id=${book.id}`)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Open →
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Book Card */}
            <div 
              onClick={() => navigate('/create-book')} 
              className="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-50 transition-colors h-64"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 text-2xl mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-medium text-gray-900 mb-1">Create New Book</h3>
              <p className="text-sm text-gray-500 text-center">Start your next masterpiece</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}