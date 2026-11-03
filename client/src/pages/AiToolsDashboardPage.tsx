import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Search,
  Sparkles,
  Cpu,
  Clock,
  ArrowRight,
  Zap,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { AI_TOOLS_REGISTRY, type AICategory } from '../lib/ai/aiToolsRegistry.js';
import { Icon } from '../components/common/Icon.js';
import { aiToolsApi } from '../services/aiToolsApi.js';
import { useAuth } from '../context/AuthContext.js';

export const AiToolsDashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AICategory>('all');
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    checkHealth();
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const checkHealth = async () => {
    try {
      setLoadingStatus(true);
      const res = await aiToolsApi.getModelStatus();
      if (res.success) {
        setModelStatus(res.data);
      }
    } catch {
      // offline
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await aiToolsApi.getHistory();
      if (res.success && res.data?.jobs) {
        setRecentJobs(res.data.jobs);
      }
    } catch {
      // ignore
    }
  };

  const categories: { id: AICategory; label: string; count: number }[] = [
    { id: 'all', label: 'All AI Tools', count: AI_TOOLS_REGISTRY.length },
    {
      id: 'image',
      label: 'Image AI',
      count: AI_TOOLS_REGISTRY.filter((t) => t.category === 'image').length,
    },
    {
      id: 'document',
      label: 'Document AI',
      count: AI_TOOLS_REGISTRY.filter((t) => t.category === 'document').length,
    },
    {
      id: 'developer',
      label: 'Coding AI',
      count: AI_TOOLS_REGISTRY.filter((t) => t.category === 'developer').length,
    },
    {
      id: 'writing',
      label: 'Writing & Resume',
      count: AI_TOOLS_REGISTRY.filter((t) => t.category === 'writing').length,
    },
  ];

  const filteredTools = AI_TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.requiredModel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Header Banner */}
      <div className="border-b-2 border-black bg-white px-4 py-10 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACC15] border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_#000] mb-3">
                <Sparkles className="w-4 h-4 text-black" />
                VEXORAMODS AI WORKSPACE
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                Free & Built-in AI Tools
              </h1>
              <p className="mt-2 text-base text-gray-700 max-w-2xl font-medium">
                High-performance computer vision, image restoration, inpainting, and document
                extraction. Built-in engines with zero configuration, no external models, and no
                subscriptions.
              </p>
            </div>

            {/* Open Source Status Card */}
            <div className="bg-[#FAF7F2] border-2 border-black p-5 shadow-[4px_4px_0px_#000] min-w-[280px]">
              <div className="text-xs font-mono font-bold text-gray-600 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-700" /> Platform Edition
              </div>
              <div className="text-2xl font-black text-black mt-1 flex items-center justify-between">
                <span>100% Free Forever</span>
                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-400" />
              </div>
              <div className="text-xs text-gray-600 mt-2 flex items-center justify-between">
                <span>Built-in Processing</span>
                <Link
                  to="/design-studio"
                  className="font-bold underline hover:text-black flex items-center gap-1"
                >
                  Design Studio &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Model Status Bar */}
          <div className="mt-8 border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase bg-black text-white px-2 py-0.5">
                Runtime Status
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span>
                  Processing Engines: <strong>Built-in Computer Vision & OCR (Ready)</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={checkHealth}
                disabled={loadingStatus}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold border border-black bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Refresh hardware status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                Check Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* Controls: Search + Categories */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b-2 border-black">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search AI tools (e.g., inpainting, ocr, resume)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-black font-medium text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[2px_2px_0px_#000]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 font-mono text-xs font-bold border-2 border-black transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#FACC15] shadow-[2.5px_2.5px_0px_#000] -translate-y-0.5'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#FACC15] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Icon name={tool.icon} className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-green-100 text-green-900 border border-green-800">
                      100% Free
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {tool.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
                  {tool.name}
                  {tool.isPopular && (
                    <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-mono uppercase">
                      Popular
                    </span>
                  )}
                </h3>

                <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
                  {tool.shortDescription}
                </p>

                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-none font-mono text-[11px] text-gray-600 mb-6 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span className="truncate">Model: {tool.requiredModel}</span>
                </div>
              </div>

              <Link
                to={tool.route}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-black text-white font-mono text-xs font-bold hover:bg-[#FACC15] hover:text-black hover:border-black border-2 border-black transition-all shadow-[2px_2px_0px_#000]"
              >
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Processing History */}
        {isAuthenticated && recentJobs.length > 0 && (
          <div className="mt-14 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <h2 className="text-lg font-bold text-black flex items-center gap-2 font-mono uppercase">
                <Clock className="w-5 h-5 text-black" />
                Recent Processing Jobs
              </h2>
              <span className="text-xs font-mono text-gray-500">{recentJobs.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-black text-gray-600">
                    <th className="py-2 px-3">TOOL</th>
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3">DATE</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentJobs.slice(0, 8).map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-bold text-black">{job.tool}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 border text-[11px] font-bold ${
                            job.status === 'completed'
                              ? 'bg-green-100 border-green-500 text-green-800'
                              : job.status === 'processing'
                                ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                                : 'bg-red-100 border-red-500 text-red-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {job.outputUrl && (
                          <a
                            href={job.outputUrl}
                            download
                            className="inline-block px-2 py-1 bg-black text-white hover:bg-[#FACC15] hover:text-black border border-black text-[11px] font-bold transition-colors"
                          >
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
