import mongoose, { Schema, Document, Types } from 'mongoose';

// ---------------------------------------------------------------------------
// 1. Study Task
// ---------------------------------------------------------------------------
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface IStudyTask extends Document {
  userId: Types.ObjectId;
  subject: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: Date;
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudyTaskSchema = new Schema<IStudyTask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const StudyTask: mongoose.Model<IStudyTask> =
  (mongoose.models.StudyTask as mongoose.Model<IStudyTask>) ||
  mongoose.model<IStudyTask>('StudyTask', StudyTaskSchema);

// ---------------------------------------------------------------------------
// 2. Flashcard & Deck
// ---------------------------------------------------------------------------
export interface IFlashcardItem {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  box: number; // 1 to 5 (Leitner system)
  nextReviewDate: Date;
  intervalDays: number;
  repetitions: number;
  lastReviewedAt?: Date;
}

export interface IFlashcardDeck extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  description?: string;
  isPublic: boolean;
  cards: IFlashcardItem[];
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardDeckSchema = new Schema<IFlashcardDeck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100, index: true },
    description: { type: String, default: '', maxlength: 1000 },
    isPublic: { type: Boolean, default: false, index: true },
    cards: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        answer: { type: String, required: true },
        hint: { type: String, default: '' },
        box: { type: Number, default: 1, min: 1, max: 5 },
        nextReviewDate: { type: Date, default: Date.now },
        intervalDays: { type: Number, default: 1 },
        repetitions: { type: Number, default: 0 },
        lastReviewedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true },
);

export const FlashcardDeck: mongoose.Model<IFlashcardDeck> =
  (mongoose.models.FlashcardDeck as mongoose.Model<IFlashcardDeck>) ||
  mongoose.model<IFlashcardDeck>('FlashcardDeck', FlashcardDeckSchema);

// ---------------------------------------------------------------------------
// 3. Student Quiz & Attempts
// ---------------------------------------------------------------------------
export type QuizQuestionType =
  'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_the_blank' | 'identification';

export interface IQuestionSourceReference {
  documentName: string;
  pageNumber?: number;
  slideNumber?: number;
  section?: string;
  excerpt: string;
}

export interface IQuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  acceptableAlternatives?: string[]; // for identification and fill-in-the-blank
  explanation?: string;
  points: number;
  sourceReference?: IQuestionSourceReference;
}

export interface IStudentQuiz extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  description?: string;
  durationMinutes: number; // 0 for untimed
  isPublic: boolean;
  questions: IQuizQuestion[];
  sourceDocument?: {
    name: string;
    fileType: string;
    totalPages?: number;
    totalSlides?: number;
    extractedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentQuizSchema = new Schema<IStudentQuiz>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100, index: true },
    description: { type: String, default: '', maxlength: 1000 },
    durationMinutes: { type: Number, default: 0, min: 0 },
    isPublic: { type: Boolean, default: false, index: true },
    sourceDocument: {
      name: { type: String },
      fileType: { type: String },
      totalPages: { type: Number },
      totalSlides: { type: Number },
      extractedAt: { type: Date },
    },
    questions: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: [
            'multiple_choice',
            'true_false',
            'short_answer',
            'fill_in_the_blank',
            'identification',
          ],
          required: true,
        },
        prompt: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        acceptableAlternatives: [{ type: String }],
        explanation: { type: String, default: '' },
        points: { type: Number, default: 1, min: 1 },
        sourceReference: {
          documentName: { type: String },
          pageNumber: { type: Number },
          slideNumber: { type: Number },
          section: { type: String },
          excerpt: { type: String },
        },
      },
    ],
  },
  { timestamps: true },
);

export const StudentQuiz: mongoose.Model<IStudentQuiz> =
  (mongoose.models.StudentQuiz as mongoose.Model<IStudentQuiz>) ||
  mongoose.model<IStudentQuiz>('StudentQuiz', StudentQuizSchema);

export interface IQuizAttemptAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  pointsEarned: number;
}

export interface IQuizAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  quizTitle: string;
  subject: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: IQuizAttemptAnswer[];
  createdAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'StudentQuiz', required: true, index: true },
    quizTitle: { type: String, required: true },
    subject: { type: String, default: 'General' },
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    answers: [
      {
        questionId: { type: String, required: true },
        questionText: { type: String, default: '' },
        userAnswer: { type: String, default: '' },
        correctAnswer: { type: String, default: '' },
        isCorrect: { type: Boolean, required: true },
        explanation: { type: String, default: '' },
        pointsEarned: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

export const QuizAttempt: mongoose.Model<IQuizAttempt> =
  (mongoose.models.QuizAttempt as mongoose.Model<IQuizAttempt>) ||
  mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

// ---------------------------------------------------------------------------
// 4. Smart Notes
// ---------------------------------------------------------------------------
export interface IStudentNote extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentNoteSchema = new Schema<IStudentNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 100, index: true },
    content: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    isPinned: { type: Boolean, default: false, index: true },
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const StudentNote: mongoose.Model<IStudentNote> =
  (mongoose.models.StudentNote as mongoose.Model<IStudentNote>) ||
  mongoose.model<IStudentNote>('StudentNote', StudentNoteSchema);

// ---------------------------------------------------------------------------
// 5. Study Session (Pomodoro & Focus Tracking)
// ---------------------------------------------------------------------------
export interface IStudySession extends Document {
  userId: Types.ObjectId;
  durationMinutes: number;
  sessionType: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
  subject?: string;
  notes?: string;
  createdAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    sessionType: {
      type: String,
      enum: ['pomodoro', 'short_break', 'long_break', 'custom'],
      default: 'pomodoro',
    },
    subject: { type: String, default: 'General' },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true },
);

export const StudySession: mongoose.Model<IStudySession> =
  (mongoose.models.StudySession as mongoose.Model<IStudySession>) ||
  mongoose.model<IStudySession>('StudySession', StudySessionSchema);

// ---------------------------------------------------------------------------
// 6. Student Timetable
// ---------------------------------------------------------------------------
export interface ITimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  subject: string;
  location?: string;
  instructor?: string;
  color?: string;
}

export interface IStudentTimetable extends Document {
  userId: Types.ObjectId;
  name: string;
  entries: ITimetableEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentTimetableSchema = new Schema<IStudentTimetable>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, default: 'Weekly Schedule', trim: true },
    entries: [
      {
        id: { type: String, required: true },
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        subject: { type: String, required: true },
        location: { type: String, default: '' },
        instructor: { type: String, default: '' },
        color: { type: String, default: '#38BDF8' },
      },
    ],
  },
  { timestamps: true },
);

export const StudentTimetable: mongoose.Model<IStudentTimetable> =
  (mongoose.models.StudentTimetable as mongoose.Model<IStudentTimetable>) ||
  mongoose.model<IStudentTimetable>('StudentTimetable', StudentTimetableSchema);

// ---------------------------------------------------------------------------
// 7. Learning Goals & Achievements
// ---------------------------------------------------------------------------
export interface IGoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface ILearningGoal extends Document {
  userId: Types.ObjectId;
  title: string;
  subject?: string;
  targetDate?: Date;
  progressPercent: number;
  isCompleted: boolean;
  milestones: IGoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const LearningGoalSchema = new Schema<ILearningGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, default: 'General' },
    targetDate: { type: Date, default: null },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    isCompleted: { type: Boolean, default: false, index: true },
    milestones: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export const LearningGoal: mongoose.Model<ILearningGoal> =
  (mongoose.models.LearningGoal as mongoose.Model<ILearningGoal>) ||
  mongoose.model<ILearningGoal>('LearningGoal', LearningGoalSchema);

// ---------------------------------------------------------------------------
// 8. Teacher Classes & Attendance
// ---------------------------------------------------------------------------
export interface IClassStudent {
  id: string;
  name: string;
  email?: string;
  studentIdNumber?: string;
}

export interface ITeacherClass extends Document {
  userId: Types.ObjectId; // Teacher ID
  name: string;
  subject: string;
  gradeLevel?: string;
  academicTerm?: string;
  description?: string;
  students: IClassStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherClassSchema = new Schema<ITeacherClass>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100, index: true },
    gradeLevel: { type: String, default: '' },
    academicTerm: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 1000 },
    students: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, default: '' },
        studentIdNumber: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true },
);

export const TeacherClass: mongoose.Model<ITeacherClass> =
  (mongoose.models.TeacherClass as mongoose.Model<ITeacherClass>) ||
  mongoose.model<ITeacherClass>('TeacherClass', TeacherClassSchema);

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface IAttendanceStudentEntry {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface IAttendanceRecord extends Document {
  userId: Types.ObjectId; // Teacher ID
  classId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  records: IAttendanceStudentEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'TeacherClass', required: true, index: true },
    date: { type: String, required: true, index: true },
    records: [
      {
        studentId: { type: String, required: true },
        studentName: { type: String, required: true },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          default: 'present',
        },
        notes: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true },
);

// One attendance record per class per date
AttendanceRecordSchema.index({ classId: 1, date: 1 }, { unique: true });

export const AttendanceRecord: mongoose.Model<IAttendanceRecord> =
  (mongoose.models.AttendanceRecord as mongoose.Model<IAttendanceRecord>) ||
  mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);

// ---------------------------------------------------------------------------
// 9. Teacher Gradebook
// ---------------------------------------------------------------------------
export interface IGradeCategory {
  id: string;
  name: string;
  weight: number; // percentage (e.g. 20 for 20%)
}

export interface IGradeAssignment {
  id: string;
  name: string;
  categoryId: string;
  maxPoints: number;
  date?: string;
}

export interface IGradeScore {
  studentId: string;
  assignmentId: string;
  score: number;
  notes?: string;
}

export interface ITeacherGradebook extends Document {
  userId: Types.ObjectId;
  classId: Types.ObjectId;
  categories: IGradeCategory[];
  assignments: IGradeAssignment[];
  grades: IGradeScore[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherGradebookSchema = new Schema<ITeacherGradebook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherClass',
      required: true,
      unique: true,
      index: true,
    },
    categories: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    assignments: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        categoryId: { type: String, required: true },
        maxPoints: { type: Number, required: true, min: 1 },
        date: { type: String, default: '' },
      },
    ],
    grades: [
      {
        studentId: { type: String, required: true },
        assignmentId: { type: String, required: true },
        score: { type: Number, required: true },
        notes: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true },
);

export const TeacherGradebook: mongoose.Model<ITeacherGradebook> =
  (mongoose.models.TeacherGradebook as mongoose.Model<ITeacherGradebook>) ||
  mongoose.model<ITeacherGradebook>('TeacherGradebook', TeacherGradebookSchema);

// ---------------------------------------------------------------------------
// 10. Lesson Plan
// ---------------------------------------------------------------------------
export interface ILessonActivity {
  phase: string;
  durationMinutes: number;
  description: string;
}

export interface ILessonPlan extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  gradeLevel?: string;
  durationMinutes: number;
  templateType: '5e' | 'direct' | 'inquiry' | 'standard';
  objectives: string[];
  materials: string[];
  activities: ILessonActivity[];
  assessmentMethods?: string;
  homework?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LessonPlanSchema = new Schema<ILessonPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 100, index: true },
    gradeLevel: { type: String, default: '' },
    durationMinutes: { type: Number, default: 45, min: 5 },
    templateType: {
      type: String,
      enum: ['5e', 'direct', 'inquiry', 'standard'],
      default: 'standard',
    },
    objectives: [{ type: String, trim: true }],
    materials: [{ type: String, trim: true }],
    activities: [
      {
        phase: { type: String, required: true },
        durationMinutes: { type: Number, default: 10 },
        description: { type: String, default: '' },
      },
    ],
    assessmentMethods: { type: String, default: '' },
    homework: { type: String, default: '' },
  },
  { timestamps: true },
);

export const LessonPlan: mongoose.Model<ILessonPlan> =
  (mongoose.models.LessonPlan as mongoose.Model<ILessonPlan>) ||
  mongoose.model<ILessonPlan>('LessonPlan', LessonPlanSchema);

// ---------------------------------------------------------------------------
// 11. Rubric Builder
// ---------------------------------------------------------------------------
export interface IRubricLevel {
  id: string;
  name: string; // e.g. "Exemplary", "Proficient", "Developing", "Beginning"
  points: number;
  description: string;
}

export interface IRubricCriterion {
  id: string;
  title: string;
  weight: number;
  levels: IRubricLevel[];
}

export interface IRubric extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  description?: string;
  criteria: IRubricCriterion[];
  createdAt: Date;
  updatedAt: Date;
}

const RubricSchema = new Schema<IRubric>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '' },
    criteria: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        weight: { type: Number, default: 1 },
        levels: [
          {
            id: { type: String, required: true },
            name: { type: String, required: true },
            points: { type: Number, required: true },
            description: { type: String, default: '' },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export const Rubric: mongoose.Model<IRubric> =
  (mongoose.models.Rubric as mongoose.Model<IRubric>) ||
  mongoose.model<IRubric>('Rubric', RubricSchema);

// ---------------------------------------------------------------------------
// 12. Worksheet Generator
// ---------------------------------------------------------------------------
export interface IWorksheetQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'matching' | 'short_answer';
  question: string;
  options?: string[];
  matchingPairs?: { left: string; right: string }[];
  answer: string;
  points: number;
}

export interface IWorksheet extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  instructions?: string;
  gradeLevel?: string;
  questions: IWorksheetQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const WorksheetSchema = new Schema<IWorksheet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    instructions: {
      type: String,
      default: 'Read each question carefully and provide the best answer.',
    },
    gradeLevel: { type: String, default: '' },
    questions: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ['multiple_choice', 'true_false', 'fill_in_blank', 'matching', 'short_answer'],
          required: true,
        },
        question: { type: String, required: true },
        options: [{ type: String }],
        matchingPairs: [
          {
            left: { type: String, required: true },
            right: { type: String, required: true },
          },
        ],
        answer: { type: String, default: '' },
        points: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true },
);

export const Worksheet: mongoose.Model<IWorksheet> =
  (mongoose.models.Worksheet as mongoose.Model<IWorksheet>) ||
  mongoose.model<IWorksheet>('Worksheet', WorksheetSchema);

// ---------------------------------------------------------------------------
// 13. Exam & Question Bank
// ---------------------------------------------------------------------------
export interface IExamSection {
  id: string;
  title: string;
  instructions?: string;
  questions: IWorksheetQuestion[];
}

export interface IExam extends Document {
  userId: Types.ObjectId;
  title: string;
  subject: string;
  instructions?: string;
  durationMinutes: number;
  totalPoints: number;
  sections: IExamSection[];
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    instructions: { type: String, default: '' },
    durationMinutes: { type: Number, default: 60 },
    totalPoints: { type: Number, default: 100 },
    sections: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        instructions: { type: String, default: '' },
        questions: [
          {
            id: { type: String, required: true },
            type: {
              type: String,
              enum: ['multiple_choice', 'true_false', 'fill_in_blank', 'matching', 'short_answer'],
              required: true,
            },
            question: { type: String, required: true },
            options: [{ type: String }],
            matchingPairs: [{ left: String, right: String }],
            answer: { type: String, default: '' },
            points: { type: Number, default: 1 },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export const Exam: mongoose.Model<IExam> =
  (mongoose.models.Exam as mongoose.Model<IExam>) || mongoose.model<IExam>('Exam', ExamSchema);

export interface IQuestionBankItem {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'matching' | 'short_answer';
  question: string;
  options?: string[];
  answer: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IQuestionBank extends Document {
  userId: Types.ObjectId;
  name: string;
  subject: string;
  questions: IQuestionBankItem[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionBankSchema = new Schema<IQuestionBank>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    subject: { type: String, required: true, trim: true, maxlength: 100, index: true },
    questions: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ['multiple_choice', 'true_false', 'fill_in_blank', 'matching', 'short_answer'],
          required: true,
        },
        question: { type: String, required: true },
        options: [{ type: String }],
        answer: { type: String, default: '' },
        points: { type: Number, default: 1 },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      },
    ],
  },
  { timestamps: true },
);

export const QuestionBank: mongoose.Model<IQuestionBank> =
  (mongoose.models.QuestionBank as mongoose.Model<IQuestionBank>) ||
  mongoose.model<IQuestionBank>('QuestionBank', QuestionBankSchema);
