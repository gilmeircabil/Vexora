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
  Upload,
  MailOpen,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { LetterPaper } from '../../components/lovelink/LetterPaper.js';
import { EnvelopeExperience } from '../../components/lovelink/EnvelopeExperience.js';
import { FloatingHearts } from '../../components/lovelink/FloatingHearts.js';
import {
  loveLinkApi,
  LETTER_TEMPLATES,
  PAPER_LAYOUTS,
  type LetterCustomization,
  type PaperLayoutId,
  type WaxSealId,
  type ParticleEffectId,
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
    paperLayout: 'classic',
    salutation: 'Dearest',
    signOff: 'With all my love,',
    waxSeal: 'heart',
    particleEffect: 'petals',
    bgTheme: 'romance',
    envelopeStyle: 'classic-red',
    openingAnimation: 'gentle-unfold',
    musicPreset: 'gentle-chimes',
    customMusicUrl: '',
    customMusicTitle: '',
    photoStyle: 'grid',
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
  const [previewStage, setPreviewStage] = useState<'paper' | 'envelope'>('paper');
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

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (isAuthenticated) {
      try {
        const uploaded = await loveLinkApi.uploadMedia(file);
        setAttachments((prev) => [...prev, uploaded.url]);
        showToast('Photo uploaded to cloud storage', 'success');
        return;
      } catch (err: any) {
        showToast(err.message || 'Cloud upload failed, using local preview', 'error');
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setAttachments((prev) => [...prev, canvas.toDataURL('image/jpeg', 0.82)]);
        } else {
          setAttachments((prev) => [...prev, dataUrl]);
        }
      };
      img.onerror = () => setAttachments((prev) => [...prev, dataUrl]);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast('Audio file must be under 15 MB', 'error');
      return;
    }

    if (isAuthenticated) {
      try {
        const uploaded = await loveLinkApi.uploadMedia(file);
        setCustomization((prev) => ({
          ...prev,
          musicPreset: 'custom',
          customMusicUrl: uploaded.url,
          customMusicTitle: prev.customMusicTitle || file.name.replace(/\.[^/.]+$/, ''),
        }));
        showToast(`Uploaded audio to cloud storage: ${file.name}`, 'success');
        return;
      } catch (err: any) {
        showToast(err.message || 'Cloud upload failed, using local preview', 'error');
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomization((prev) => ({
        ...prev,
        musicPreset: 'custom',
        customMusicUrl: reader.result as string,
        customMusicTitle: prev.customMusicTitle || file.name.replace(/\.[^/.]+$/, ''),
      }));
      showToast(`Attached audio: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--theme-canvas)] flex flex-col w-full">
      {/* Studio Header — anchored flush at top-0 */}
      <div
        data-testid="lovelink-studio-header"
        className="sticky top-0 z-30 shrink-0 h-16 bg-[var(--theme-canvas)]/95 backdrop-blur-md border-b border-[var(--theme-gray-border)] px-4 sm:px-6 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            to="/lovelink"
            className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)] hover:text-white transition-colors"
            title="Back to LoveLink"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--theme-dirty-white)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>LoveLink Studio</span>
            </h1>
            <p className="text-xs text-[var(--theme-gray-muted)] hidden sm:block">
              Craft your romantic letter with live preview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/lovelink/my-letters"
              className="hidden md:inline-flex px-3 py-1.5 rounded-full text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 border border-rose-900/50 transition-all"
            >
              My Letters
            </Link>
          )}
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

      {/* Main Studio Two-Column Split Workspace */}
      <div className="flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Independent Scrollable Editor Controls (5 cols) */}
        <div className="lg:col-span-5 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-r border-[var(--theme-gray-border)] p-4 sm:p-6 space-y-5">
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
                placeholder="e.g. Someone Special, My Dearest, Sweetheart"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Greeting / Salutation
                </label>
                <input
                  type="text"
                  placeholder="Dearest"
                  value={customization.salutation ?? 'Dearest'}
                  onChange={(e) =>
                    setCustomization({ ...customization, salutation: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Sign-Off Phrase
                </label>
                <input
                  type="text"
                  placeholder="With all my love,"
                  value={customization.signOff ?? 'With all my love,'}
                  onChange={(e) => setCustomization({ ...customization, signOff: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
                />
              </div>
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
                Choose Color Theme
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

            {/* Paper Layout Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-2">
                Letter Paper Design
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAPER_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() =>
                      setCustomization({ ...customization, paperLayout: layout.id as PaperLayoutId })
                    }
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      (customization.paperLayout || 'classic') === layout.id
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[var(--theme-dirty-white)] truncate">
                      {layout.name}
                    </div>
                    <div className="text-[10px] text-[var(--theme-gray-muted)]">{layout.badge}</div>
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

            {/* Wax Seal & Floating Particles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Wax Seal Emblem
                </label>
                <select
                  value={customization.waxSeal || 'heart'}
                  onChange={(e) =>
                    setCustomization({ ...customization, waxSeal: e.target.value as WaxSealId })
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
                >
                  <option value="heart">Crimson Heart</option>
                  <option value="crown">Royal Crown</option>
                  <option value="star">Shooting Star</option>
                  <option value="sparkle">Golden Sparkle</option>
                  <option value="lock">Secret Lock</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] mb-1">
                  Floating Particles
                </label>
                <select
                  value={customization.particleEffect || 'petals'}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      particleEffect: e.target.value as ParticleEffectId,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
                >
                  <option value="petals">Falling Flowers &amp; Sakura Petals</option>
                  <option value="hearts">Floating Hearts &amp; Blossoms</option>
                  <option value="butterflies">Fluttering Butterflies</option>
                  <option value="fireflies">Golden Fireflies</option>
                  <option value="stars">Twinkling Starlight</option>
                  <option value="sparkles">Magic Sparkles</option>
                  <option value="none">No Particles</option>
                </select>
              </div>
            </div>

            {/* Background Melody & Custom Song */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[var(--theme-gray-muted)] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                <span>Ambient Music Preset</span>
              </label>
              <select
                aria-label="Ambient Music Preset"
                value={customization.musicPreset || 'gentle-chimes'}
                onChange={(e) =>
                  setCustomization({ ...customization, musicPreset: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
              >
                <option value="gentle-chimes">Gentle Romantic Chimes</option>
                <option value="musicbox-lullaby">Music Box Lullaby</option>
                <option value="romantic-piano">Soft Romantic Piano</option>
                <option value="dreamy-harp">Dreamy Celestial Harp</option>
                <option value="custom">Custom Song Link or Audio File (Spotify / YouTube / MP3)</option>
                <option value="none">No Background Music</option>
              </select>

              {customization.musicPreset === 'custom' && (
                <div className="p-3 rounded-xl bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] space-y-2">
                  <input
                    type="text"
                    placeholder="Spotify, YouTube, or direct audio URL..."
                    value={customization.customMusicUrl || ''}
                    onChange={(e) =>
                      setCustomization({ ...customization, customMusicUrl: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Song title / dedication (optional)..."
                      value={customization.customMusicTitle || ''}
                      onChange={(e) =>
                        setCustomization({ ...customization, customMusicTitle: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
                    />
                    <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Audio</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Photo Memories */}
          <div className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--theme-dirty-white)] uppercase tracking-wider font-mono">
                3. Photo Attachments
              </h2>
              <select
                aria-label="Photo Display Style"
                value={customization.photoStyle || 'grid'}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    photoStyle: e.target.value as 'grid' | 'polaroid',
                  })
                }
                className="px-2.5 py-1 rounded-lg text-[11px] bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
              >
                <option value="grid">Modern Grid</option>
                <option value="polaroid">Polaroid Frames</option>
              </select>
            </div>
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
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <label className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-canvas)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-rose-400" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />
              </label>
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

        {/* Right Column: Live Interactive Preview Stage (7 cols) */}
        <div className="lg:col-span-7 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto p-4 sm:p-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--theme-gray-border)] shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)]">
                Live Recipient Preview ({previewMode})
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
              <button
                type="button"
                onClick={() => setPreviewStage('paper')}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  previewStage === 'paper'
                    ? 'bg-rose-500 text-white'
                    : 'text-[var(--theme-gray-muted)] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paper View</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewStage('envelope')}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  previewStage === 'envelope'
                    ? 'bg-rose-500 text-white'
                    : 'text-[var(--theme-gray-muted)] hover:text-white'
                }`}
              >
                <MailOpen className="w-3.5 h-3.5" />
                <span>Envelope Reveal</span>
              </button>
            </div>
          </div>

          {/* Frame for Desktop vs Mobile preview */}
          <div
            className={`mx-auto transition-all duration-300 flex-1 flex flex-col ${
              previewMode === 'mobile'
                ? 'max-w-[380px] w-full border-4 border-zinc-700 rounded-[36px] p-2 bg-zinc-900 shadow-2xl overflow-hidden'
                : 'w-full'
            }`}
          >
            <div className="relative flex-1 min-h-[72vh] p-4 sm:p-8 bg-[var(--theme-canvas)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden flex items-center justify-center">
              {previewStage === 'envelope' ? (
                <EnvelopeExperience
                  letter={{
                    publicToken: 'studio-preview',
                    recipientName: recipientName || 'Someone Special',
                    senderName: senderName || 'Yours Truly',
                    isAnonymous,
                    title,
                    message: message || 'Your heartfelt love message will appear here...',
                    template,
                    customization,
                    attachments,
                    createdAt: new Date().toISOString(),
                  }}
                />
              ) : (
                <>
                  <FloatingHearts
                    count={24}
                    effect={customization.particleEffect || 'petals'}
                  />
                  <div className="relative z-10 w-full py-4">
                    <LetterPaper
                      recipientName={recipientName || 'Someone Special'}
                      senderName={senderName || 'Yours Truly'}
                      isAnonymous={isAnonymous}
                      title={title}
                      message={message || 'Your heartfelt love message will appear here...'}
                      template={template}
                      customization={customization}
                      attachments={attachments}
                      createdAt={new Date().toISOString()}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
