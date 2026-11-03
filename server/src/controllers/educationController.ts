import type { Response } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import {
  StudyTask,
  FlashcardDeck,
  StudentQuiz,
  QuizAttempt,
  StudentNote,
  StudySession,
  StudentTimetable,
  LearningGoal,
  TeacherClass,
  AttendanceRecord,
  TeacherGradebook,
  LessonPlan,
  Rubric,
  Worksheet,
  Exam,
  QuestionBank,
} from '../models/EducationModels.js';

function toObjectId(id: unknown): Types.ObjectId {
  return new Types.ObjectId(String(id));
}

export class EducationController {
  // -------------------------------------------------------------------------
  // USER EDUCATION PROFILE / ROLE
  // -------------------------------------------------------------------------
  static async updateEducationRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { role } = req.body;
      if (!['student', 'teacher', 'educator'].includes(role)) {
        res.status(400).json({ success: false, error: 'Invalid education role' });
        return;
      }

      const user = await User.findByIdAndUpdate(
        toObjectId(req.user.userId),
        { educationRole: role },
        { new: true },
      ).select('-passwordHash');

      res.status(200).json({
        success: true,
        data: {
          educationRole: user?.educationRole,
          message: `Role switched to ${role} successfully.`,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // DASHBOARD SUMMARY
  // -------------------------------------------------------------------------
  static async getDashboardSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);

      const [
        pendingTasks,
        completedTasks,
        deckCount,
        noteCount,
        goalCount,
        recentAttempts,
        recentSessions,
      ] = await Promise.all([
        StudyTask.countDocuments({ userId, status: { $ne: 'completed' } }),
        StudyTask.countDocuments({ userId, status: 'completed' }),
        FlashcardDeck.countDocuments({ userId }),
        StudentNote.countDocuments({ userId }),
        LearningGoal.countDocuments({ userId, isCompleted: false }),
        QuizAttempt.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
        StudySession.find({ userId }).sort({ createdAt: -1 }).limit(7).lean(),
      ]);

      const totalStudyMinutes = recentSessions.reduce(
        (acc, s) => acc + (s.durationMinutes || 0),
        0,
      );

      res.status(200).json({
        success: true,
        data: {
          pendingTasks,
          completedTasks,
          deckCount,
          noteCount,
          activeGoals: goalCount,
          recentAttempts,
          recentSessions,
          totalStudyMinutes,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 1. STUDY TASKS
  // -------------------------------------------------------------------------
  static async getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const { status, subject, priority } = req.query;

      const query: any = { userId };
      if (status && typeof status === 'string' && status !== 'all') {
        query.status = status;
      }
      if (subject && typeof subject === 'string' && subject !== 'all') {
        query.subject = subject;
      }
      if (priority && typeof priority === 'string' && priority !== 'all') {
        query.priority = priority;
      }

      const tasks = await StudyTask.find(query).sort({ deadline: 1, createdAt: -1 }).lean();
      res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { subject, title, description, priority, deadline } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const task = await StudyTask.create({
        userId: toObjectId(req.user.userId),
        subject,
        title,
        description: description || '',
        priority: priority || 'medium',
        deadline: deadline ? new Date(deadline) : undefined,
        status: 'pending',
      });

      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const taskId = toObjectId(req.params.id);
      const updates = { ...req.body };

      if (updates.status === 'completed' && !updates.completedAt) {
        updates.completedAt = new Date();
      } else if (updates.status && updates.status !== 'completed') {
        updates.completedAt = undefined;
      }

      const task = await StudyTask.findOneAndUpdate(
        { _id: taskId, userId: toObjectId(req.user.userId) },
        updates,
        { new: true },
      );

      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const taskId = toObjectId(req.params.id);
      const result = await StudyTask.findOneAndDelete({
        _id: taskId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Task not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Task deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 2. FLASHCARDS
  // -------------------------------------------------------------------------
  static async getFlashcardDecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const { filter } = req.query;

      let query: any = { userId };
      if (filter === 'public') {
        query = { isPublic: true };
      }

      const decks = await FlashcardDeck.find(query).sort({ updatedAt: -1 }).lean();
      res.status(200).json({ success: true, data: decks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getFlashcardDeckById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const deckId = toObjectId(req.params.id);
      const deck = await FlashcardDeck.findById(deckId).lean();

      if (!deck) {
        res.status(404).json({ success: false, error: 'Deck not found.' });
        return;
      }

      if (
        !deck.isPublic &&
        deck.userId.toString() !== req.user.userId &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({ success: false, error: 'Access denied to private deck.' });
        return;
      }

      res.status(200).json({ success: true, data: deck });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createFlashcardDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, description, isPublic, cards } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const formattedCards = Array.isArray(cards)
        ? cards.map((c: any) => ({
            id: c.id || new Types.ObjectId().toString(),
            question: c.question || '',
            answer: c.answer || '',
            hint: c.hint || '',
            box: c.box || 1,
            nextReviewDate: c.nextReviewDate ? new Date(c.nextReviewDate) : new Date(),
            intervalDays: c.intervalDays || 1,
            repetitions: c.repetitions || 0,
            lastReviewedAt: c.lastReviewedAt ? new Date(c.lastReviewedAt) : undefined,
          }))
        : [];

      const deck = await FlashcardDeck.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        description: description || '',
        isPublic: Boolean(isPublic),
        cards: formattedCards,
      });

      res.status(201).json({ success: true, data: deck });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateFlashcardDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const deckId = toObjectId(req.params.id);
      const updates = { ...req.body };

      const deck = await FlashcardDeck.findOneAndUpdate(
        { _id: deckId, userId: toObjectId(req.user.userId) },
        updates,
        { new: true },
      );

      if (!deck) {
        res.status(404).json({ success: false, error: 'Deck not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: deck });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteFlashcardDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const deckId = toObjectId(req.params.id);
      const result = await FlashcardDeck.findOneAndDelete({
        _id: deckId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Deck not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Deck deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async reviewCard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const deckId = toObjectId(req.params.id);
      const { cardId, known } = req.body;

      const deck = await FlashcardDeck.findOne({
        _id: deckId,
        userId: toObjectId(req.user.userId),
      });

      if (!deck) {
        res.status(404).json({ success: false, error: 'Deck not found or unauthorized.' });
        return;
      }

      const card = deck.cards.find((c) => c.id === cardId);
      if (!card) {
        res.status(404).json({ success: false, error: 'Card not found in deck.' });
        return;
      }

      // Spaced repetition (Leitner system boxes 1-5)
      if (known) {
        card.box = Math.min(5, (card.box || 1) + 1);
        card.repetitions = (card.repetitions || 0) + 1;
        const intervals = [1, 1, 3, 7, 14, 30];
        card.intervalDays = intervals[card.box] || 1;
      } else {
        card.box = 1;
        card.intervalDays = 1;
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + card.intervalDays);
      card.nextReviewDate = nextDate;
      card.lastReviewedAt = new Date();

      await deck.save();
      res.status(200).json({ success: true, data: card });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 3. QUIZZES & PRACTICE TESTS
  // -------------------------------------------------------------------------
  static async getQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const { filter } = req.query;

      let query: any = { userId };
      if (filter === 'public') {
        query = { isPublic: true };
      }

      const quizzes = await StudentQuiz.find(query).sort({ createdAt: -1 }).lean();
      res.status(200).json({ success: true, data: quizzes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getQuizById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const quizId = toObjectId(req.params.id);
      const quiz = await StudentQuiz.findById(quizId).lean();

      if (!quiz) {
        res.status(404).json({ success: false, error: 'Quiz not found.' });
        return;
      }

      if (
        !quiz.isPublic &&
        quiz.userId.toString() !== req.user.userId &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({ success: false, error: 'Access denied to private quiz.' });
        return;
      }

      res.status(200).json({ success: true, data: quiz });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, description, durationMinutes, isPublic, questions, sourceDocument } =
        req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const quiz = await StudentQuiz.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        description: description || '',
        durationMinutes: Number(durationMinutes) || 0,
        isPublic: Boolean(isPublic),
        questions: Array.isArray(questions) ? questions : [],
        sourceDocument: sourceDocument || undefined,
      });

      res.status(201).json({ success: true, data: quiz });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const quizId = toObjectId(req.params.id);
      const updates = { ...req.body };

      const quiz = await StudentQuiz.findOneAndUpdate(
        { _id: quizId, userId: toObjectId(req.user.userId) },
        updates,
        { new: true },
      );

      if (!quiz) {
        res.status(404).json({ success: false, error: 'Quiz not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: quiz });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const quizId = toObjectId(req.params.id);
      const result = await StudentQuiz.findOneAndDelete({
        _id: quizId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Quiz not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Quiz deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async recordQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const quizId = toObjectId(req.params.id);
      const { score, totalPoints, percentage, timeSpentSeconds, answers } = req.body;

      const quiz = await StudentQuiz.findById(quizId);
      if (!quiz) {
        res.status(404).json({ success: false, error: 'Quiz not found.' });
        return;
      }

      const attempt = await QuizAttempt.create({
        userId: toObjectId(req.user.userId),
        quizId: quiz._id,
        quizTitle: quiz.title,
        subject: quiz.subject,
        score: Number(score) || 0,
        totalPoints: Number(totalPoints) || 1,
        percentage: Number(percentage) || 0,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        answers: Array.isArray(answers) ? answers : [],
      });

      res.status(201).json({ success: true, data: attempt });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getQuizAttempts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const attempts = await QuizAttempt.find({ userId: toObjectId(req.user.userId) })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.status(200).json({ success: true, data: attempts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 4. SMART NOTES
  // -------------------------------------------------------------------------
  static async getNotes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const { subject, tag, search } = req.query;

      const query: any = { userId };
      if (subject && typeof subject === 'string' && subject !== 'all') {
        query.subject = subject;
      }
      if (tag && typeof tag === 'string') {
        query.tags = tag;
      }
      if (search && typeof search === 'string') {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [{ title: regex }, { content: regex }];
      }

      const notes = await StudentNote.find(query).sort({ isPinned: -1, updatedAt: -1 }).lean();
      res.status(200).json({ success: true, data: notes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, content, tags, isPinned, isDraft } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const note = await StudentNote.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        content: content || '',
        tags: Array.isArray(tags) ? tags : [],
        isPinned: Boolean(isPinned),
        isDraft: Boolean(isDraft),
      });

      res.status(201).json({ success: true, data: note });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const noteId = toObjectId(req.params.id);
      const updates = { ...req.body };

      const note = await StudentNote.findOneAndUpdate(
        { _id: noteId, userId: toObjectId(req.user.userId) },
        updates,
        { new: true },
      );

      if (!note) {
        res.status(404).json({ success: false, error: 'Note not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: note });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const noteId = toObjectId(req.params.id);
      const result = await StudentNote.findOneAndDelete({
        _id: noteId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Note not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Note deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 5. STUDY SESSIONS (POMODORO)
  // -------------------------------------------------------------------------
  static async getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const sessions = await StudySession.find({ userId: toObjectId(req.user.userId) })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      res.status(200).json({ success: true, data: sessions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async recordSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { durationMinutes, sessionType, subject, notes } = req.body;
      const session = await StudySession.create({
        userId: toObjectId(req.user.userId),
        durationMinutes: Number(durationMinutes) || 25,
        sessionType: sessionType || 'pomodoro',
        subject: subject || 'General',
        notes: notes || '',
      });

      res.status(201).json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 6. TIMETABLE
  // -------------------------------------------------------------------------
  static async getTimetable(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      let timetable = await StudentTimetable.findOne({
        userId: toObjectId(req.user.userId),
      }).lean();

      if (!timetable) {
        timetable = await StudentTimetable.create({
          userId: toObjectId(req.user.userId),
          name: 'My Weekly Schedule',
          entries: [],
        });
      }

      res.status(200).json({ success: true, data: timetable });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateTimetable(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { name, entries } = req.body;
      const timetable = await StudentTimetable.findOneAndUpdate(
        { userId: toObjectId(req.user.userId) },
        { name: name || 'My Weekly Schedule', entries: Array.isArray(entries) ? entries : [] },
        { new: true, upsert: true },
      );

      res.status(200).json({ success: true, data: timetable });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 7. LEARNING GOALS
  // -------------------------------------------------------------------------
  static async getGoals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const goals = await LearningGoal.find({ userId: toObjectId(req.user.userId) })
        .sort({ isCompleted: 1, targetDate: 1 })
        .lean();

      res.status(200).json({ success: true, data: goals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, targetDate, milestones } = req.body;
      if (!title) {
        res.status(400).json({ success: false, error: 'Goal title is required.' });
        return;
      }

      const goal = await LearningGoal.create({
        userId: toObjectId(req.user.userId),
        title,
        subject: subject || 'General',
        targetDate: targetDate ? new Date(targetDate) : undefined,
        progressPercent: 0,
        isCompleted: false,
        milestones: Array.isArray(milestones) ? milestones : [],
      });

      res.status(201).json({ success: true, data: goal });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const goalId = toObjectId(req.params.id);
      const updates = { ...req.body };

      if (Array.isArray(updates.milestones) && updates.milestones.length > 0) {
        const completedCount = updates.milestones.filter((m: any) => m.completed).length;
        updates.progressPercent = Math.round((completedCount / updates.milestones.length) * 100);
        updates.isCompleted = updates.progressPercent === 100;
      }

      const goal = await LearningGoal.findOneAndUpdate(
        { _id: goalId, userId: toObjectId(req.user.userId) },
        updates,
        { new: true },
      );

      if (!goal) {
        res.status(404).json({ success: false, error: 'Goal not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: goal });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const goalId = toObjectId(req.params.id);
      const result = await LearningGoal.findOneAndDelete({
        _id: goalId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Goal not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Goal deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 8. TEACHER: CLASSES & ATTENDANCE
  // -------------------------------------------------------------------------
  static async getClasses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classes = await TeacherClass.find({
        userId: toObjectId(req.user.userId),
      })
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: classes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getClassById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.id);
      const teacherClass = await TeacherClass.findOne({
        _id: classId,
        userId: toObjectId(req.user.userId),
      }).lean();

      if (!teacherClass) {
        res.status(404).json({ success: false, error: 'Class not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: teacherClass });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { name, subject, gradeLevel, academicTerm, description, students } = req.body;
      if (!name || !subject) {
        res.status(400).json({ success: false, error: 'Class name and subject are required.' });
        return;
      }

      const formattedStudents = Array.isArray(students)
        ? students.map((s: any) => ({
            id: s.id || new Types.ObjectId().toString(),
            name: s.name || 'Student',
            email: s.email || '',
            studentIdNumber: s.studentIdNumber || '',
          }))
        : [];

      const newClass = await TeacherClass.create({
        userId: toObjectId(req.user.userId),
        name,
        subject,
        gradeLevel: gradeLevel || '',
        academicTerm: academicTerm || '',
        description: description || '',
        students: formattedStudents,
      });

      // Automatically initialize an empty Gradebook for this class
      await TeacherGradebook.create({
        userId: toObjectId(req.user.userId),
        classId: newClass._id,
        categories: [
          { id: 'cat-1', name: 'Homework', weight: 20 },
          { id: 'cat-2', name: 'Quizzes', weight: 30 },
          { id: 'cat-3', name: 'Exams', weight: 50 },
        ],
        assignments: [],
        grades: [],
      });

      res.status(201).json({ success: true, data: newClass });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.id);
      const updates = { ...req.body };

      if (Array.isArray(updates.students)) {
        updates.students = updates.students.map((s: any) => ({
          id: s.id || new Types.ObjectId().toString(),
          name: s.name || 'Student',
          email: s.email || '',
          studentIdNumber: s.studentIdNumber || '',
        }));
      }

      const updated = await TeacherClass.findOneAndUpdate(
        { _id: classId, userId: toObjectId(req.user.userId) },
        updates,
        { new: true },
      );

      if (!updated) {
        res.status(404).json({ success: false, error: 'Class not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.id);
      const userId = toObjectId(req.user.userId);

      const result = await TeacherClass.findOneAndDelete({ _id: classId, userId });
      if (!result) {
        res.status(404).json({ success: false, error: 'Class not found or unauthorized.' });
        return;
      }

      // Clean up linked gradebook and attendance
      await Promise.all([
        TeacherGradebook.deleteMany({ classId }),
        AttendanceRecord.deleteMany({ classId }),
      ]);

      res.status(200).json({ success: true, message: 'Class deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.classId);
      const { date } = req.query;

      const query: any = {
        classId,
        userId: toObjectId(req.user.userId),
      };
      if (date && typeof date === 'string') {
        query.date = date;
      }

      const records = await AttendanceRecord.find(query).sort({ date: -1 }).lean();
      res.status(200).json({ success: true, data: records });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async saveAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.classId);
      const { date, records } = req.body;

      if (!date || !Array.isArray(records)) {
        res.status(400).json({ success: false, error: 'Date and records array are required.' });
        return;
      }

      const attendance = await AttendanceRecord.findOneAndUpdate(
        {
          classId,
          date,
          userId: toObjectId(req.user.userId),
        },
        {
          userId: toObjectId(req.user.userId),
          classId,
          date,
          records,
        },
        { new: true, upsert: true },
      );

      res.status(200).json({ success: true, data: attendance });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 9. TEACHER: GRADEBOOK
  // -------------------------------------------------------------------------
  static async getGradebook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.classId);
      let gradebook = await TeacherGradebook.findOne({
        classId,
        userId: toObjectId(req.user.userId),
      }).lean();

      if (!gradebook) {
        gradebook = await TeacherGradebook.create({
          userId: toObjectId(req.user.userId),
          classId,
          categories: [
            { id: 'cat-1', name: 'Homework', weight: 20 },
            { id: 'cat-2', name: 'Quizzes', weight: 30 },
            { id: 'cat-3', name: 'Exams', weight: 50 },
          ],
          assignments: [],
          grades: [],
        });
      }

      res.status(200).json({ success: true, data: gradebook });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateGradebook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const classId = toObjectId(req.params.classId);
      const { categories, assignments, grades } = req.body;

      const gradebook = await TeacherGradebook.findOneAndUpdate(
        {
          classId,
          userId: toObjectId(req.user.userId),
        },
        {
          categories: Array.isArray(categories) ? categories : [],
          assignments: Array.isArray(assignments) ? assignments : [],
          grades: Array.isArray(grades) ? grades : [],
        },
        { new: true, upsert: true },
      );

      res.status(200).json({ success: true, data: gradebook });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 10. TEACHER: LESSON PLANS
  // -------------------------------------------------------------------------
  static async getLessonPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const plans = await LessonPlan.find({ userId: toObjectId(req.user.userId) })
        .sort({ updatedAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: plans });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createLessonPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const {
        title,
        subject,
        gradeLevel,
        durationMinutes,
        templateType,
        objectives,
        materials,
        activities,
        assessmentMethods,
        homework,
      } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const plan = await LessonPlan.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        gradeLevel: gradeLevel || '',
        durationMinutes: Number(durationMinutes) || 45,
        templateType: templateType || 'standard',
        objectives: Array.isArray(objectives) ? objectives : [],
        materials: Array.isArray(materials) ? materials : [],
        activities: Array.isArray(activities) ? activities : [],
        assessmentMethods: assessmentMethods || '',
        homework: homework || '',
      });

      res.status(201).json({ success: true, data: plan });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateLessonPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const planId = toObjectId(req.params.id);
      const plan = await LessonPlan.findOneAndUpdate(
        { _id: planId, userId: toObjectId(req.user.userId) },
        req.body,
        { new: true },
      );

      if (!plan) {
        res.status(404).json({ success: false, error: 'Lesson plan not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: plan });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteLessonPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const planId = toObjectId(req.params.id);
      const result = await LessonPlan.findOneAndDelete({
        _id: planId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Lesson plan not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Lesson plan deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 11. TEACHER: RUBRICS
  // -------------------------------------------------------------------------
  static async getRubrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const rubrics = await Rubric.find({ userId: toObjectId(req.user.userId) })
        .sort({ updatedAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: rubrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createRubric(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, description, criteria } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const rubric = await Rubric.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        description: description || '',
        criteria: Array.isArray(criteria) ? criteria : [],
      });

      res.status(201).json({ success: true, data: rubric });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async updateRubric(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const rubricId = toObjectId(req.params.id);
      const rubric = await Rubric.findOneAndUpdate(
        { _id: rubricId, userId: toObjectId(req.user.userId) },
        req.body,
        { new: true },
      );

      if (!rubric) {
        res.status(404).json({ success: false, error: 'Rubric not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, data: rubric });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteRubric(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const rubricId = toObjectId(req.params.id);
      const result = await Rubric.findOneAndDelete({
        _id: rubricId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Rubric not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Rubric deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 12. TEACHER: WORKSHEETS & EXAMS & QUESTION BANKS
  // -------------------------------------------------------------------------
  static async getWorksheets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const worksheets = await Worksheet.find({ userId: toObjectId(req.user.userId) })
        .sort({ updatedAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: worksheets });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createWorksheet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, instructions, gradeLevel, questions } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const worksheet = await Worksheet.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        instructions: instructions || 'Read each question carefully and provide the best answer.',
        gradeLevel: gradeLevel || '',
        questions: Array.isArray(questions) ? questions : [],
      });

      res.status(201).json({ success: true, data: worksheet });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteWorksheet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const worksheetId = toObjectId(req.params.id);
      const result = await Worksheet.findOneAndDelete({
        _id: worksheetId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Worksheet not found.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Worksheet deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getExams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const exams = await Exam.find({ userId: toObjectId(req.user.userId) })
        .sort({ updatedAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: exams });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createExam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { title, subject, instructions, durationMinutes, totalPoints, sections } = req.body;
      if (!title || !subject) {
        res.status(400).json({ success: false, error: 'Title and subject are required.' });
        return;
      }

      const exam = await Exam.create({
        userId: toObjectId(req.user.userId),
        title,
        subject,
        instructions: instructions || '',
        durationMinutes: Number(durationMinutes) || 60,
        totalPoints: Number(totalPoints) || 100,
        sections: Array.isArray(sections) ? sections : [],
      });

      res.status(201).json({ success: true, data: exam });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteExam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const examId = toObjectId(req.params.id);
      const result = await Exam.findOneAndDelete({
        _id: examId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Exam not found.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Exam deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async getQuestionBanks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const banks = await QuestionBank.find({ userId: toObjectId(req.user.userId) })
        .sort({ updatedAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: banks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async createQuestionBank(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const { name, subject, questions } = req.body;
      if (!name || !subject) {
        res.status(400).json({ success: false, error: 'Name and subject are required.' });
        return;
      }

      const bank = await QuestionBank.create({
        userId: toObjectId(req.user.userId),
        name,
        subject,
        questions: Array.isArray(questions) ? questions : [],
      });

      res.status(201).json({ success: true, data: bank });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async deleteQuestionBank(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const bankId = toObjectId(req.params.id);
      const result = await QuestionBank.findOneAndDelete({
        _id: bankId,
        userId: toObjectId(req.user.userId),
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Question bank not found.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Question bank deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  // -------------------------------------------------------------------------
  // 13. DATA EXPORT & IMPORT & USER DATA PURGE (PRIVACY & DATA OWNERSHIP)
  // -------------------------------------------------------------------------
  static async exportUserData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);

      const [
        tasks,
        decks,
        quizzes,
        attempts,
        notes,
        sessions,
        timetable,
        goals,
        classes,
        lessonPlans,
        rubrics,
      ] = await Promise.all([
        StudyTask.find({ userId }).lean(),
        FlashcardDeck.find({ userId }).lean(),
        StudentQuiz.find({ userId }).lean(),
        QuizAttempt.find({ userId }).lean(),
        StudentNote.find({ userId }).lean(),
        StudySession.find({ userId }).lean(),
        StudentTimetable.findOne({ userId }).lean(),
        LearningGoal.find({ userId }).lean(),
        TeacherClass.find({ userId }).lean(),
        LessonPlan.find({ userId }).lean(),
        Rubric.find({ userId }).lean(),
      ]);

      const bundle = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: {
          id: req.user.userId,
          email: req.user.email,
        },
        data: {
          tasks,
          decks,
          quizzes,
          attempts,
          notes,
          sessions,
          timetable,
          goals,
          classes,
          lessonPlans,
          rubrics,
        },
      };

      res.status(200).json({ success: true, data: bundle });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async importUserData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const { bundle } = req.body;

      if (!bundle || !bundle.data) {
        res.status(400).json({ success: false, error: 'Invalid backup bundle format.' });
        return;
      }

      const { tasks, decks, notes, goals } = bundle.data;
      let importedCount = 0;

      if (Array.isArray(tasks) && tasks.length > 0) {
        const taskDocs = tasks.map((t: any) => ({
          userId,
          subject: t.subject || 'General',
          title: t.title || 'Untitled Task',
          description: t.description || '',
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          deadline: t.deadline ? new Date(t.deadline) : undefined,
        }));
        await StudyTask.insertMany(taskDocs);
        importedCount += taskDocs.length;
      }

      if (Array.isArray(decks) && decks.length > 0) {
        const deckDocs = decks.map((d: any) => ({
          userId,
          title: d.title || 'Imported Deck',
          subject: d.subject || 'General',
          description: d.description || '',
          isPublic: false,
          cards: Array.isArray(d.cards) ? d.cards : [],
        }));
        await FlashcardDeck.insertMany(deckDocs);
        importedCount += deckDocs.length;
      }

      if (Array.isArray(notes) && notes.length > 0) {
        const noteDocs = notes.map((n: any) => ({
          userId,
          title: n.title || 'Imported Note',
          subject: n.subject || 'General',
          content: n.content || '',
          tags: Array.isArray(n.tags) ? n.tags : [],
          isPinned: Boolean(n.isPinned),
        }));
        await StudentNote.insertMany(noteDocs);
        importedCount += noteDocs.length;
      }

      if (Array.isArray(goals) && goals.length > 0) {
        const goalDocs = goals.map((g: any) => ({
          userId,
          title: g.title || 'Imported Goal',
          subject: g.subject || 'General',
          progressPercent: g.progressPercent || 0,
          isCompleted: Boolean(g.isCompleted),
          milestones: Array.isArray(g.milestones) ? g.milestones : [],
        }));
        await LearningGoal.insertMany(goalDocs);
        importedCount += goalDocs.length;
      }

      res.status(200).json({
        success: true,
        message: `Successfully imported ${importedCount} items.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }

  static async purgeUserData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const userId = toObjectId(req.user.userId);

      await Promise.all([
        StudyTask.deleteMany({ userId }),
        FlashcardDeck.deleteMany({ userId }),
        StudentQuiz.deleteMany({ userId }),
        QuizAttempt.deleteMany({ userId }),
        StudentNote.deleteMany({ userId }),
        StudySession.deleteMany({ userId }),
        StudentTimetable.deleteMany({ userId }),
        LearningGoal.deleteMany({ userId }),
        TeacherClass.deleteMany({ userId }),
        AttendanceRecord.deleteMany({ userId }),
        TeacherGradebook.deleteMany({ userId }),
        LessonPlan.deleteMany({ userId }),
        Rubric.deleteMany({ userId }),
        Worksheet.deleteMany({ userId }),
        Exam.deleteMany({ userId }),
        QuestionBank.deleteMany({ userId }),
      ]);

      res.status(200).json({
        success: true,
        message: 'All educational user data has been permanently cleared.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  }
}
