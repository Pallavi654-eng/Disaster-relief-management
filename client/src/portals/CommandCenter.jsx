import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, Home, Cpu, Zap, CheckCircle2, AlertTriangle, AlertCircle, Building2, Hospital } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { triggerDsaMatch, fetchPredictiveAnalytics } from '../services/api';

export default function CommandCenter({ incidents = [], responders = [], shelters = [], analytics = {}, onRefresh }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [predictive, setPredictive] = useState(null);

  useEffect(() => {
    fetchPredictiveAnalytics().then((res) => setPredictive(res)).catch((err) => console.error(err));
  }, [incidents]);

  const handleRunDsaDispatch = async (incidentId) => {
    setIsMatching(true);
    try {
      const res = await triggerDsaMatch(incidentId);
      setDispatchResult(res);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('DSA Dispatch Error: ' + err.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* AI Predictive Resource Shortage Forecast Banner */}
      {predictive && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          predictive.isShortagePredicted
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center space-x-3">
            <Cpu className="w-6 h-6 animate-pulse shrink-0" />
            <div>
              <div className="font-bold text-sm text-white">AI Resource Shortage & Predictive Risk Engine</div>
              <div className="text-xs opacity-90">{predictive.alertMessage}</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="opacity-70">Water Buffer: </span>
              <span className="font-bold text-cyan-400">{predictive.daysWaterRemaining} Days</span>
            </div>
            <div>
              <span className="opacity-70">Food Buffer: </span>
              <span className="font-bold text-amber-400">{predictive.daysFoodRemaining} Days</span>
            </div>
          </div>
        </div>
      )}

      {/* Executive Analytics Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono">{analytics.totalIncidents || incidents.length}</div>
            <div className="text-xs text-slate-400">Total Active Incidents</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{analytics.criticalIncidents || 0}</div>
            <div className="text-xs text-slate-400">Critical (Urgency 8+)</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{analytics.activeResponders || responders.length}</div>
            <div className="text-xs text-slate-400">Field Responders Online</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">{analytics.sheltersAvailable || shelters.length}</div>
            <div className="text-xs text-slate-400">Active Relief Shelters</div>
          </div>
        </div>

      </div>

      {/* Main Command Dashboard Layout: GIS Map + Incident Feed & DSA Dispatch Modal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: GIS Live Map (Span 2) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Geospatial Incident Map (MongoDB 2DSphere)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Proximity Radius: 20 KM</span>
          </div>

          <LiveMap
            incidents={incidents}
            responders={responders}
            shelters={shelters}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>

        {/* Right: Live Incidents Queue & DSA Auto-Dispatch Trigger */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Incident Priority Queue
            </h3>
            <span className="text-xs text-cyan-400 font-mono">DSA Max-Heap Sorted</span>
          </div>

          {/* Incident Cards Feed */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?._id === inc._id;
              return (
                <div
                  key={inc._id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'glass-card hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      inc.urgencyScore >= 8
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      URGENCY: {inc.urgencyScore}/10
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {inc.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{inc.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{inc.description}</p>

                  <div className="flex items-center justify-between mt-3 text-xs text-slate-300">
                    <span className="text-slate-400">{inc.addressText}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunDsaDispatch(inc._id);
                      }}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] rounded-lg transition flex items-center space-x-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>DSA Match</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DSA Match Result Modal / Panel */}
          {dispatchResult && (
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{dispatchResult.message}</span>
              </div>
              <div className="space-y-1">
                {dispatchResult.dispatches?.map((disp, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex justify-between bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span>{disp.responderName || 'NDRF Unit'}</span>
                    <span className="font-mono text-emerald-400">Match Score: {disp.matchScore} ({disp.distanceKm} km)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
