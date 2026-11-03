function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('tn_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const educationApi = {
  // Profile & Role
  async updateEducationRole(role: 'student' | 'teacher' | 'educator') {
    const res = await fetch('/api/education/profile/role', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async getDashboardSummary() {
    const res = await fetch('/api/education/dashboard', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Tasks
  async getTasks(params?: { status?: string; subject?: string; priority?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.subject) query.append('subject', params.subject);
    if (params?.priority) query.append('priority', params.priority);
    const res = await fetch(`/api/education/student/tasks?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createTask(data: any) {
    const res = await fetch('/api/education/student/tasks', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTask(id: string, data: any) {
    const res = await fetch(`/api/education/student/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteTask(id: string) {
    const res = await fetch(`/api/education/student/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Flashcards
  async getFlashcardDecks(filter?: 'my' | 'public') {
    const query = filter ? `?filter=${filter}` : '';
    const res = await fetch(`/api/education/student/flashcards${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getFlashcardDeck(id: string) {
    const res = await fetch(`/api/education/student/flashcards/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createFlashcardDeck(data: any) {
    const res = await fetch('/api/education/student/flashcards', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateFlashcardDeck(id: string, data: any) {
    const res = await fetch(`/api/education/student/flashcards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteFlashcardDeck(id: string) {
    const res = await fetch(`/api/education/student/flashcards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async reviewCard(deckId: string, cardId: string, known: boolean) {
    const res = await fetch(`/api/education/student/flashcards/${deckId}/review`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ cardId, known }),
    });
    return res.json();
  },

  // Quizzes
  async getQuizzes(filter?: 'my' | 'public') {
    const query = filter ? `?filter=${filter}` : '';
    const res = await fetch(`/api/education/student/quizzes${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getQuiz(id: string) {
    const res = await fetch(`/api/education/student/quizzes/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createQuiz(data: any) {
    const res = await fetch('/api/education/student/quizzes', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateQuiz(id: string, data: any) {
    const res = await fetch(`/api/education/student/quizzes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteQuiz(id: string) {
    const res = await fetch(`/api/education/student/quizzes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async recordQuizAttempt(quizId: string, data: any) {
    const res = await fetch(`/api/education/student/quizzes/${quizId}/attempt`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getQuizAttempts() {
    const res = await fetch('/api/education/student/quiz-attempts', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Smart Notes
  async getNotes(params?: { subject?: string; tag?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.subject) query.append('subject', params.subject);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`/api/education/student/notes?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createNote(data: any) {
    const res = await fetch('/api/education/student/notes', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateNote(id: string, data: any) {
    const res = await fetch(`/api/education/student/notes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteNote(id: string) {
    const res = await fetch(`/api/education/student/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Study Sessions (Pomodoro)
  async getSessions() {
    const res = await fetch('/api/education/student/sessions', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async recordSession(data: any) {
    const res = await fetch('/api/education/student/sessions', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Timetable
  async getTimetable() {
    const res = await fetch('/api/education/student/timetable', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateTimetable(data: any) {
    const res = await fetch('/api/education/student/timetable', {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Goals
  async getGoals() {
    const res = await fetch('/api/education/student/goals', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createGoal(data: any) {
    const res = await fetch('/api/education/student/goals', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateGoal(id: string, data: any) {
    const res = await fetch(`/api/education/student/goals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteGoal(id: string) {
    const res = await fetch(`/api/education/student/goals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // -------------------------------------------------------------------------
  // TEACHER APIS
  // -------------------------------------------------------------------------
  async getClasses() {
    const res = await fetch('/api/education/teacher/classes', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getClass(id: string) {
    const res = await fetch(`/api/education/teacher/classes/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createClass(data: any) {
    const res = await fetch('/api/education/teacher/classes', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateClass(id: string, data: any) {
    const res = await fetch(`/api/education/teacher/classes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteClass(id: string) {
    const res = await fetch(`/api/education/teacher/classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAttendance(classId: string, date?: string) {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`/api/education/teacher/attendance/${classId}${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveAttendance(classId: string, date: string, records: any[]) {
    const res = await fetch(`/api/education/teacher/attendance/${classId}`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ date, records }),
    });
    return res.json();
  },

  async getGradebook(classId: string) {
    const res = await fetch(`/api/education/teacher/gradebook/${classId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateGradebook(classId: string, data: any) {
    const res = await fetch(`/api/education/teacher/gradebook/${classId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getLessonPlans() {
    const res = await fetch('/api/education/teacher/lesson-plans', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createLessonPlan(data: any) {
    const res = await fetch('/api/education/teacher/lesson-plans', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateLessonPlan(id: string, data: any) {
    const res = await fetch(`/api/education/teacher/lesson-plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteLessonPlan(id: string) {
    const res = await fetch(`/api/education/teacher/lesson-plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getRubrics() {
    const res = await fetch('/api/education/teacher/rubrics', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createRubric(data: any) {
    const res = await fetch('/api/education/teacher/rubrics', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateRubric(id: string, data: any) {
    const res = await fetch(`/api/education/teacher/rubrics/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteRubric(id: string) {
    const res = await fetch(`/api/education/teacher/rubrics/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getWorksheets() {
    const res = await fetch('/api/education/teacher/worksheets', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createWorksheet(data: any) {
    const res = await fetch('/api/education/teacher/worksheets', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteWorksheet(id: string) {
    const res = await fetch(`/api/education/teacher/worksheets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getExams() {
    const res = await fetch('/api/education/teacher/exams', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createExam(data: any) {
    const res = await fetch('/api/education/teacher/exams', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteExam(id: string) {
    const res = await fetch(`/api/education/teacher/exams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getQuestionBanks() {
    const res = await fetch('/api/education/teacher/question-banks', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createQuestionBank(data: any) {
    const res = await fetch('/api/education/teacher/question-banks', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteQuestionBank(id: string) {
    const res = await fetch(`/api/education/teacher/question-banks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // -------------------------------------------------------------------------
  // DATA EXPORT & IMPORT & PURGE
  // -------------------------------------------------------------------------
  async exportUserData() {
    const res = await fetch('/api/education/export', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async importUserData(bundle: any) {
    const res = await fetch('/api/education/import', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ bundle }),
    });
    return res.json();
  },

  async purgeUserData() {
    const res = await fetch('/api/education/data', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
