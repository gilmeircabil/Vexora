import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  Check,
  X,
  Clock,
  ShieldAlert,
  Download,
  BookOpen,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface ClassStudent {
  id: string;
  name: string;
  email?: string;
  studentIdNumber?: string;
}

export interface TeacherClassItem {
  _id: string;
  name: string;
  subject: string;
  gradeLevel?: string;
  academicTerm?: string;
  students: ClassStudent[];
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecordItem {
  _id: string;
  date: string;
  records: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export const AttendanceTracker: React.FC = () => {
  const [classes, setClasses] = useState<TeacherClassItem[]>([]);
  const [activeClass, setActiveClass] = useState<TeacherClassItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? '',
  );
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
  const [history, setHistory] = useState<AttendanceRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Class Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');

  // Add Student Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', studentIdNumber: '' });

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getClasses();
      if (res.success && Array.isArray(res.data)) {
        setClasses(res.data);
        if (!activeClass && res.data.length > 0) {
          setActiveClass(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load teacher classes', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Load attendance when activeClass or selectedDate changes
  useEffect(() => {
    if (!activeClass) return;

    const loadAttendance = async () => {
      const res = await educationApi.getAttendance(activeClass._id);
      if (res.success && Array.isArray(res.data)) {
        setHistory(res.data);

        // Find today's record if existing
        const dayRecord = res.data.find((r: AttendanceRecordItem) => r.date === selectedDate);
        if (dayRecord) {
          const map: Record<string, AttendanceStatus> = {};
          dayRecord.records.forEach((r: any) => {
            map[r.studentId] = r.status;
          });
          setAttendanceRecords(map);
        } else {
          // Default all enrolled students to 'present'
          const defaultMap: Record<string, AttendanceStatus> = {};
          activeClass.students.forEach((s) => {
            defaultMap[s.id] = 'present';
          });
          setAttendanceRecords(defaultMap);
        }
      }
    };

    loadAttendance();
  }, [activeClass, selectedDate]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassSubject.trim()) return;

    const res = await educationApi.createClass({
      name: newClassName.trim(),
      subject: newClassSubject.trim(),
      students: [],
    });

    if (res.success) {
      setIsClassModalOpen(false);
      setNewClassName('');
      setNewClassSubject('');
      loadClasses();
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !newStudent.name.trim()) return;

    const updatedStudents: ClassStudent[] = [
      ...activeClass.students,
      {
        id: 's-' + Date.now(),
        name: newStudent.name.trim(),
        email: newStudent.email.trim(),
        studentIdNumber: newStudent.studentIdNumber.trim(),
      },
    ];

    const res = await educationApi.updateClass(activeClass._id, { students: updatedStudents });
    if (res.success) {
      setActiveClass(res.data);
      setIsStudentModalOpen(false);
      setNewStudent({ name: '', email: '', studentIdNumber: '' });
      loadClasses();
    }
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!activeClass) return;

    const records = activeClass.students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      status: attendanceRecords[s.id] || 'present',
    }));

    const res = await educationApi.saveAttendance(activeClass._id, selectedDate, records);
    if (res.success) {
      alert(`Attendance for ${selectedDate} saved successfully.`);
      // Reload history
      const hRes = await educationApi.getAttendance(activeClass._id);
      if (hRes.success) setHistory(hRes.data);
    }
  };

  const handleExportCSV = () => {
    if (!activeClass || activeClass.students.length === 0) return;

    let csv =
      'Student ID,Student Name,Present Days,Absent Days,Late Days,Excused Days,Attendance %\n';
    activeClass.students.forEach((student) => {
      let present = 0;
      let absent = 0;
      let late = 0;
      let excused = 0;

      history.forEach((h) => {
        const r = h.records.find((rec) => rec.studentId === student.id);
        if (r?.status === 'present') present++;
        else if (r?.status === 'absent') absent++;
        else if (r?.status === 'late') late++;
        else if (r?.status === 'excused') excused++;
      });

      const total = present + absent + late + excused;
      const pct = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;
      csv += `"${student.studentIdNumber || ''}","${student.name}",${present},${absent},${late},${excused},${pct}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${activeClass.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Compute student stats
  const getStudentStats = (studentId: string) => {
    let present = 0;
    let absent = 0;
    let total = 0;

    history.forEach((h) => {
      const r = h.records.find((rec) => rec.studentId === studentId);
      if (r) {
        total++;
        if (r.status === 'present' || r.status === 'late') present++;
        else if (r.status === 'absent') absent++;
      }
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 100;
    return { present, absent, total, rate };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Class Attendance & Roster Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Take roll calls, calculate historical attendance rates, and export official reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeClass && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}

          <button
            onClick={() => setIsClassModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Class
          </button>
        </div>
      </div>

      {/* Class Switcher & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--theme-surface-raised)] p-4 rounded-2xl border border-[var(--theme-gray-border)]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-black text-slate-300 uppercase">Class:</span>
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => setActiveClass(cls)}
              className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black shrink-0 transition-all cursor-pointer ${
                activeClass?._id === cls._id
                  ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
                  : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
              }`}
            >
              {cls.name} ({cls.students?.length || 0})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-[var(--theme-gray-border)] rounded-xl text-xs font-black bg-[var(--theme-surface)] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Roster & Roll Call Table */}
      {activeClass ? (
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-gray-border)] pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-100">
                {activeClass.name} — Roll Call for {selectedDate}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeClass.subject} • {activeClass.students.length} students enrolled
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="px-3 py-1.5 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
              >
                + Add Student
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-1.5 bg-[#4ADE80] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                Save Attendance
              </button>
            </div>
          </div>

          {activeClass.students.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-xl">
              <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No students enrolled yet</p>
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="mt-3 px-3 py-1 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-lg border border-black"
              >
                Enroll Student
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--theme-gray-border)] text-slate-400 uppercase tracking-wider font-black">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">ID Number</th>
                    <th className="py-2.5 px-3">Attendance Rate</th>
                    <th className="py-2.5 px-3 text-center">Status for {selectedDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {activeClass.students.map((student) => {
                    const currentStatus = attendanceRecords[student.id] || 'present';
                    const stats = getStudentStats(student.id);

                    return (
                      <tr key={student.id} className="hover:bg-neutral-50 font-medium">
                        <td className="py-3 px-3 font-bold text-slate-100">{student.name}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {student.studentIdNumber || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-black ${
                              stats.rate >= 90
                                ? 'text-emerald-600'
                                : stats.rate >= 75
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {stats.rate}%
                          </span>{' '}
                          <span className="text-[10px] text-neutral-400">
                            ({stats.present}/{stats.total})
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSetStatus(student.id, 'present')}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-all ${
                                currentStatus === 'present'
                                  ? 'bg-[#4ADE80] border-black text-slate-100 shadow-sm'
                                  : 'border-neutral-200 text-slate-400 hover:border-black'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleSetStatus(student.id, 'late')}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-all ${
                                currentStatus === 'late'
                                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-black text-slate-100 shadow-sm'
                                  : 'border-neutral-200 text-slate-400 hover:border-black'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => handleSetStatus(student.id, 'absent')}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-all ${
                                currentStatus === 'absent'
                                  ? 'bg-red-500 border-black text-white shadow-sm'
                                  : 'border-neutral-200 text-slate-400 hover:border-black'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleSetStatus(student.id, 'excused')}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-all ${
                                currentStatus === 'excused'
                                  ? 'bg-[var(--theme-dirty-white)] border-[var(--theme-gray-border)] text-[var(--theme-canvas)] shadow-xs'
                                  : 'border-neutral-200 text-slate-400 hover:border-black'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">
            Create or select a class to take attendance
          </p>
        </div>
      )}

      {/* New Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black">Create New Class</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Period 2 Physics"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Chemistry, Literature"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black">Add Student to {activeClass?.name}</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Watson"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Student ID Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2024-001"
                  value={newStudent.studentIdNumber}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, studentIdNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="student@school.edu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
