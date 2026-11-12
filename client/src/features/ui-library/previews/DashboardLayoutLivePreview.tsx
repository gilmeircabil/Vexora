import React from 'react';

interface Props {
  dashboardId: string;
}

export const DashboardLayoutLivePreview: React.FC<Props> = ({ dashboardId }) => {
  switch (dashboardId) {
    case 'admin-dashboard':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[5px_5px_0px_#000] text-xs font-sans">
          <div className="h-10 bg-[#FAF7F2] border-b-2 border-black px-4 flex justify-between items-center font-black">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 rounded-full border border-black"></span> Admin Console</span>
            <span className="px-2 py-0.5 bg-[#4ADE80] border border-black rounded text-[10px]">Server Healthy</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl">
                <p className="text-[10px] text-neutral-500 font-bold">Total Users</p>
                <p className="text-base font-black">18,429</p>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl">
                <p className="text-[10px] text-neutral-500 font-bold">Server Load</p>
                <p className="text-base font-black text-amber-600">24%</p>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl">
                <p className="text-[10px] text-neutral-500 font-bold">Audit Events</p>
                <p className="text-base font-black">142</p>
              </div>
            </div>
            <div className="border border-black rounded-xl p-2 bg-neutral-50 font-mono text-[10px] space-y-1">
              <p className="font-bold text-neutral-700">Recent Audit Log:</p>
              <p className="text-neutral-500">[22:40] Role updated for user @alex (Admin)</p>
              <p className="text-neutral-500">[22:42] New plugin installed: superpowers</p>
            </div>
          </div>
        </div>
      );

    case 'analytics-dashboard':
      return (
        <div className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-2xl p-4 shadow-xl text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-sm text-white">Live Telemetry</span>
            <div className="flex gap-1 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-indigo-600 rounded">24H</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded">7D</span>
            </div>
          </div>
          <div className="h-20 flex items-end gap-2 border-b border-slate-800 pb-2">
            {[40, 65, 30, 85, 95, 75, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Peak: 12.4k req/sec</span>
            <span className="text-emerald-400">P99: 14ms</span>
          </div>
        </div>
      );

    case 'financial-dashboard':
      return (
        <div className="w-full bg-[#FAF7F2] border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-black text-xs">Revenue & Cash Flow</span>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 border border-black rounded">USD ($)</span>
          </div>
          <div className="p-3 bg-white border-2 border-black rounded-xl flex justify-between items-center shadow-[2px_2px_0px_#000]">
            <div>
              <p className="text-[10px] text-neutral-500 font-bold">Total MRR</p>
              <h4 className="text-xl font-black">$48,290.00</h4>
            </div>
            <span className="px-2 py-1 bg-[#4ADE80] font-black rounded border border-black text-[10px]">+14.2%</span>
          </div>
          <div className="space-y-1.5 font-bold text-[11px]">
            <div className="flex justify-between p-1.5 bg-white rounded border border-black">
              <span>Subscription Renewals</span>
              <span className="text-emerald-600 font-black">+$3,420</span>
            </div>
            <div className="flex justify-between p-1.5 bg-white rounded border border-black">
              <span>Cloud Server Costs</span>
              <span className="text-rose-600 font-black">-$480</span>
            </div>
          </div>
        </div>
      );

    case 'crm-dashboard':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 font-black">
            <span>Sales Pipeline</span>
            <span className="text-neutral-500 text-[10px]">Total: $420,000</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-bold text-[10px]">
            <div className="p-2 bg-yellow-50 border border-black rounded-lg">
              <p className="text-neutral-500">Leads (8)</p>
              <p className="font-black text-xs mt-1">$45k</p>
            </div>
            <div className="p-2 bg-blue-50 border border-black rounded-lg">
              <p className="text-neutral-500">Proposal (4)</p>
              <p className="font-black text-xs mt-1">$120k</p>
            </div>
            <div className="p-2 bg-emerald-50 border border-black rounded-lg">
              <p className="text-neutral-500">Won (12)</p>
              <p className="font-black text-xs mt-1">$255k</p>
            </div>
          </div>
        </div>
      );

    case 'project-management-dashboard':
      return (
        <div className="w-full bg-[#FAF7F2] border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center font-black">
            <span>Sprint 14: Q4 Launch</span>
            <span className="px-2 py-0.5 bg-[#FACC15] border border-black rounded text-[10px]">4 Days Left</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Milestone Progress</span>
              <span>78%</span>
            </div>
            <div className="w-full h-3 bg-white border border-black rounded-full overflow-hidden">
              <div className="bg-[#4ADE80] h-full w-[78%]"></div>
            </div>
          </div>
          <div className="p-2 bg-white border border-black rounded-xl text-[11px] font-bold space-y-1">
            <p className="font-black">Active Blockers: 0</p>
            <p className="text-neutral-500">22 of 28 tasks completed</p>
          </div>
        </div>
      );

    case 'kanban-dashboard':
      return (
        <div className="w-full bg-slate-100 border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_#000] text-black text-xs">
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-black rounded-xl p-2 space-y-2">
              <p className="font-black text-[10px] uppercase text-neutral-500">Backlog (3)</p>
              <div className="p-1.5 bg-[#FAF7F2] border border-black rounded font-bold text-[10px]">
                API Schema
              </div>
            </div>
            <div className="flex-1 bg-white border border-black rounded-xl p-2 space-y-2">
              <p className="font-black text-[10px] uppercase text-neutral-500">In Progress (2)</p>
              <div className="p-1.5 bg-[#FACC15] border border-black rounded font-bold text-[10px]">
                Auth Flow
              </div>
            </div>
            <div className="flex-1 bg-white border border-black rounded-xl p-2 space-y-2">
              <p className="font-black text-[10px] uppercase text-neutral-500">Done (8)</p>
              <div className="p-1.5 bg-[#4ADE80] border border-black rounded font-bold text-[10px]">
                Landing Page
              </div>
            </div>
          </div>
        </div>
      );

    case 'minimal-dashboard':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] text-black text-center space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-bold">Minimal Pulse</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-black">$32,400</p>
              <p className="text-[10px] text-neutral-500">Monthly Volume</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">99.98%</p>
              <p className="text-[10px] text-neutral-500">Uptime</p>
            </div>
          </div>
        </div>
      );

    case 'sidebar-dashboard':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] flex overflow-hidden text-xs">
          <div className="w-28 bg-neutral-900 text-white p-3 space-y-2 shrink-0 text-[10px] font-bold">
            <span className="font-black text-xs text-yellow-400 block mb-3">Vexora</span>
            <p className="bg-neutral-800 p-1.5 rounded">Dashboard</p>
            <p className="text-neutral-400 p-1.5">Projects</p>
            <p className="text-neutral-400 p-1.5">Settings</p>
          </div>
          <div className="flex-1 p-4 bg-[#FAF7F2] space-y-2">
            <h4 className="font-black text-sm">Dashboard Overview</h4>
            <div className="p-3 bg-white border border-black rounded-xl">
              <p className="font-bold text-xs">Welcome to your workspace.</p>
              <p className="text-[10px] text-neutral-500">All tools are synced.</p>
            </div>
          </div>
        </div>
      );

    case 'full-width-dashboard':
      return (
        <div className="w-full bg-neutral-950 text-white border-2 border-black rounded-2xl p-4 text-xs font-mono space-y-3">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <span className="text-amber-400 font-bold">EDGE_TELEMETRY // FULL_VIEW</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <p className="text-neutral-500">NODE_01</p>
              <p className="font-bold text-xs">8ms</p>
            </div>
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <p className="text-neutral-500">NODE_02</p>
              <p className="font-bold text-xs">12ms</p>
            </div>
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <p className="text-neutral-500">NODE_03</p>
              <p className="font-bold text-xs">7ms</p>
            </div>
            <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
              <p className="text-neutral-500">THROUGHPUT</p>
              <p className="font-bold text-xs">4.2GB/s</p>
            </div>
          </div>
        </div>
      );

    case 'three-column-dashboard':
      return (
        <div className="w-full bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] flex overflow-hidden text-xs">
          <div className="w-20 bg-neutral-100 border-r border-black p-2 space-y-1 text-[9px] font-bold">
            <p className="font-black text-[10px]">Mail</p>
            <p className="text-blue-600">Inbox (4)</p>
            <p className="text-neutral-500">Sent</p>
          </div>
          <div className="w-36 bg-white border-r border-black p-2 space-y-1 text-[10px]">
            <p className="font-black text-black">Component Update</p>
            <p className="text-neutral-500 line-clamp-1">New buttons added...</p>
          </div>
          <div className="flex-1 p-3 bg-[#FAF7F2] space-y-1">
            <h5 className="font-black text-xs">Message Detail</h5>
            <p className="text-[10px] text-neutral-600">Full email body rendered in contextual inspector.</p>
          </div>
        </div>
      );

    case 'mobile-dashboard':
      return (
        <div className="w-full max-w-xs mx-auto bg-white border-2 border-black rounded-3xl p-4 shadow-[4px_4px_0px_#000] text-black text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-black text-xs">Mobile Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          </div>
          <div className="p-3 bg-[#FACC15] border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000]">
            <p className="text-[10px] font-bold">Daily Streak</p>
            <p className="text-xl font-black">14 Days</p>
          </div>
          <div className="flex justify-around border-t-2 border-black pt-2 text-[10px] font-bold">
            <span>Home</span>
            <span>Stats</span>
            <span>Settings</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-white border-2 border-black rounded-xl">
          <p className="font-bold text-xs">Dashboard: {dashboardId}</p>
        </div>
      );
  }
};
