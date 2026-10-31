import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  MapPin,
  Briefcase,
  Globe,
  Mail,
  Send,
  Flag,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Code2,
  FolderGit2
} from 'lucide-react';
import { developerApi } from '../../services/developerApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const DeveloperProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact Modal
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username]);

  const loadProfile = async (u: string) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await developerApi.getProfileByUsername(u);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Developer profile not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    try {
      setIsSendingMessage(true);
      const res = await developerApi.contactDeveloper(username, {
        senderName: contactName,
        senderEmail: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      });

      if (res.success) {
        toast('Your inquiry was delivered to the developer.', 'success');
        setIsContactOpen(false);
        setContactSubject('');
        setContactMessage('');
      } else {
        throw new Error(res.error || 'Failed to send inquiry');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to deliver message', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.profile?._id) return;

    try {
      setIsSubmittingReport(true);
      const res = await developerApi.submitReport({
        targetType: 'profile',
        targetId: data.profile._id,
        reason: reportReason,
        description: reportDescription,
        reporterEmail: user?.email,
      });

      if (res.success) {
        toast('Report submitted to moderation team.', 'success');
        setIsReportOpen(false);
        setReportDescription('');
      } else {
        throw new Error(res.error || 'Failed to submit report');
      }
    } catch (err: any) {
      toast(err.message || 'Report submission failed', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs font-bold">Loading developer portfolio...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-xl mx-auto bg-white border-2 border-black rounded-2xl p-8 shadow-[6px_6px_0px_#000] text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-xl font-black text-black">Developer Profile Not Available</h2>
          <p className="text-xs font-semibold text-neutral-600">{error || 'This developer profile does not exist or has been hidden.'}</p>
          <Link
            to="/developers"
            className="inline-flex px-4 py-2 bg-[#FACC15] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000]"
          >
            &larr; Back to Developer Directory
          </Link>
        </div>
      </div>
    );
  }

  const { profile, projects, isOwner } = data;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Card with Cover Photo */}
        <div className="bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_#000] overflow-hidden">
          {/* Cover Banner */}
          <div className="h-44 sm:h-60 bg-[#FACC15] border-b-2 border-black relative overflow-hidden">
            {profile.coverImage ? (
              <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#FACC15] via-[#FB923C] to-[#F472B6]" />
            )}

            {isOwner && (
              <Link
                to="/developers/profile/edit"
                className="absolute top-4 right-4 px-3 py-1.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 hover:bg-neutral-100"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>

          {/* Profile Header Details */}
          <div className="p-6 sm:p-8 relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
              {/* Avatar */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#FAF7F2] border-3 border-black overflow-hidden shadow-[4px_4px_0px_#000] flex items-center justify-center font-black text-3xl shrink-0">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.displayName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {profile.contactPreferences?.allowContactForm && (
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Hire or Contact</span>
                  </button>
                )}

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]"
                  title="Report Profile"
                >
                  <Flag className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Identity & Badges */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-black">{profile.displayName}</h1>
                  <span className="text-sm font-mono text-neutral-500">@{profile.username}</span>
                  {profile.isFeatured && (
                    <span className="px-2 py-0.5 rounded-md bg-[#FACC15] border border-black font-mono text-[10px] font-bold">
                      Featured Builder
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-bold text-neutral-800 mt-1 max-w-3xl">
                  {profile.headline || 'Full-Stack Developer & Software Architect'}
                </p>

                {profile.location && (
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600 mt-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Badges Strip */}
              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                <span className="px-3 py-1 rounded-xl bg-neutral-100 border border-black text-black capitalize">
                  {profile.experienceLevel} Level
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#38BDF8]/20 border border-black text-neutral-900 capitalize">
                  {profile.remotePreference}
                </span>
                <span className={`px-3 py-1 rounded-xl border ${
                  profile.availability === 'available'
                    ? 'bg-[#4ADE80]/30 border-green-800 text-green-950'
                    : 'bg-neutral-100 border-black text-neutral-800'
                }`}>
                  ● {profile.availability === 'available' ? 'Available for work' : profile.availability}
                </span>
              </div>

              {/* Social / Portfolio Links */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10">
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-neutral-200 border border-black rounded-xl text-xs font-mono font-bold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-neutral-200 border border-black rounded-xl text-xs font-mono font-bold"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-neutral-200 border border-black rounded-xl text-xs font-mono font-bold"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-neutral-200 border border-black rounded-xl text-xs font-mono font-bold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Biography & Skills Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bio & Services (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {profile.biography && (
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-3">
                <h2 className="text-base font-black text-black font-mono uppercase">About Me</h2>
                <div className="text-xs sm:text-sm font-medium text-neutral-800 leading-relaxed whitespace-pre-line">
                  {profile.biography}
                </div>
              </div>
            )}

            {profile.services && profile.services.length > 0 && (
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-3">
                <h2 className="text-base font-black text-black font-mono uppercase flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Services Offered</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {profile.services.map((svc: string) => (
                    <div
                      key={svc}
                      className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl text-xs font-bold text-black flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      <span>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Skills & Tech (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
              <h2 className="text-base font-black text-black font-mono uppercase flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <span>Skills & Tech Stack</span>
              </h2>

              {profile.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">Core Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s: string) => (
                      <span
                        key={s}
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-black"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.technologies && profile.technologies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-black/10">
                  <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">Technologies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technologies.map((t: string) => (
                      <span
                        key={t}
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-100 border border-black/30 text-neutral-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Published Projects Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="text-xl font-black text-black flex items-center gap-2 font-mono uppercase">
              <FolderGit2 className="w-5 h-5 text-black" />
              <span>Project Portfolio ({projects?.length || 0})</span>
            </h2>

            {isOwner && (
              <Link
                to="/developers/projects/manage"
                className="px-3 py-1.5 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000]"
              >
                + Manage Projects
              </Link>
            )}
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj: any) => (
                <Link
                  key={proj._id}
                  to={`/developers/projects/${proj.slug}`}
                  className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="h-44 bg-[#FAF7F2] border-b-2 border-black relative overflow-hidden flex items-center justify-center">
                      {proj.coverImage ? (
                        <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="text-4xl font-mono font-black text-black/20">{'</>'}</div>
                      )}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white border border-black text-[10px] font-mono font-black uppercase">
                        {proj.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-black text-base text-black group-hover:underline">{proj.title}</h3>
                      <p className="text-xs font-semibold text-neutral-600 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(proj.technologies || []).slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FAF7F2] border border-black rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-neutral-500">{proj.viewCount || 0} views</span>
                      <span className="text-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-3">
              <p className="text-sm font-black text-black">No published projects yet.</p>
              {isOwner && (
                <Link
                  to="/developers/projects/manage"
                  className="inline-block px-4 py-2 bg-[#FACC15] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000]"
                >
                  Publish Your First Project
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Contact Modal */}
        {isContactOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[8px_8px_0px_#000] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-black" />
                  <h3 className="font-black text-lg text-black">Contact {profile.displayName}</h3>
                </div>
                <button onClick={() => setIsContactOpen(false)} className="p-1 text-black hover:bg-neutral-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Recruiter or Business Name"
                    className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Project opportunity / Contract work"
                    className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Briefly describe your project, timeline, and requirements..."
                    className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="w-full py-3 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingMessage ? 'Delivering...' : 'Send Message Directly'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {isReportOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black rounded-3xl max-w-md w-full p-6 shadow-[8px_8px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <h3 className="font-black text-base text-black flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-600" />
                  <span>Report Profile</span>
                </h3>
                <button onClick={() => setIsReportOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl text-xs font-bold"
                  >
                    <option value="spam">Spam or Fake Listing</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="impersonation">Impersonation</option>
                    <option value="copyright">Copyright Infringement</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">Details</label>
                  <textarea
                    required
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please explain the issue..."
                    className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-xl font-mono text-xs font-black shadow-[3px_3px_0px_#000]"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
