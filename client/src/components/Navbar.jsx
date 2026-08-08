import React from 'react';
import { ShieldAlert, LayoutDashboard, UserCheck, Home, Radio, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, socketConnected }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Live Socket Indicator */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                RESCUENET <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">AI v1.0</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">AI Disaster Relief & Real-Time Coordination Platform</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'command'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => setActiveTab('victim')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'victim'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Report Emergency</span>
          </button>

          <button
            onClick={() => setActiveTab('responder')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'responder'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Responder Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shelters'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setActiveTab('missing')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'missing'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Missing Persons</span>
          </button>

          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'donations'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Donations</span>
          </button>
        </nav>

        {/* Real-time Socket Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-mono text-slate-300">
            {socketConnected ? 'LIVE SOCKET STREAM' : 'RECONNECTING...'}
          </span>
        </div>

      </div>
    </header>
  );
}
