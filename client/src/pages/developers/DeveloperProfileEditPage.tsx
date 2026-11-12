import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { User, Upload, Save, Eye, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { developerApi } from '../../services/developerApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const DeveloperProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [biography, setBiography] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [remotePreference, setRemotePreference] = useState('remote');
  const [availability, setAvailability] = useState('available');
  const [location, setLocation] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [technologiesStr, setTechnologiesStr] = useState('');
  const [servicesStr, setServicesStr] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [allowContactForm, setAllowContactForm] = useState(true);
  const [preferredMethod, setPreferredMethod] = useState<'form' | 'email' | 'linkedin' | 'github'>(
    'form',
  );
  const [isPublished, setIsPublished] = useState(true);

  // Media previews
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    try {
      setIsLoading(true);
      const res = await developerApi.getMyProfile();
      if (res.success && res.data) {
        const p = res.data;
        setUsername(p.username || '');
        setDisplayName(p.displayName || '');
        setHeadline(p.headline || '');
        setBiography(p.biography || '');
        setExperienceLevel(p.experienceLevel || 'intermediate');
        setRemotePreference(p.remotePreference || 'remote');
        setAvailability(p.availability || 'available');
        setLocation(p.location || '');
        setSkillsStr((p.skills || []).join(', '));
        setTechnologiesStr((p.technologies || []).join(', '));
        setServicesStr((p.services || []).join(', '));
        setPortfolioUrl(p.portfolioUrl || '');
        setGithubUrl(p.githubUrl || '');
        setLinkedinUrl(p.linkedinUrl || '');
        setWebsiteUrl(p.websiteUrl || '');
        setAllowContactForm(p.contactPreferences?.allowContactForm ?? true);
        setPreferredMethod(p.contactPreferences?.preferredMethod || 'form');
        setIsPublished(p.isPublished ?? true);
        setProfileImage(p.profileImage || '');
        setCoverImage(p.coverImage || '');
      }
    } catch {
      // fresh profile
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const res = await developerApi.uploadAvatar(file);
      if (res.success && res.data?.url) {
        setProfileImage(res.data.url);
        updateUser({ avatarUrl: res.data.url });
        toast('Avatar updated successfully!', 'success');
      } else {
        throw new Error(res.error || 'Avatar upload failed');
      }
    } catch (err: any) {
      toast(err.message || 'Avatar upload failed', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const res = await developerApi.uploadCover(file);
      if (res.success && res.data?.url) {
        setCoverImage(res.data.url);
        toast('Cover photo updated successfully!', 'success');
      } else {
        throw new Error(res.error || 'Cover photo upload failed');
      }
    } catch (err: any) {
      toast(err.message || 'Cover upload failed', 'error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const res = await developerApi.saveProfile({
        username: username.trim(),
        displayName: displayName.trim(),
        headline: headline.trim(),
        biography: biography.trim(),
        experienceLevel,
        remotePreference,
        availability,
        location: location.trim(),
        skills: skillsStr,
        technologies: technologiesStr,
        services: servicesStr,
        portfolioUrl: portfolioUrl.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
        contactPreferences: {
          allowContactForm,
          preferredMethod,
        },
        isPublished,
      });

      if (res.success && res.data) {
        toast('Developer profile saved successfully!', 'success');
        navigate(`/developers/profile/${res.data.username}`);
      } else {
        throw new Error(res.error || 'Failed to save profile');
      }
    } catch (err: any) {
      toast(err.message || 'Profile saving error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border border-[var(--theme-gray-border)] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs font-bold">Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-4">
          <Link
            to="/developers"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-100 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Developer Directory</span>
          </Link>

          {username && (
            <Link
              to={`/developers/profile/${username}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-xl font-mono text-xs font-bold shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Public Profile</span>
            </Link>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Manage Developer Profile
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
            Build your public portfolio. Showcase your experience and attract opportunities.
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">Profile Visuals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase font-mono">Avatar Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900/60 border border-[var(--theme-gray-border)] overflow-hidden flex items-center justify-center font-black text-xl shrink-0">
                    {profileImage ? (
                      <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-mono text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      PNG, JPG up to 10MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase font-mono">Cover Banner</label>
                <div className="h-20 w-full rounded-xl bg-slate-900/60 border border-[var(--theme-gray-border)] overflow-hidden relative flex items-center justify-center">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Default Gradient Banner
                    </span>
                  )}
                  <input
                    type="file"
                    id="cover-input"
                    accept="image/*"
                    onChange={handleCoverFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingCover}
                    onClick={() => document.getElementById('cover-input')?.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white border border-black rounded-lg font-mono text-[11px] font-bold shadow-sm cursor-pointer"
                  >
                    {isUploadingCover ? 'Uploading...' : 'Change Cover'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">
              Personal & Professional Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Username (URL handle) *
                </label>
                <input
                  type="text"
                  required
                  pattern="[a-z0-9_-]+"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                  }
                  placeholder="e.g. alexrivera"
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                  vexoramods.local/developers/profile/{username || 'username'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-mono mb-1">
                Headline (Short summary)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={160}
                placeholder="e.g. Senior Full-Stack Engineer | React, Node.js & Distributed Systems"
                className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-mono mb-1">Biography</label>
              <textarea
                rows={5}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                maxLength={3000}
                placeholder="Tell potential clients, collaborators, and recruiters about your background, career focus, and favorite projects..."
                className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-mono mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Manila, Philippines or Remote"
                className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Experience & Work Preferences */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">
              Work & Availability
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold"
                >
                  <option value="beginner">Beginner</option>
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Work Mode
                </label>
                <select
                  value={remotePreference}
                  onChange={(e) => setRemotePreference(e.target.value)}
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold"
                >
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold"
                >
                  <option value="available">Available for work</option>
                  <option value="open">Open to opportunities</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills, Tech, Services */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">
              Skills & Services
            </h2>

            <div>
              <label className="block text-xs font-black uppercase font-mono mb-1">
                Core Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="TypeScript, React, Node.js, System Architecture, UI Design"
                className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-mono mb-1">
                Technologies & Tools (Comma-separated)
              </label>
              <input
                type="text"
                value={technologiesStr}
                onChange={(e) => setTechnologiesStr(e.target.value)}
                placeholder="Docker, PostgreSQL, Redis, Tailwind CSS, AWS, Git"
                className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase font-mono mb-1">
                Services Offered (Comma-separated)
              </label>
              <input
                type="text"
                value={servicesStr}
                onChange={(e) => setServicesStr(e.target.value)}
                placeholder="Web Development, API Design, Performance Optimization, Code Audits"
                className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Social & Portfolio Links */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">
              Portfolio & Social Links
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase font-mono mb-1">
                  Personal Website
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://mywebsite.com"
                  className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Visibility Settings */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">
              Visibility & Contact Preferences
            </h2>

            <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-black rounded border border-[var(--theme-gray-border)]"
              />
              <div className="text-xs">
                <span className="font-black text-slate-100 block">Publish profile publicly</span>
                <span className="font-medium text-slate-400 block">
                  Allow clients, businesses, and developers to discover your profile in the
                  directory.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={allowContactForm}
                onChange={(e) => setAllowContactForm(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-black rounded border border-[var(--theme-gray-border)]"
              />
              <div className="text-xs">
                <span className="font-black text-slate-100 block">Allow contact form inquiries</span>
                <span className="font-medium text-slate-400 block">
                  Visitors can send job opportunities or project inquiries directly without exposing
                  your email address.
                </span>
              </div>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3.5 px-8 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-sm font-black text-slate-100 shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>

            {username && (
              <Link
                to={`/developers/profile/${username}`}
                className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-mono text-xs font-black shadow-sm"
              >
                Cancel & View
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
