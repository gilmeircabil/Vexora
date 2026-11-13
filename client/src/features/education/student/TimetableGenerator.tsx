import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Printer, AlertTriangle, Clock, MapPin, User } from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';
import { useToast } from '../../../context/ToastContext.js';

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  subject: string;
  location?: string;
  instructor?: string;
  color?: string;
}

const DAYS: Array<
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PRESET_COLORS = [
  '#FFD21A', // Yellow
  '#38BDF8', // Cyan
  '#4ADE80', // Green
  '#A78BFA', // Purple
  '#FB7185', // Rose
  '#F97316', // Orange
];

export const TimetableGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [scheduleName, setScheduleName] = useState('My Weekly Timetable');
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<TimetableEntry, 'id'>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    subject: '',
    location: '',
    instructor: '',
    color: '#FFD21A',
  });

  const loadTimetable = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getTimetable();
      if (res.success && res.data) {
        setEntries(res.data.entries || []);
        if (res.data.name) setScheduleName(res.data.name);
      }
    } catch (e) {
      console.error('Failed to load timetable', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  // Detect overlapping schedules
  const getOverlaps = (): string[] => {
    const overlaps: string[] = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        if (!a || !b) continue;

        if (a.day === b.day) {
          // Check time overlap: (startA < endB) and (endA > startB)
          if (a.startTime < b.endTime && a.endTime > b.startTime) {
            overlaps.push(
              `Conflict on ${a.day}: "${a.subject}" (${a.startTime}-${a.endTime}) overlaps with "${b.subject}" (${b.startTime}-${b.endTime})`,
            );
          }
        }
      }
    }
    return overlaps;
  };

  const overlaps = getOverlaps();

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;

    if (form.startTime >= form.endTime) {
      showToast('Start time must be before end time.', 'error');
      return;
    }

    const newEntry: TimetableEntry = {
      ...form,
      id: 'entry-' + Date.now(),
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    setIsModalOpen(false);
    setForm({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      subject: '',
      location: '',
      instructor: '',
      color: '#FFD21A',
    });

    await educationApi.updateTimetable({ name: scheduleName, entries: updated });
  };

  const handleDeleteEntry = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await educationApi.updateTimetable({ name: scheduleName, entries: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Class Timetable & Schedule Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Plan your weekly lecture schedule with real-time collision detection and printable
            layout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Schedule
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Class Slot
          </button>
        </div>
      </div>

      {/* Overlap Warnings */}
      {overlaps.length > 0 && (
        <div className="p-4 bg-red-50 rounded-2xl border-2 border-red-500 shadow-[3px_3px_0px_#EF4444] space-y-1.5">
          <div className="flex items-center gap-2 font-black text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Schedule Collision Detected:</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
            {overlaps.map((conflict, i) => (
              <li key={i}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const dayEntries = entries
            .filter((e) => e.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={day}
              className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm p-3.5 flex flex-col min-h-[320px]"
            >
              <div className="border-b border-[var(--theme-gray-border)] pb-2 mb-3 text-center">
                <span className="font-black text-xs uppercase tracking-wider text-slate-100">
                  {day}
                </span>
                <span className="block text-[10px] font-bold text-neutral-400">
                  {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {dayEntries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] font-bold text-neutral-300 italic py-6">
                    No classes
                  </div>
                ) : (
                  dayEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-[var(--theme-gray-border)] transition-all flex flex-col justify-between relative group text-xs"
                      style={{ backgroundColor: item.color || '#FFD21A' }}
                    >
                      <div>
                        <div className="flex items-center justify-between font-black text-[11px] text-slate-100/80 mb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.startTime} - {item.endTime}
                          </span>
                          <button
                            onClick={() => handleDeleteEntry(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-100 hover:text-red-700"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <h4 className="font-black text-sm text-slate-100 leading-tight">
                          {item.subject}
                        </h4>

                        {item.location && (
                          <span className="text-[10px] text-slate-100/70 flex items-center gap-1 mt-1 font-bold">
                            <MapPin className="w-2.5 h-2.5" />
                            {item.location}
                          </span>
                        )}

                        {item.instructor && (
                          <span className="text-[10px] text-slate-100/70 flex items-center gap-1 font-bold">
                            <User className="w-2.5 h-2.5" />
                            {item.instructor}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6">
            <h3 className="text-lg font-black mb-4">Add Weekly Class Slot</h3>
            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Day of the Week *
                </label>
                <select
                  value={form.day}
                  onChange={(e: any) => setForm({ ...form, day: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold bg-[var(--theme-surface)] focus:outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject / Activity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Lecture"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Room / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science Hall 302"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Aris"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Card Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setForm({ ...form, color })}
                      className={`w-7 h-7 rounded-lg border border-[var(--theme-gray-border)] transition-transform cursor-pointer ${
                        form.color === color ? 'scale-110 shadow-sm' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
