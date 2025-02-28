import { useNavigate, useLocation } from "react-router-dom";
import { useUserGuardContext } from "app";
import { useState, useEffect } from "react";
import { useBookStore } from "../utils/bookStore";
import { Book, Chapter } from "../utils/bookTypes";
import { ChapterPlan } from "../brain/data-contracts";
import brain from "brain";
import { toast } from "sonner";

export default function BookDetails() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const location = useLocation();
  const bookId = new URLSearchParams(location.search).get("id");
  
  const { getBook, updateBook, updateChapter } = useBookStore();
  
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingElementId, setGeneratingElementId] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  
  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        navigate("/dashboard");
        return;
      }
      
      setIsLoading(true);
      try {
        const bookData = await getBook(bookId);
        if (bookData) {
          setBook(bookData);
        } else {
          toast.error("Book not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading book:", error);
        toast.error("Failed to load book details");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBook();
  }, [bookId, getBook, navigate]);
  
  // Helper function to check if generation is in progress
  const isGenerationInProgress = () => {
    return generatingElementId !== null;
  };
  
  const generateBookPlan = async () => {
    if (!book || isGenerating) return;
    
    if (isGenerationInProgress()) {
      toast.error("Please wait for the current generation to complete");
      return;
    }
    
    setIsGenerating(true);
    setGeneratingElementId("book-plan");
    try {
      toast.info("Generating book plan...");
      
      const response = await brain.generate_book_plan({
        title: book.title,
        type: book.type,
        category: book.category,
        chapterCount: book.chapterCount,
        authorName: book.authorName,
        acknowledgements: book.acknowledgements || undefined
      });
      
      const bookPlan = await response.json();
      
      // Update book with the generated plan
      const updatedBook = {
        ...book,
        coverDescription: bookPlan.coverDescription,
        bookDescription: bookPlan.bookDescription,
        endPageContent: bookPlan.endPageContent,
        status: "in-progress" as const,
        // Update chapters with the generated chapter plans
        chapters: book.chapters.map((chapter: Chapter, index: number) => {
          const generatedChapter = bookPlan.chapters.find(
            (c: ChapterPlan) => c.order === index + 1 || c.id === chapter.id
          );
          
          if (generatedChapter) {
            return {
              ...chapter,
              title: generatedChapter.title,
              summary: generatedChapter.summary,
              status: "incomplete" as const
            };
          }
          return chapter;
        })
      };
      
      await updateBook(book.id, updatedBook);
      setBook(updatedBook);
      toast.success("Book plan generated successfully");
    } catch (error) {
      console.error("Error generating book plan:", error);
      toast.error("Failed to generate book plan");
    } finally {
      setIsGenerating(false);
      setGeneratingElementId(null);
    }
  };
  
  // Generate chapter content
  const generateChapterContent = async (chapter: Chapter) => {
    if (isGenerationInProgress()) {
      toast.error("Please wait for the current generation to complete");
      return;
    }
    
    // Don't regenerate completed chapters
    if (chapter.status === 'completed' && chapter.content) {
      toast.info("This chapter is already generated. You can edit it manually.");
      return;
    }
    
    setGeneratingElementId(chapter.id);
    
    // Update chapter status to generating
    const updatedChapter = { ...chapter, status: 'generating' as const };
    await updateChapter(book!.id, updatedChapter);
    
    // Update local state
    setBook({
      ...book!,
      chapters: book!.chapters.map(ch => ch.id === chapter.id ? updatedChapter : ch)
    });
    
    try {
      // Get previous chapter summaries
      const prevChapterSummaries: Record<string, string> = {};
      
      // Only include summaries of chapters that come before this one
      book!.chapters
        .filter(ch => ch.order < chapter.order && ch.summary)
        .forEach(ch => {
          prevChapterSummaries[ch.order.toString()] = ch.summary!;
        });
      
      toast.info(`Generating content for "${chapter.title}"...`);
      
      const response = await brain.generate_chapter({
        title: book!.title,
        chapterTitle: chapter.title,
        chapterSummary: chapter.summary || '',
        chapterIndex: chapter.order,
        totalChapters: book!.chapters.length,
        bookType: book!.type,
        bookCategory: book!.category,
        authorName: book!.authorName,
        previousChapterSummaries: Object.keys(prevChapterSummaries).length > 0 ? prevChapterSummaries : undefined
      });
      
      const chapterData = await response.json();
      
      // Update the chapter with the generated content
      const completedChapter = {
        ...chapter,
        content: chapterData.content,
        wordCount: chapterData.wordCount,
        status: 'completed' as const
      };
      
      await updateChapter(book!.id, completedChapter);
      
      // Update local state
      setBook({
        ...book!,
        chapters: book!.chapters.map(ch => ch.id === chapter.id ? completedChapter : ch)
      });
      
      toast.success(`Chapter "${chapter.title}" generated successfully`);
      
      // Check if all chapters are completed to update book status
      const allChaptersCompleted = book!.chapters.every(ch => 
        ch.id === chapter.id ? true : ch.status === 'completed'
      );
      
      if (allChaptersCompleted) {
        const updatedBook = {
          ...book!,
          status: 'completed' as const
        };
        await updateBook(book!.id, updatedBook);
        setBook(updatedBook);
        toast.success("Congratulations! Your book is now complete.");
      }
    } catch (error) {
      console.error("Error generating chapter content:", error);
      toast.error(`Failed to generate chapter "${chapter.title}". Please try again.`);
      
      // Reset chapter status to incomplete
      const resetChapter = { ...chapter, status: 'incomplete' as const };
      await updateChapter(book!.id, resetChapter);
      
      // Update local state
      setBook({
        ...book!,
        chapters: book!.chapters.map(ch => ch.id === chapter.id ? resetChapter : ch)
      });
    } finally {
      setGeneratingElementId(null);
    }
  };
  
  const toggleChapterExpand = (chapterId: string) => {
    setActiveChapter(activeChapter === chapterId ? null : chapterId);
  };
  
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
  
  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Book not found</h2>
            <p className="mt-2 text-gray-600">The book you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Dashboard
            </button>
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
              {user.displayName || user.email}
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
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          
          {/* Book Header */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900">{book.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">{book.type}</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">{book.category}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{book.chapters.length} chapters</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                book.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                book.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {book.status === 'draft' ? 'Draft' : 
                 book.status === 'in-progress' ? 'In Progress' : 'Completed'}
              </span>
            </div>
            <p className="mt-4 text-gray-600">By {book.authorName}</p>
            
            {book.bookDescription && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Book Description</h3>
                <div className="mt-2 prose text-gray-600">
                  {book.bookDescription.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {!book.bookDescription && !isGenerating && (
              <div className="mt-6">
                <button
                  onClick={generateBookPlan}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Generate Book Plan
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  This will generate a book description, chapter summaries, and cover page information.
                </p>
              </div>
            )}
            
            {isGenerating && (
              <div className="mt-6 flex items-center">
                <div className="animate-spin mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" fill="none" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5" stroke="currentColor" />
                  </svg>
                </div>
                <span className="text-indigo-600">Generating book plan...</span>
              </div>
            )}
          </div>
          
          {/* Book Plan Progress */}
          {book.bookDescription && (
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Book Elements</h2>
              <div className="space-y-4">
                {/* Cover Page Checklist Item */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="ml-3 text-gray-900">Cover Page</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
                </div>
                
                {/* Book Description Checklist Item */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="ml-3 text-gray-900">Book Description</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
                </div>
                
                {/* Chapters Checklist Items */}
                {book.chapters.map((chapter) => (
                  <div key={chapter.id} className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                        chapter.status === 'completed' ? 'bg-green-400' :
                        chapter.status === 'generating' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}>
                        {chapter.status === 'completed' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : chapter.status === 'generating' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" fill="none" />
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5" stroke="currentColor" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="ml-3 text-gray-900">{chapter.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        chapter.status === 'completed' ? 'bg-green-100 text-green-800' :
                        chapter.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {chapter.status === 'completed' ? 'Completed' :
                         chapter.status === 'generating' ? 'Generating...' :
                         'Incomplete'}
                      </span>
                      {chapter.status !== 'completed' && chapter.status !== 'generating' && (
                        <button 
                          className={`p-1 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors ${
                            generatingElementId ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => generateChapterContent(chapter)}
                          disabled={!!generatingElementId}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* End Page Checklist Item */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="ml-3 text-gray-900">End Page</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall progress</span>
                    <span className="text-sm font-medium text-indigo-600">
                      {Math.round(
                        ((book.coverDescription ? 1 : 0) + 
                         (book.bookDescription ? 1 : 0) + 
                         book.chapters.filter(ch => ch.status === 'completed').length + 
                         (book.endPageContent ? 1 : 0)) /
                        (2 + book.chapters.length) * 100
                      )}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full" 
                      style={{ 
                        width: `${Math.round(
                          ((book.coverDescription ? 1 : 0) + 
                           (book.bookDescription ? 1 : 0) + 
                           book.chapters.filter(ch => ch.status === 'completed').length + 
                           (book.endPageContent ? 1 : 0)) /
                          (2 + book.chapters.length) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Cover Page Card */}
          {book.coverDescription && (
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Cover Page</h2>
              <div className="mt-4 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 bg-indigo-50 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-300 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-indigo-600 mt-2 block">Cover Image Preview</span>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-lg font-medium text-gray-900">Cover Description</h3>
                  <p className="mt-2 text-gray-600">{book.coverDescription}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Chapters List */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Chapters</h2>
            
            {book.chapters.length === 0 ? (
              <p className="text-gray-600">No chapters yet. Generate a book plan to create chapters.</p>
            ) : (
              <div className="space-y-4">
                {book.chapters.map((chapter) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-md overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
                      onClick={() => toggleChapterExpand(chapter.id)}
                    >
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-3 ${
                          chapter.status === 'incomplete' ? 'bg-gray-400' :
                          chapter.status === 'generating' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`}></span>
                        <h3 className="font-medium">{chapter.title}</h3>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          activeChapter === chapter.id ? 'transform rotate-180' : ''
                        }`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {activeChapter === chapter.id && (
                      <div className="p-4 border-t border-gray-200">
                        {chapter.summary ? (
                          <div>
                            <h4 className="font-medium text-gray-900">Summary</h4>
                            <p className="mt-2 text-gray-600">{chapter.summary}</p>
                          </div>
                        ) : (
                          <p className="text-gray-600">No summary available yet.</p>
                        )}
                        
                        {chapter.content && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900">Content</h4>
                            <div className="mt-2 prose text-gray-600 max-h-60 overflow-y-auto">
                              {chapter.content.split('\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          {chapter.status !== 'completed' && chapter.status !== 'generating' ? (
                            <button 
                              onClick={() => generateChapterContent(chapter)}
                              disabled={!!generatingElementId}
                              className={`px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-1 ${
                                generatingElementId ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span>Generate Content</span>
                            </button>
                          ) : chapter.status === 'generating' ? (
                            <div className="flex items-center text-yellow-600">
                              <div className="animate-spin mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" fill="none" />
                                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5" stroke="currentColor" />
                                </svg>
                              </div>
                              <span>Generating...</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* End Page Card */}
          {book.endPageContent && (
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">End Page</h2>
              <div className="mt-4">
                <div className="prose text-gray-600">
                  {book.endPageContent.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="mt-6 flex justify-between items-center">
            <div>
              {book.status === 'completed' && (
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors mr-3">
                  Export as PDF
                </button>
              )}
            </div>
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
