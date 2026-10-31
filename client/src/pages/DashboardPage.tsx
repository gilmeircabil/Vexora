import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Sparkles,
  Zap,
  Clock,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface AIJobItem {
  _id: string;
  tool: string;
  status: string;
  creditsConsumed?: number;
  outputUrl?: string;
  inputMetadata?: {
    originalName?: string;
    mode?: string;
    size?: number;
  };
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<AIJobItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const jobsRes = await fetch('/api/ai/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setJobs(jobsData.data.jobs || []);
        }
      }
    } catch {
      showToast('Could not load processing history.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-neutral-500">
        Loading dashboard profile...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-black/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-black">
              User Dashboard
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase font-mono bg-[#22C55E] text-white border-2 border-black shadow-[2px_2px_0px_#000]">
              Free & Open Source
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-1">
            Logged in as {user.name} ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/tools"
            className="px-4 py-2 bg-[#FACC15] hover:bg-yellow-400 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> All Tools
          </Link>
          <Link
            to="/design-studio"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-black font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" /> Design Studio
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Platform Status */}
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">Platform Edition</span>
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div className="text-2xl font-black">100% Free Forever</div>
          <p className="text-xs text-neutral-600 font-medium">
            No subscriptions, no credits, and no daily limits. Ready out-of-the-box with zero setup.
          </p>
        </div>

        {/* Studio Card */}
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">VexoraMods Studio</span>
            <Layers className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-xl font-black">Canva-like Design Editor</div>
          <Link
            to="/design-studio"
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
          >
            Open Design Studio <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Processed */}
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">Jobs Executed</span>
            <Zap className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black">{jobs.length} Runs</div>
          <p className="text-xs text-neutral-600 font-medium">
            Saved history across AI tools and image processing pipelines.
          </p>
        </div>
      </div>

      {/* Processing History Table */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-black" />
            <h2 className="text-xl font-black text-black">Processing History</h2>
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoadingData}
            className="p-1.5 rounded bg-white hover:bg-neutral-100 border border-black shadow-[1.5px_1.5px_0px_#000] text-black"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingData ? (
          <div className="py-12 text-center text-xs text-neutral-500">
            Loading recent processing runs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-sm font-bold text-neutral-500">
            No tools executed yet. Try out one of the{' '}
            <Link to="/ai-tools" className="text-blue-700 underline">
              AI Tools
            </Link>{' '}
            or design on{' '}
            <Link to="/design-studio" className="text-blue-700 underline">
              Design Studio
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-black uppercase text-neutral-500 bg-[#FAF7F2]">
                  <th className="py-2.5 px-3">Tool</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Input File</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 font-bold">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-3 uppercase font-mono font-black text-neutral-800">
                      {job.tool}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase font-mono border ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-900 border-green-800'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-900 border-red-800'
                            : 'bg-yellow-100 text-yellow-900 border-yellow-800'
                        }`}
                      >
                        {job.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : job.status === 'failed' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        )}
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 truncate max-w-xs">
                      {job.inputMetadata?.originalName || 'Direct upload'}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono">
                      {new Date(job.createdAt).toLocaleDateString()}{' '}
                      {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {job.outputUrl ? (
                        <a
                          href={job.outputUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FACC15] hover:bg-yellow-400 text-black font-black text-[11px] border border-black shadow-[1.5px_1.5px_0px_#000]"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                      ) : (
                        <span className="text-neutral-400 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
