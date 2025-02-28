/** BookPlan */
export interface BookPlan {
  /** Coverdescription */
  coverDescription: string;
  /** Bookdescription */
  bookDescription: string;
  /** Chapters */
  chapters: ChapterPlan[];
  /** Endpagecontent */
  endPageContent: string;
}

/** ChapterPlan */
export interface ChapterPlan {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Summary */
  summary: string;
  /** Order */
  order: number;
}

/** GenerateBookPlanRequest */
export interface GenerateBookPlanRequest {
  /**
   * Title
   * Title of the book
   */
  title: string;
  /**
   * Type
   * Type of book (Fiction, Non-Fiction, Children's Book, Poetry)
   */
  type: string;
  /**
   * Category
   * Category of the book
   */
  category: string;
  /**
   * Chaptercount
   * Number of chapters in the book
   */
  chapterCount: number;
  /**
   * Authorname
   * Name of the author
   */
  authorName: string;
  /**
   * Acknowledgements
   * Optional acknowledgements
   */
  acknowledgements?: string | null;
}

/** GenerateChapterRequest */
export interface GenerateChapterRequest {
  /**
   * Title
   * Title of the book
   */
  title: string;
  /**
   * Chaptertitle
   * Title of the chapter
   */
  chapterTitle: string;
  /**
   * Chaptersummary
   * Summary of the chapter
   */
  chapterSummary: string;
  /**
   * Chapterindex
   * Index of the chapter in the book
   */
  chapterIndex: number;
  /**
   * Totalchapters
   * Total number of chapters in the book
   */
  totalChapters: number;
  /**
   * Booktype
   * Type of the book
   */
  bookType: string;
  /**
   * Bookcategory
   * Category of the book
   */
  bookCategory: string;
  /**
   * Authorname
   * Name of the author
   */
  authorName: string;
  /**
   * Previouschaptersummaries
   * Summaries of previous chapters
   */
  previousChapterSummaries?: Record<string, string> | null;
}

/** GenerateChapterResponse */
export interface GenerateChapterResponse {
  /** Content */
  content: string;
  /** Wordcount */
  wordCount: number;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type GenerateBookPlanData = BookPlan;

export type GenerateBookPlanError = HTTPValidationError;

export type GenerateChapterData = GenerateChapterResponse;

export type GenerateChapterError = HTTPValidationError;
