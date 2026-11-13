/**
 * Centralized Usage Limits Configuration
 * All limits can be overridden via environment variables
 *
 * This is the single source of truth for platform resource protection
 */

export interface LimitConfig {
  // Authentication limits
  auth: {
    registerPerHour: number;        // 3 = max 3 registrations per hour per IP
    loginAttempts: number;          // 5 = max 5 failed logins before lock
    passwordRecoveryPerHour: number; // 5 = max 5 recovery requests per hour
    loginLockoutMinutes: number;    // 15 = lockout duration after failed attempts
  };

  // API rate limits
  api: {
    authenticatedPerMinute: number;  // 100 = requests per minute for logged-in users
    guestPerMinute: number;          // 60 = requests per minute for anonymous users
    searchPerMinute: number;         // 60 = search endpoint limit
    uploadPerHour: number;           // 10 = file uploads per hour
  };

  // File upload limits
  upload: {
    avatarMaxSize: number;           // 5 MB
    learningAttachmentMaxSize: number; // 25 MB
    documentToQuizMaxSize: number;  // 50 MB
    designAssetMaxSize: number;     // 25 MB
    mediaConversionMaxSize: number;  // 100 MB
  };

  // AI tool limits
  ai: {
    enhancePerHour: number;          // 10 = image enhancements per hour
    backgroundRemoverPerHour: number; // 10 = background removals per hour
    ocrPerHour: number;              // 15 = OCR operations per hour
    mp3ConversionPerHour: number;    // 10 = MP3 conversions per hour
    mp4ConversionPerHour: number;    // 5 = MP4 conversions per hour
    documentToQuizPerHour: number;   // 10 = document-to-quiz generations per hour
    chatPerHour: number;             // 50 = chat messages per hour
    writingAssistantPerHour: number; // 10 = writing assistant generations per hour
    codeAssistantPerHour: number;    // 10 = code assistant generations per hour
    documentAssistantPerHour: number; // 10 = document assistant generations per hour
    maxConcurrentJobs: number;       // 1 = only one AI job active at a time
  };

  // Study Space limits
  studySpace: {
    quizzesPerDay: number;           // 50 = quizzes that can be created per day
    flashcardDecksPerUser: number;   // 100 = max flashcard decks per user
    quizAttemptsPerDay: number;      // 100 = quiz attempts per day
    questionsPerQuiz: number;        // 50 = max questions per generated quiz
    notesPerDay: number;             // 100 = study notes per day
    worksheetsPerDay: number;        // 20 = worksheets per day
  };

  // Design Studio limits
  studio: {
    projectsPerUser: number;         // 50 = max saved projects per user
    combinedAssetsQuota: number;     // 500 MB = total asset storage limit
    exportsPerHour: number;          // 20 = project exports per hour
    maxConcurrentExports: number;    // 1 = only one export active at a time
    projectSizeLimit: number;        // 10 MB = max project data size
  };

  // Learning Hub limits
  learningHub: {
    postsPerDay: number;             // 10 = posts per day (combined with community)
    commentsPerHour: number;         // 30 = comments per hour
    reviewsPerDay: number;           // 3 = reviews per day per user
    learningFileMaxSize: number;     // 25 MB = max learning attachment size
    payoutRequestsPerDay: number;    // 1 = payout requests per day for creators
  };

  // Community limits
  community: {
    communityPostsPerDay: number;    // 10 = community posts per day
    communityCommentsPerHour: number; // 60 = community comments per hour
    reactionsPerHour: number;        // 60 = likes/reactions per hour
    reportsPerHour: number;          // 10 = reports per hour
  };

  // Storage quotas
  storage: {
    authenticatedUserQuota: number;  // 500 MB default storage quota
    anonymousUserQuota: number;      // 100 MB for guests
    totalPlatformQuota: number;    // 9.5 GB safety cap (free tier protection)
    tempFileLifetimeHours: number;   // 24 = hours before temp files auto-delete
  };

  // Reviews and ratings limits
  reviews: {
    reviewsPerDayPerUser: number;    // 3 = max reviews user can submit per day
    ratingChangesPerDay: number;     // 5 = rating changes per day per user
  };

  // Background job limits
  jobs: {
    maxQueuedJobs: number;           // 100 = max jobs in queue
    maxJobAgeHours: number;          // 24 = max job age before rejection
    retryAttempts: number;           // 3 = max retry attempts for failed jobs
  };

  // Database query limits
  database: {
    queryTimeoutMs: number;          // 30000 = 30 second query timeout
    maxResultsPerQuery: number;      // 1000 = max results returned per query
  };
}

// Default configuration values
export const defaultLimits: LimitConfig = {
  auth: {
    registerPerHour: parseInt(process.env.LIMIT_REGISTER_PER_HOUR || '3', 10),
    loginAttempts: parseInt(process.env.LIMIT_LOGIN_ATTEMPTS || '5', 10),
    passwordRecoveryPerHour: parseInt(process.env.LIMIT_RECOVERY_PER_HOUR || '5', 10),
    loginLockoutMinutes: parseInt(process.env.LIMIT_LOGIN_LOCKOUT_MINUTES || '15', 10),
  },
  api: {
    authenticatedPerMinute: parseInt(process.env.LIMIT_API_PER_MINUTE || '100', 10),
    guestPerMinute: parseInt(process.env.LIMIT_GUEST_PER_MINUTE || '60', 10),
    searchPerMinute: parseInt(process.env.LIMIT_SEARCH_PER_MINUTE || '60', 10),
    uploadPerHour: parseInt(process.env.LIMIT_UPLOAD_PER_HOUR || '10', 10),
  },
  upload: {
    avatarMaxSize: parseInt(process.env.LIMIT_AVATAR_MAX_SIZE || '5242880', 10), // 5 MB
    learningAttachmentMaxSize: parseInt(process.env.LIMIT_LEARNING_MAX_SIZE || '26214400', 10), // 25 MB
    documentToQuizMaxSize: parseInt(process.env.LIMIT_DOCUMENT_MAX_SIZE || '52428800', 10), // 50 MB
    designAssetMaxSize: parseInt(process.env.LIMIT_ASSET_MAX_SIZE || '26214400', 10), // 25 MB
    mediaConversionMaxSize: parseInt(process.env.LIMIT_MEDIA_MAX_SIZE || '104857600', 10), // 100 MB
  },
  ai: {
    enhancePerHour: parseInt(process.env.LIMIT_AI_ENHANCE_PER_HOUR || '10', 10),
    backgroundRemoverPerHour: parseInt(process.env.LIMIT_AI_BG_REMOVER_PER_HOUR || '10', 10),
    ocrPerHour: parseInt(process.env.LIMIT_AI_OCR_PER_HOUR || '15', 10),
    mp3ConversionPerHour: parseInt(process.env.LIMIT_MP3_CONVERSION_PER_HOUR || '10', 10),
    mp4ConversionPerHour: parseInt(process.env.LIMIT_MP4_CONVERSION_PER_HOUR || '5', 10),
    documentToQuizPerHour: parseInt(process.env.LIMIT_AI_DOC_TO_QUIZ_PER_HOUR || '10', 10),
    chatPerHour: parseInt(process.env.LIMIT_AI_CHAT_PER_HOUR || '50', 10),
    writingAssistantPerHour: parseInt(process.env.LIMIT_AI_WRITING_PER_HOUR || '10', 10),
    codeAssistantPerHour: parseInt(process.env.LIMIT_AI_CODE_PER_HOUR || '10', 10),
    documentAssistantPerHour: parseInt(process.env.LIMIT_AI_DOC_ASSISTANT_PER_HOUR || '10', 10),
    maxConcurrentJobs: parseInt(process.env.LIMIT_AI_MAX_CONCURRENT || '1', 10),
  },
  studySpace: {
    quizzesPerDay: parseInt(process.env.LIMIT_QUIZZES_PER_DAY || '50', 10),
    flashcardDecksPerUser: parseInt(process.env.LIMIT_FLASHCARDS_PER_USER || '100', 10),
    quizAttemptsPerDay: parseInt(process.env.LIMIT_QUIZ_ATTEMPTS_PER_DAY || '100', 10),
    questionsPerQuiz: parseInt(process.env.LIMIT_QUESTIONS_PER_QUIZ || '50', 10),
    notesPerDay: parseInt(process.env.LIMIT_NOTES_PER_DAY || '100', 10),
    worksheetsPerDay: parseInt(process.env.LIMIT_WORKSHEETS_PER_DAY || '20', 10),
  },
  studio: {
    projectsPerUser: parseInt(process.env.LIMIT_STUDIO_PROJECTS || '50', 10),
    combinedAssetsQuota: parseInt(process.env.LIMIT_STUDIO_ASSETS || '524288000', 10), // 500 MB
    exportsPerHour: parseInt(process.env.LIMIT_STUDIO_EXPORTS_PER_HOUR || '20', 10),
    maxConcurrentExports: parseInt(process.env.LIMIT_STUDIO_CONCURRENT_EXPORTS || '1', 10),
    projectSizeLimit: parseInt(process.env.LIMIT_STUDIO_PROJECT_SIZE || '10485760', 10), // 10 MB
  },
  learningHub: {
    postsPerDay: parseInt(process.env.LIMIT_POSTS_PER_DAY || '10', 10),
    commentsPerHour: parseInt(process.env.LIMIT_COMMENT_PER_HOUR || '30', 10),
    reviewsPerDay: parseInt(process.env.LIMIT_REVIEWS_PER_DAY || '3', 10),
    learningFileMaxSize: parseInt(process.env.LIMIT_LEARNING_FILE_MAX_SIZE || '26214400', 10), // 25 MB
    payoutRequestsPerDay: parseInt(process.env.LIMIT_PAYOUT_PER_DAY || '1', 10),
  },
  community: {
    communityPostsPerDay: parseInt(process.env.LIMIT_COMMUNITY_POSTS || '10', 10),
    communityCommentsPerHour: parseInt(process.env.LIMIT_COMMUNITY_COMMENT_PER_HOUR || '60', 10),
    reactionsPerHour: parseInt(process.env.LIMIT_REACTIONS_PER_HOUR || '60', 10),
    reportsPerHour: parseInt(process.env.LIMIT_REPORTS_PER_HOUR || '10', 10),
  },
  storage: {
    authenticatedUserQuota: parseInt(process.env.LIMIT_USER_STORAGE_BYTES || '524288000', 10), // 500 MB
    anonymousUserQuota: parseInt(process.env.LIMIT_ANON_STORAGE_BYTES || '104857600', 10), // 100 MB
    totalPlatformQuota: parseInt(process.env.LIMIT_TOTAL_STORAGE_BYTES || '10161280000', 10), // 9.5 GB
    tempFileLifetimeHours: parseInt(process.env.LIMIT_TEMP_FILE_LIFETIME || '24', 10),
  },
  reviews: {
    reviewsPerDayPerUser: parseInt(process.env.LIMIT_REVIEWS_PER_DAY || '3', 10),
    ratingChangesPerDay: parseInt(process.env.LIMIT_RATING_CHANGES_PER_DAY || '5', 10),
  },
  jobs: {
    maxQueuedJobs: parseInt(process.env.LIMIT_MAX_QUEUED_JOBS || '100', 10),
    maxJobAgeHours: parseInt(process.env.LIMIT_JOB_AGE_HOURS || '24', 10),
    retryAttempts: parseInt(process.env.LIMIT_JOB_RETRIES || '3', 10),
  },
  database: {
    queryTimeoutMs: parseInt(process.env.LIMIT_QUERY_TIMEOUT_MS || '30000', 10),
    maxResultsPerQuery: parseInt(process.env.LIMIT_MAX_RESULTS || '1000', 10),
  },
};

// Export a singleton-like access pattern (in case we need to dynamically load)
let currentLimits: LimitConfig = { ...defaultLimits };

export const limits = {
  get config(): LimitConfig {
    return currentLimits;
  },
  // Allow runtime updates (useful for admin interface)
  set config(newConfig: Partial<LimitConfig>) {
    currentLimits = { ...currentLimits, ...newConfig } as LimitConfig;
  },
  // Reset to defaults
  reset(): void {
    currentLimits = { ...defaultLimits };
  },
};

// Export config for direct use in TypeScript
export const {
  auth,
  api,
  upload,
  ai,
  studySpace,
  studio,
  learningHub,
  community,
  storage,
  reviews,
  jobs,
  database
} = defaultLimits;