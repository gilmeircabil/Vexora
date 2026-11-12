import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  Search,
  Download,
  Tag,
  BookOpen,
  Edit2,
  Check,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface NoteItem {
  _id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isDraft: boolean;
  updatedAt: string;
}

export const SmartNotes: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Editing / New note state
  const [isEditing, setIsEditing] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    subject: '',
    content: '',
    tagsString: '',
    isPinned: false,
    isDraft: false,
  });

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getNotes({
        search: searchQuery || undefined,
        subject: subjectFilter !== 'all' ? subjectFilter : undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setNotes(res.data);
        if (!selectedNote && res.data.length > 0) {
          setSelectedNote(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [searchQuery, subjectFilter]);

  const allSubjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)));

  const handleOpenNew = () => {
    setSelectedNote(null);
    setNoteForm({
      title: '',
      subject: '',
      content: '',
      tagsString: '',
      isPinned: false,
      isDraft: false,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      subject: note.subject,
      content: note.content,
      tagsString: (note.tags || []).join(', '),
      isPinned: note.isPinned,
      isDraft: note.isDraft,
    });
    setIsEditing(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.subject.trim()) return;

    const tags = noteForm.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: noteForm.title.trim(),
      subject: noteForm.subject.trim(),
      content: noteForm.content,
      tags,
      isPinned: noteForm.isPinned,
      isDraft: noteForm.isDraft,
    };

    if (selectedNote) {
      const res = await educationApi.updateNote(selectedNote._id, payload);
      if (res.success) {
        setSelectedNote(res.data);
      }
    } else {
      const res = await educationApi.createNote(payload);
      if (res.success) {
        setSelectedNote(res.data);
      }
    }
    setIsEditing(false);
    loadNotes();
  };

  const handleTogglePin = async (note: NoteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await educationApi.updateNote(note._id, { isPinned: !note.isPinned });
    loadNotes();
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      await educationApi.deleteNote(id);
      if (selectedNote?._id === id) setSelectedNote(null);
      loadNotes();
    }
  };

  const handleExportMarkdown = (note: NoteItem) => {
    const markdownContent = `# ${note.title}\n\n**Subject:** ${note.subject}\n**Tags:** ${
      note.tags.join(', ') || 'None'
    }\n**Last Updated:** ${new Date(note.updatedAt).toLocaleString()}\n\n---\n\n${note.content}`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Smart Study Notes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Capture course lectures, organize revisions by topic, and export clean Markdown notes.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Note
        </button>
      </div>

      {/* Search & Subject Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium bg-[var(--theme-surface)] focus:outline-none"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="border border-[var(--theme-gray-border)] rounded-xl px-3 py-2 text-xs font-bold bg-[var(--theme-surface)] focus:outline-none"
        >
          <option value="all">All Subjects</option>
          {allSubjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Layout: Sidebar list + Active preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Note Cards List */}
        <div className="md:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-bold text-slate-400">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center bg-[var(--theme-surface)] rounded-xl border-2 border-dashed border-neutral-300">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No notes yet</p>
            </div>
          ) : (
            notes.map((note) => {
              const isSelected = selectedNote?._id === note._id;
              return (
                <div
                  key={note._id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-black bg-[var(--theme-surface-raised)] shadow-sm'
                      : 'border-neutral-200 bg-[var(--theme-surface)] hover:border-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface)] border border-black/20 text-slate-300">
                      {note.subject}
                    </span>
                    <button
                      onClick={(e) => handleTogglePin(note, e)}
                      className={`p-1 rounded transition-colors ${
                        note.isPinned
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-neutral-300 hover:text-slate-100'
                      }`}
                      title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h4 className="font-black text-sm text-slate-100 truncate">{note.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.content}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-[10px] text-neutral-400 font-medium">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    {note.tags && note.tags.length > 0 && (
                      <span className="truncate max-w-[120px]">#{note.tags.join(' #')}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Note Reader / Editor Preview */}
        <div className="md:col-span-2">
          {isEditing ? (
            <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-4">
              <h3 className="font-black text-lg">
                {selectedNote ? 'Edit Study Note' : 'Create Study Note'}
              </h3>

              <form onSubmit={handleSaveNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. World History, Macroeconomics"
                      value={noteForm.subject}
                      onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Note Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Industrial Revolution Summary"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. chapter-4, exam-prep, timeline"
                    value={noteForm.tagsString}
                    onChange={(e) => setNoteForm({ ...noteForm, tagsString: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Content (Markdown Supported)
                  </label>
                  <textarea
                    rows={12}
                    placeholder="Write detailed study notes, outlines, key formulas, or questions..."
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    className="w-full px-3.5 py-3 border border-[var(--theme-gray-border)] rounded-xl text-xs font-mono focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={noteForm.isPinned}
                      onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                      className="rounded border-black"
                    />
                    <span>Pin this note to top</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : selectedNote ? (
            <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-gray-border)] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20 text-slate-300">
                      {selectedNote.subject}
                    </span>
                    {selectedNote.isPinned && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        Pinned
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-100">{selectedNote.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportMarkdown(selectedNote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-neutral-50 text-xs font-bold"
                    title="Export as Markdown (.md)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export .MD
                  </button>
                  <button
                    onClick={() => handleOpenEdit(selectedNote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] text-xs font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDeleteNote(selectedNote._id, e)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-neutral-100 rounded-md text-[11px] font-bold text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Note Content */}
              <div className="prose max-w-none text-xs sm:text-sm text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed pt-2">
                {selectedNote.content || (
                  <span className="text-neutral-400 italic">This note is currently empty.</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Select a note to view or edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
