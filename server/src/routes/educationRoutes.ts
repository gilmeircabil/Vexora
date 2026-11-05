import { Router } from 'express';
import { EducationController } from '../controllers/educationController.js';
import { authenticate, requireTeacher } from '../middleware/authMiddleware.js';
import { enforceLimits } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

// ---------------------------------------------------------------------------
// PROFILE & DASHBOARD
// ---------------------------------------------------------------------------
router.put(
  '/profile/role',
  authenticate,
  enforceLimits({ category: 'auth', action: 'changePassword', windowMs: 60 * 60 * 1000, maxRequests: 5 }),
  EducationController.updateEducationRole,
);
router.get('/dashboard', authenticate, EducationController.getDashboardSummary);

// ---------------------------------------------------------------------------
// DATA OWNERSHIP & PRIVACY
// ---------------------------------------------------------------------------
router.get('/export', authenticate, EducationController.exportUserData);
router.post(
  '/import',
  authenticate,
  enforceLimits({ category: 'studio', action: 'importData', windowMs: 60 * 60 * 1000, maxRequests: 5 }),
  EducationController.importUserData,
);
router.delete(
  '/data',
  authenticate,
  enforceLimits({ category: 'studio', action: 'deleteData', windowMs: 60 * 60 * 1000, maxRequests: 5 }),
  EducationController.purgeUserData,
);

// ---------------------------------------------------------------------------
// STUDENT WORKSPACE ENDPOINTS (Accessible to all authenticated users)
// ---------------------------------------------------------------------------
// Tasks
router.get('/student/tasks', authenticate, EducationController.getTasks);
router.post(
  '/student/tasks',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'createTask', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.createTask,
);
router.put(
  '/student/tasks/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'editTask', windowMs: 60 * 60 * 1000, maxRequests: 100 }),
  EducationController.updateTask,
);
router.delete(
  '/student/tasks/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'deleteTask', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteTask,
);

// Flashcards
router.get('/student/flashcards', authenticate, EducationController.getFlashcardDecks);
router.get('/student/flashcards/:id', authenticate, EducationController.getFlashcardDeckById);
router.post(
  '/student/flashcards',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'flashcardDecksPerUser', windowMs: 24 * 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.flashcardDecksPerUser }),
  EducationController.createFlashcardDeck,
);
router.put(
  '/student/flashcards/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'editFlashcardDeck', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateFlashcardDeck,
);
router.delete(
  '/student/flashcards/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'deleteFlashcardDeck', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteFlashcardDeck,
);
router.post(
  '/student/flashcards/:id/review',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'quizAttemptsPerDay', windowMs: 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.quizAttemptsPerDay }),
  EducationController.reviewCard,
);

// Quizzes & Practice Tests
router.get('/student/quizzes', authenticate, EducationController.getQuizzes);
router.get('/student/quizzes/:id', authenticate, EducationController.getQuizById);
router.post(
  '/student/quizzes',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'quizzesPerDay', windowMs: 24 * 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.quizzesPerDay }),
  EducationController.createQuiz,
);
router.put(
  '/student/quizzes/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'editQuiz', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateQuiz,
);
router.delete(
  '/student/quizzes/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'deleteQuiz', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteQuiz,
);
router.post(
  '/student/quizzes/:id/attempt',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'quizAttemptsPerDay', windowMs: 24 * 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.quizAttemptsPerDay }),
  EducationController.recordQuizAttempt,
);
router.get('/student/quiz-attempts', authenticate, EducationController.getQuizAttempts);

// Smart Notes
router.get('/student/notes', authenticate, EducationController.getNotes);
router.post(
  '/student/notes',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'notesPerDay', windowMs: 24 * 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.notesPerDay }),
  EducationController.createNote,
);
router.put(
  '/student/notes/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'editNote', windowMs: 60 * 60 * 1000, maxRequests: 100 }),
  EducationController.updateNote,
);
router.delete(
  '/student/notes/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'deleteNote', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.deleteNote,
);

// Study Sessions (Pomodoro)
router.get('/student/sessions', authenticate, EducationController.getSessions);
router.post(
  '/student/sessions',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'recordSession', windowMs: 60 * 60 * 1000, maxRequests: 100 }),
  EducationController.recordSession,
);

// Timetable
router.get('/student/timetable', authenticate, EducationController.getTimetable);
router.put(
  '/student/timetable',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'updateTimetable', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateTimetable,
);

// Goals
router.get('/student/goals', authenticate, EducationController.getGoals);
router.post(
  '/student/goals',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'createGoal', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.createGoal,
);
router.put(
  '/student/goals/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'editGoal', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateGoal,
);
router.delete(
  '/student/goals/:id',
  authenticate,
  enforceLimits({ category: 'studySpace', action: 'deleteGoal', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteGoal,
);

// ---------------------------------------------------------------------------
// TEACHER WORKSPACE ENDPOINTS (Strictly requires Teacher or Admin role)
// ---------------------------------------------------------------------------
// Classes & Students
router.get('/teacher/classes', authenticate, requireTeacher, EducationController.getClasses);
router.get('/teacher/classes/:id', authenticate, requireTeacher, EducationController.getClassById);
router.post(
  '/teacher/classes',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'createClass', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.createClass,
);
router.put(
  '/teacher/classes/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'updateClass', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateClass,
);
router.delete(
  '/teacher/classes/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'deleteClass', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteClass,
);

// Attendance
router.get(
  '/teacher/attendance/:classId',
  authenticate,
  requireTeacher,
  EducationController.getAttendance,
);
router.post(
  '/teacher/attendance/:classId',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'recordAttendance', windowMs: 60 * 60 * 1000, maxRequests: 100 }),
  EducationController.saveAttendance,
);

// Gradebook
router.get(
  '/teacher/gradebook/:classId',
  authenticate,
  requireTeacher,
  EducationController.getGradebook,
);
router.put(
  '/teacher/gradebook/:classId',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'updateGradebook', windowMs: 60 * 60 * 1000, maxRequests: 100 }),
  EducationController.updateGradebook,
);

// Lesson Plans
router.get(
  '/teacher/lesson-plans',
  authenticate,
  requireTeacher,
  EducationController.getLessonPlans,
);
router.post(
  '/teacher/lesson-plans',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'createLessonPlan', windowMs: 24 * 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.worksheetsPerDay }),
  EducationController.createLessonPlan,
);
router.put(
  '/teacher/lesson-plans/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'updateLessonPlan', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateLessonPlan,
);
router.delete(
  '/teacher/lesson-plans/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'deleteLessonPlan', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteLessonPlan,
);

// Rubrics
router.get('/teacher/rubrics', authenticate, requireTeacher, EducationController.getRubrics);
router.post(
  '/teacher/rubrics',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'createRubric', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.createRubric,
);
router.put(
  '/teacher/rubrics/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'updateRubric', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.updateRubric,
);
router.delete(
  '/teacher/rubrics/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'deleteRubric', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteRubric,
);

// Worksheets
router.get('/teacher/worksheets', authenticate, requireTeacher, EducationController.getWorksheets);
router.post(
  '/teacher/worksheets',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'createWorksheet', windowMs: 24 * 60 * 60 * 1000, maxRequests: defaultLimits.studySpace.worksheetsPerDay }),
  EducationController.createWorksheet,
);
router.delete(
  '/teacher/worksheets/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'deleteWorksheet', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteWorksheet,
);

// Exams
router.get('/teacher/exams', authenticate, requireTeacher, EducationController.getExams);
router.post(
  '/teacher/exams',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'createExam', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.createExam,
);
router.delete(
  '/teacher/exams/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'deleteExam', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteExam,
);

// Question Banks
router.get(
  '/teacher/question-banks',
  authenticate,
  requireTeacher,
  EducationController.getQuestionBanks,
);
router.post(
  '/teacher/question-banks',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'createQuestionBank', windowMs: 60 * 60 * 1000, maxRequests: 50 }),
  EducationController.createQuestionBank,
);
router.delete(
  '/teacher/question-banks/:id',
  authenticate,
  requireTeacher,
  enforceLimits({ category: 'studySpace', action: 'deleteQuestionBank', windowMs: 60 * 60 * 1000, maxRequests: 20 }),
  EducationController.deleteQuestionBank,
);

export const educationRoutes = router;
