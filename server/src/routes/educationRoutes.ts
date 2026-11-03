import { Router } from 'express';
import { EducationController } from '../controllers/educationController.js';
import { authenticate, requireTeacher } from '../middleware/authMiddleware.js';

const router = Router();

// ---------------------------------------------------------------------------
// PROFILE & DASHBOARD
// ---------------------------------------------------------------------------
router.put('/profile/role', authenticate, EducationController.updateEducationRole);
router.get('/dashboard', authenticate, EducationController.getDashboardSummary);

// ---------------------------------------------------------------------------
// DATA OWNERSHIP & PRIVACY
// ---------------------------------------------------------------------------
router.get('/export', authenticate, EducationController.exportUserData);
router.post('/import', authenticate, EducationController.importUserData);
router.delete('/data', authenticate, EducationController.purgeUserData);

// ---------------------------------------------------------------------------
// STUDENT WORKSPACE ENDPOINTS (Accessible to all authenticated users)
// ---------------------------------------------------------------------------
// Tasks
router.get('/student/tasks', authenticate, EducationController.getTasks);
router.post('/student/tasks', authenticate, EducationController.createTask);
router.put('/student/tasks/:id', authenticate, EducationController.updateTask);
router.delete('/student/tasks/:id', authenticate, EducationController.deleteTask);

// Flashcards
router.get('/student/flashcards', authenticate, EducationController.getFlashcardDecks);
router.get('/student/flashcards/:id', authenticate, EducationController.getFlashcardDeckById);
router.post('/student/flashcards', authenticate, EducationController.createFlashcardDeck);
router.put('/student/flashcards/:id', authenticate, EducationController.updateFlashcardDeck);
router.delete('/student/flashcards/:id', authenticate, EducationController.deleteFlashcardDeck);
router.post('/student/flashcards/:id/review', authenticate, EducationController.reviewCard);

// Quizzes & Practice Tests
router.get('/student/quizzes', authenticate, EducationController.getQuizzes);
router.get('/student/quizzes/:id', authenticate, EducationController.getQuizById);
router.post('/student/quizzes', authenticate, EducationController.createQuiz);
router.put('/student/quizzes/:id', authenticate, EducationController.updateQuiz);
router.delete('/student/quizzes/:id', authenticate, EducationController.deleteQuiz);
router.post('/student/quizzes/:id/attempt', authenticate, EducationController.recordQuizAttempt);
router.get('/student/quiz-attempts', authenticate, EducationController.getQuizAttempts);

// Smart Notes
router.get('/student/notes', authenticate, EducationController.getNotes);
router.post('/student/notes', authenticate, EducationController.createNote);
router.put('/student/notes/:id', authenticate, EducationController.updateNote);
router.delete('/student/notes/:id', authenticate, EducationController.deleteNote);

// Study Sessions (Pomodoro)
router.get('/student/sessions', authenticate, EducationController.getSessions);
router.post('/student/sessions', authenticate, EducationController.recordSession);

// Timetable
router.get('/student/timetable', authenticate, EducationController.getTimetable);
router.put('/student/timetable', authenticate, EducationController.updateTimetable);

// Goals
router.get('/student/goals', authenticate, EducationController.getGoals);
router.post('/student/goals', authenticate, EducationController.createGoal);
router.put('/student/goals/:id', authenticate, EducationController.updateGoal);
router.delete('/student/goals/:id', authenticate, EducationController.deleteGoal);

// ---------------------------------------------------------------------------
// TEACHER WORKSPACE ENDPOINTS (Strictly requires Teacher or Admin role)
// ---------------------------------------------------------------------------
// Classes & Students
router.get('/teacher/classes', authenticate, requireTeacher, EducationController.getClasses);
router.get('/teacher/classes/:id', authenticate, requireTeacher, EducationController.getClassById);
router.post('/teacher/classes', authenticate, requireTeacher, EducationController.createClass);
router.put('/teacher/classes/:id', authenticate, requireTeacher, EducationController.updateClass);
router.delete(
  '/teacher/classes/:id',
  authenticate,
  requireTeacher,
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
  EducationController.createLessonPlan,
);
router.put(
  '/teacher/lesson-plans/:id',
  authenticate,
  requireTeacher,
  EducationController.updateLessonPlan,
);
router.delete(
  '/teacher/lesson-plans/:id',
  authenticate,
  requireTeacher,
  EducationController.deleteLessonPlan,
);

// Rubrics
router.get('/teacher/rubrics', authenticate, requireTeacher, EducationController.getRubrics);
router.post('/teacher/rubrics', authenticate, requireTeacher, EducationController.createRubric);
router.put('/teacher/rubrics/:id', authenticate, requireTeacher, EducationController.updateRubric);
router.delete(
  '/teacher/rubrics/:id',
  authenticate,
  requireTeacher,
  EducationController.deleteRubric,
);

// Worksheets
router.get('/teacher/worksheets', authenticate, requireTeacher, EducationController.getWorksheets);
router.post(
  '/teacher/worksheets',
  authenticate,
  requireTeacher,
  EducationController.createWorksheet,
);
router.delete(
  '/teacher/worksheets/:id',
  authenticate,
  requireTeacher,
  EducationController.deleteWorksheet,
);

// Exams
router.get('/teacher/exams', authenticate, requireTeacher, EducationController.getExams);
router.post('/teacher/exams', authenticate, requireTeacher, EducationController.createExam);
router.delete('/teacher/exams/:id', authenticate, requireTeacher, EducationController.deleteExam);

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
  EducationController.createQuestionBank,
);
router.delete(
  '/teacher/question-banks/:id',
  authenticate,
  requireTeacher,
  EducationController.deleteQuestionBank,
);

export const educationRoutes = router;
