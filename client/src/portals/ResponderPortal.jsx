import React, { useState } from 'react';
import { UserCheck, MapPin, Navigation, ShieldCheck, Phone, CheckCircle } from 'lucide-react';

export default function ResponderPortal({ responders = [], incidents = [] }) {
  const [selectedResponder, setSelectedResponder] = useState(responders[0] || null);
  const [missionStatus, setMissionStatus] = useState('ASSIGNED');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 text-emerald-400 mb-1">
            <UserCheck className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight text-white">FIELD RESPONDER & VOLUNTEER DISPATCH PORTAL</h2>
          </div>
          <p className="text-slate-300 text-sm">
            View live AI dispatches matched via the DSA Priority Engine, update your real-time GPS location, and manage emergency mission status.
          </p>
        </div>

        {/* Responder Selector Switcher */}
        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold px-2">Active Profile:</span>
          <select
            value={selectedResponder?._id || ''}
            onChange={(e) => {
              const matched = responders.find((r) => r._id === e.target.value);
              setSelectedResponder(matched);
            }}
            className="bg-slate-800 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            {responders.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} ({r.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Responder Profile & Equipment Skills */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-lg">
              {selectedResponder?.name?.charAt(0) || 'R'}
            </div>
            <div>
              <h3 className="font-bold text-slate-100">{selectedResponder?.name || 'NDRF Unit Alpha'}</h3>
              <p className="text-xs text-emerald-400 font-mono">{selectedResponder?.role || 'NGO_RESPONDER'}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Verified Skills:</span>
              <span className="text-slate-200 font-medium">{selectedResponder?.skills?.join(', ') || 'First Aid, Rescue'}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Performance Rating:</span>
              <span className="text-amber-400 font-bold font-mono">★ {selectedResponder?.rating || '4.9'} / 5.0</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Payload Capacity:</span>
              <span className="text-slate-200 font-mono">{selectedResponder?.capacity || 10} Units</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2">
            <Navigation className="w-4 h-4" />
            <span>Broadcast Live GPS Coordinates</span>
          </button>
        </div>

        {/* Active Assigned Missions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Assigned Emergency Dispatches
          </h3>

          {incidents.slice(0, 2).map((inc) => (
            <div key={inc._id} className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950 px-2.5 py-1 rounded border border-red-800">
                  DISPATCH MISSION: {inc.type}
                </span>
                <span className="text-xs font-mono text-cyan-400">Urgency {inc.urgencyScore}/10</span>
              </div>

              <h4 className="font-bold text-base text-slate-100">{inc.title}</h4>
              <p className="text-xs text-slate-300">{inc.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{inc.addressText}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{inc.contactPhone || '+91 9876543210'}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">Mission Progress Status:</span>
                <div className="flex space-x-2">
                  {['ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setMissionStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        missionStatus === st
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
