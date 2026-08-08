import React, { useState } from 'react';
import { Home, Package, Search, User, ShieldAlert, Plus } from 'lucide-react';

export default function ShelterManager({ shelters = [] }) {
  const [searchMissing, setSearchMissing] = useState('');
  const [missingPersons] = useState([
    { id: 1, name: 'Ananya Sharma', age: 24, lastSeen: 'Silk Board Junction', status: 'Found at Kanteerava Shelter', phone: '+91 9876500011' },
    { id: 2, name: 'Suresh Kumar', age: 58, lastSeen: 'Peenya Industrial Area', status: 'Searching...', phone: '+91 9811223344' }
  ]);

  const filteredMissing = missingPersons.filter((p) =>
    p.name.toLowerCase().includes(searchMissing.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 text-purple-400 mb-1">
            <Home className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight text-white">SHELTERS, INVENTORY & MISSING PERSONS PORTAL</h2>
          </div>
          <p className="text-slate-300 text-sm">
            Monitor real-time bed capacity across relief shelters, manage food/medical supply stock, and coordinate missing person lookups.
          </p>
        </div>
      </div>

      {/* Grid: Shelter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shelters.map((sh) => {
          const occPercent = Math.round((sh.currentOccupancy / sh.totalCapacity) * 100);
          return (
            <div key={sh._id} className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{sh.name}</h3>
                  <p className="text-xs text-slate-400">{sh.address}</p>
                </div>
                <span className="text-xs font-mono bg-purple-950 text-purple-300 px-2.5 py-1 rounded border border-purple-800">
                  {sh.currentOccupancy} / {sh.totalCapacity} BEDS
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Capacity Occupancy</span>
                  <span className="font-mono text-purple-300">{occPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${occPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Inventory Supplies */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Food Packs</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{sh.supplies?.foodPacks || 200}</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Water (L)</div>
                  <div className="text-sm font-bold text-blue-400 font-mono">{sh.supplies?.waterLiters || 1000}</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Medical Kits</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{sh.supplies?.medicalKits || 30}</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Blankets</div>
                  <div className="text-sm font-bold text-purple-400 font-mono">{sh.supplies?.blankets || 150}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Missing Persons Directory Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-slate-100">Missing Persons Tracking Directory</h3>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchMissing}
              onChange={(e) => setSearchMissing(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredMissing.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-100 text-sm">{p.name}</span>
                <span className="text-slate-400 ml-2">(Age {p.age}) — Last seen near {p.lastSeen}</span>
              </div>
              <span className={`font-mono font-bold px-2.5 py-1 rounded ${
                p.status.includes('Found') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
