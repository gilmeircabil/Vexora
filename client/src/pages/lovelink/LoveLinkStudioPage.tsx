import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  Save,
  Send,
  Eye,
  Smartphone,
  Monitor,
  Lock,
  Calendar,
  Clock,
  Sparkles,
  Music,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { LetterPaper } from '../../components/lovelink/LetterPaper.js';
import {
  loveLinkApi,
  LETTER_TEMPLATES,
  type LetterCustomization,
  type LoveLetter,
} from '../../services/loveLinkService.js';

export const LoveLinkStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const editId = searchParams.get('id');
  const initialTemplate = searchParams.get('template') || 'classic';

  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState(initialTemplate);
  const [customization, setCustomization] = useState<LetterCustomization>({
    font: 'serif',
    bgTheme: 'romance',
    envelopeStyle: 'classic-red',
    openingAnimation: 'gentle-unfold',
    musicPreset: 'gentle-chimes',
    alignment: 'center',
    decorativeElements: [],
  });

  const [attachments, setAttachments] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [scheduledRevealAt, setScheduledRevealAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (editId && isAuthenticated) {
      loveLinkApi
        .getUserLetters()
        .then(({ letters }) => {
          const found = letters.find((l) => l._id === editId);
          if (found) {
            setRecipientName(found.recipientName);
            setSenderName(found.senderName);
            setIsAnonymous(found.isAnonymous);
            setTitle(found.title);
            setMessage(found.message);
            setTemplate(found.template);
            setCustomization(found.customization || {});
            setAttachments(found.attachments || []);
            setIsPasswordProtected(found.isPasswordProtected);
            if (found.scheduledRevealAt) {
              setScheduledRevealAt(new Date(found.scheduledRevealAt).toISOString().slice(0, 16));
            }
            if (found.expiresAt) {
              setExpiresAt(new Date(found.expiresAt).toISOString().slice(0, 16));
            }
          }
        })
        .catch(() => {
          showToast('Failed to load draft letter.', 'error');
        });
    }
  }, [editId, isAuthenticated, showToast]);

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    try {
      new URL(newPhotoUrl);
      setAttachments([...attachments, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    } catch {
      showToast('Please enter a valid image URL', 'error');
    }
  };

  const handleSaveDraft = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save your letter', 'info');
      navigate('/login?redirect=/lovelink/create');
      return;
    }
    if (!recipientName.trim()) {
      showToast('Recipient name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        recipientName,
        senderName,
        isAnonymous,
        title,
        message,
        template,
        customization,
        attachments,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined,
        scheduledRevealAt: scheduledRevealAt ? new Date(scheduledRevealAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      if (editId) {
        await loveLinkApi.updateLetter(editId, payload);
        showToast('Draft updated successfully', 'success');
      } else {
        const saved = await loveLinkApi.createLetter(payload);
        showToast('Draft created successfully', 'success');
        navigate(`/lovelink/create?id=${saved._id}`, { replace: true });
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to publish your letter', 'info');
      navigate('/login?redirect=/lovelink/create');
      return;
    }
    if (!recipientName.trim() || !message.trim()) {
      showToast('Please provide both recipient name and message to publish', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      let targetId = editId;
      const payload = {
        recipientName,
        senderName,
        isAnonymous,
        title,
        message,
        template,
        customization,
        attachments,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined,
        scheduledRevealAt: scheduledRevealAt ? new Date(scheduledRevealAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      if (!targetId) {
        const saved = await loveLinkApi.createLetter(payload);
        targetId = saved._id;
      } else {
        await loveLinkApi.updateLetter(targetId, payload);
      }

      const published = await loveLinkApi.publishLetter(targetId);
      showToast('Letter published with love! Redirecting to share...', 'success');
      navigate(`/lovelink/share/${published.letter._id}`);
    } catch (err: any) {
      showToast(err.message || 'Error publishing letter', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] pb-16">
      {/* Studio Header */}
      <div className="sticky top-16 z-30 bg-[var(--theme-canvas)]/95 backdrop-blur-md border-b border-[var(--theme-gray-border)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[var(--theme-dirty-white)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>LoveLink Studio</span>
          </h1>
          <p className="text-xs text-[var(--theme-gray-muted)]">
            Craft your romantic letter with live preview
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop/Mobile Preview Toggle */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                previewMode === 'desktop'
                  ? 'bg-rose-500 text-white'
                  : 'text-[var(--theme-gray-muted)] hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                previewMode === 'mobile'
                  ? 'bg-rose-500 text-white'
                  : 'text-[var(--theme-gray-muted)] hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-rose-400" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish & Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Core Details */}
          <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--theme-dirty-white)] uppercase tracking-wider font-mono">
              1. Letter Content
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Valerie, My Dearest, Sweetheart"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex, Yours Truly"
                  disabled={isAnonymous}
                  value={isAnonymous ? 'Anonymous' : senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--theme-dirty-white)]">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded accent-rose-500"
                  />
                  <span>Send Anonymously</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                Letter Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. A note from my heart, Happy 2nd Anniversary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                Your Message *
              </label>
              <textarea
                rows={6}
                placeholder="Pour your heart into these lines..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card 2: Template & Styling */}
          <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--theme-dirty-white)] uppercase tracking-wider font-mono">
              2. Romantic Appearance
            </h2>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-2">
                Choose Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LETTER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setTemplate(tmpl.id);
                      setCustomization((prev) => ({ ...prev, font: tmpl.font }));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      template === tmpl.id
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[var(--theme-dirty-white)] truncate">
                      {tmpl.name}
                    </div>
                    <div className="text-[10px] text-[var(--theme-gray-muted)]">{tmpl.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Alignment */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Typography
                </label>
                <select
                  value={customization.font || 'serif'}
                  onChange={(e) =>
                    setCustomization({ ...customization, font: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
                >
                  <option value="serif">Elegant Serif</option>
                  <option value="script">Romantic Script</option>
                  <option value="handwriting">Cute Handwriting</option>
                  <option value="sans">Clean Modern Sans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Text Alignment
                </label>
                <div className="flex rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-canvas)] p-1">
                  <button
                    type="button"
                    onClick={() => setCustomization({ ...customization, alignment: 'left' })}
                    className={`flex-1 py-1 flex justify-center rounded-lg ${
                      customization.alignment === 'left' ? 'bg-rose-500 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomization({ ...customization, alignment: 'center' })}
                    className={`flex-1 py-1 flex justify-center rounded-lg ${
                      customization.alignment === 'center'
                        ? 'bg-rose-500 text-white'
                        : 'text-zinc-400'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomization({ ...customization, alignment: 'right' })}
                    className={`flex-1 py-1 flex justify-center rounded-lg ${
                      customization.alignment === 'right' ? 'bg-rose-500 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Background Melody */}
            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                <span>Ambient Music Preset</span>
              </label>
              <select
                value={customization.musicPreset || 'gentle-chimes'}
                onChange={(e) =>
                  setCustomization({ ...customization, musicPreset: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
              >
                <option value="gentle-chimes">Gentle Romantic Chimes</option>
                <option value="musicbox-lullaby">Music Box Lullaby</option>
                <option value="none">No Background Music</option>
              </select>
            </div>
          </div>

          {/* Card 3: Photo Memories */}
          <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--theme-dirty-white)] uppercase tracking-wider font-mono">
              3. Photo Attachments
            </h2>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste public photo image URL..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {attachments.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-black/20 aspect-square">
                    <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-rose-400 hover:text-white"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Optional Security & Reveal Settings */}
          <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--theme-dirty-white)] uppercase tracking-wider font-mono">
              4. Privacy & Timing Controls
            </h2>

            {/* Password Protection */}
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--theme-dirty-white)]">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="rounded accent-rose-500"
                />
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Password Protect this Letter</span>
              </label>

              {isPasswordProtected && (
                <input
                  type="password"
                  placeholder="Set secret unlock password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
                />
              )}
            </div>

            {/* Scheduled Reveal */}
            <div className="pt-2 border-t border-[var(--theme-gray-border)] space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Scheduled Reveal (Surprise Date)</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledRevealAt}
                onChange={(e) => setScheduledRevealAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
              />
            </div>

            {/* Expiration */}
            <div className="pt-2 border-t border-[var(--theme-gray-border)] space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Expiration Date (Auto-expire access)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="sticky top-32">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--theme-gray-border)]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)]">
                  Live Recipient Preview ({previewMode})
                </span>
              </div>
              <div className="text-xs text-[var(--theme-gray-muted)]">
                Updates dynamically as you write
              </div>
            </div>

            {/* Frame for Desktop vs Mobile preview */}
            <div
              className={`mx-auto transition-all duration-300 ${
                previewMode === 'mobile'
                  ? 'max-w-[360px] border-4 border-zinc-700 rounded-[36px] p-2 bg-zinc-900 shadow-2xl overflow-hidden'
                  : 'w-full'
              }`}
            >
              <div className="p-2 sm:p-4 bg-[var(--theme-canvas)] rounded-2xl overflow-y-auto max-h-[75vh]">
                <LetterPaper
                  recipientName={recipientName || 'Valerie'}
                  senderName={senderName || 'Alex'}
                  isAnonymous={isAnonymous}
                  title={title}
                  message={message || 'Your heartfelt love message will appear here...'}
                  template={template}
                  customization={customization}
                  attachments={attachments}
                  createdAt={new Date().toISOString()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
