import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Search,
  Code2,
  Sparkles,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  UserCheck,
  Globe,
  Star,
  X,
  Filter
} from 'lucide-react';
import { developerApi } from '../../services/developerApi.js';
import { useAuth } from '../../context/AuthContext.js';

const POPULAR_SKILLS = [
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Go',
  'Rust',
  'Next.js',
  'PostgreSQL',
  'Docker',
  'Figma',
  'Tailwind CSS',
];

export const DevelopersDirectoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [remotePreference, setRemotePreference] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [developers, setDevelopers] = useState<any[]>([]);
  const [featuredDevelopers, setFeaturedDevelopers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  useEffect(() => {
    loadDevelopers();
  }, [searchQuery, experienceLevel, remotePreference, availability, selectedSkills, currentPage]);

  const loadFeatured = async () => {
    try {
      const res = await developerApi.getFeaturedDevelopers(4);
      if (res.success) setFeaturedDevelopers(res.data || []);
    } catch {
      // ignore
    }
  };

  const loadDevelopers = async () => {
    try {
      setIsLoading(true);
      const res = await developerApi.searchDevelopers({
        q: searchQuery,
        experienceLevel,
        remotePreference,
        availability,
        skills: selectedSkills.join(','),
        page: currentPage,
        limit: 12,
      });

      if (res.success && res.data) {
        setDevelopers(res.data.developers || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setExperienceLevel('');
    setRemotePreference('');
    setAvailability('');
    setSelectedSkills([]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="border-b-2 border-black pb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACC15] border-2 border-black font-mono text-xs font-black shadow-[2px_2px_0px_#000] mb-2 rounded-lg">
                <Code2 className="w-3.5 h-3.5 text-black" />
                <span>VEXORAMODS DEVELOPER HUB</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
                Discover Developers. Showcase Your Work.
              </h1>
              <p className="text-sm sm:text-base font-bold text-neutral-700 max-w-2xl mt-2 leading-relaxed">
                A free, open-source community directory for software engineers, designers, and builders.
                Showcase your projects and connect with companies looking to hire.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap shrink-0">
              <Link
                to="/developers/projects"
                className="px-4 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2.5px_2.5px_0px_#000] transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Browse Projects</span>
              </Link>

              <Link
                to={isAuthenticated ? '/developers/profile/edit' : '/register'}
                className="px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2.5px_2.5px_0px_#000] transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>{isAuthenticated ? 'Manage My Profile' : 'Join as Developer'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Developers Spotlight (if available) */}
        {featuredDevelopers.length > 0 && !searchQuery && selectedSkills.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-black flex items-center gap-2 font-mono uppercase">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <span>Featured Builders</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredDevelopers.map((dev) => (
                <Link
                  key={dev._id}
                  to={`/developers/profile/${dev.username}`}
                  className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border-2 border-black overflow-hidden flex items-center justify-center font-black text-sm shrink-0">
                        {dev.profileImage ? (
                          <img src={dev.profileImage} alt={dev.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{dev.displayName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm text-black truncate group-hover:underline">
                          {dev.displayName}
                        </div>
                        <div className="text-xs font-mono text-neutral-500 truncate">@{dev.username}</div>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-neutral-700 line-clamp-2">
                      {dev.headline || 'Software Engineer & Builder'}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {(dev.skills || []).slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-black/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-black/10 flex items-center justify-between text-[11px] font-mono font-bold">
                    <span className="text-green-700">● {dev.availability}</span>
                    <span className="text-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Profile &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters Deck */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search developers by name, headline, skills, or services..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-black hover:scale-110"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Facet Dropdowns */}
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
              <select
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl focus:outline-none"
              >
                <option value="">All Experience Levels</option>
                <option value="beginner">Beginner</option>
                <option value="junior">Junior</option>
                <option value="intermediate">Intermediate</option>
                <option value="senior">Senior</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={availability}
                onChange={(e) => {
                  setAvailability(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl focus:outline-none"
              >
                <option value="">All Availability</option>
                <option value="available">Available for work</option>
                <option value="open">Open to opportunities</option>
                <option value="unavailable">Unavailable</option>
              </select>

              <select
                value={remotePreference}
                onChange={(e) => {
                  setRemotePreference(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl focus:outline-none"
              >
                <option value="">All Work Modes</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="flexible">Flexible</option>
              </select>

              {(searchQuery || experienceLevel || availability || remotePreference || selectedSkills.length > 0) && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 border-2 border-black rounded-xl text-red-700 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Popular Technology Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-black/10">
            <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase mr-1">
              Filter by Tech:
            </span>
            {POPULAR_SKILLS.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                    active
                      ? 'bg-[#FACC15] border-black text-black shadow-[1.5px_1.5px_0px_#000]'
                      : 'bg-[#FAF7F2] border-black/30 hover:border-black text-neutral-700'
                  }`}
                >
                  {skill} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Developer Directory Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-neutral-600">
              Showing {developers.length} of {totalCount} verified developer profiles
            </span>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs font-bold">Querying developer community...</span>
            </div>
          ) : developers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developers.map((dev) => (
                <div
                  key={dev._id}
                  className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Avatar, Name, Badges */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-[#FAF7F2] border-2 border-black overflow-hidden flex items-center justify-center font-black text-base shrink-0 shadow-[2px_2px_0px_#000]">
                        {dev.profileImage ? (
                          <img src={dev.profileImage} alt={dev.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{dev.displayName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-black truncate">{dev.displayName}</h3>
                          {dev.isFeatured && (
                            <span className="px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-900 border border-yellow-800 text-[10px] font-mono font-bold">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-neutral-500 truncate">@{dev.username}</div>
                        {dev.location && (
                          <div className="flex items-center gap-1 text-[11px] text-neutral-600 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{dev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <p className="text-xs font-semibold text-neutral-800 line-clamp-2 leading-relaxed">
                      {dev.headline || 'Full-Stack Developer building software and creative tools.'}
                    </p>

                    {/* Facet Pills */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-black/20 text-black capitalize">
                        {dev.experienceLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/20 border border-black/20 text-neutral-900 capitalize">
                        {dev.remotePreference}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-neutral-900 ${
                        dev.availability === 'available'
                          ? 'bg-[#4ADE80]/30 border-green-800'
                          : 'bg-neutral-100 border-black/20'
                      }`}>
                        ● {dev.availability}
                      </span>
                    </div>

                    {/* Skills Tag Cloud */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(dev.skills || []).slice(0, 5).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-black"
                        >
                          {skill}
                        </span>
                      ))}
                      {(dev.skills || []).length > 5 && (
                        <span className="text-[10px] font-mono text-neutral-500 py-0.5">
                          +{dev.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-500">
                      {dev.services?.length || 0} services
                    </span>

                    <Link
                      to={`/developers/profile/${dev.username}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-[#FACC15] hover:text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000] transition-all"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-4">
              <p className="font-black text-base text-black">
                No developer profiles found matching your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#FACC15] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000]"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-black disabled:opacity-50"
              >
                &larr; Prev
              </button>
              <span className="font-mono text-xs font-bold px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-black disabled:opacity-50"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
