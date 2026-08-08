import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ShieldAlert, CheckCircle, MapPin, Phone, Heart } from 'lucide-react';
import { fetchMissingPersons, submitMissingPerson } from '../services/api';

export default function MissingPersonPortal() {
  const [persons, setPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    lastSeenLocation: '',
    contactName: '',
    contactPhone: '',
    additionalNotes: ''
  });

  const loadData = async () => {
    try {
      const res = await fetchMissingPersons();
      setPersons(res || []);
    } catch (err) {
      console.error('Error fetching missing persons:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitMissingPerson({ ...formData, age: Number(formData.age) });
      setShowAddModal(false);
      setFormData({ fullName: '', age: '', gender: 'Male', lastSeenLocation: '', contactName: '', contactPhone: '', additionalNotes: '' });
      loadData();
    } catch (err) {
      alert('Error reporting missing person: ' + err.message);
    }
  };

  const filteredPersons = persons.filter((p) => {
    const matchesQuery = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">MISSING PERSONS REGISTRY & RECOVERY</h2>
          </div>
          <p className="text-slate-300 text-sm">
            Search for missing loved ones or report missing individuals in disaster zones. Multi-agency status tracking with shelter integration.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Report Missing Person</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['ALL', 'MISSING', 'IN_SHELTER', 'FOUND_SAFE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Missing Persons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersons.map((p) => (
          <div key={p._id} className="glass-card p-5 space-y-3 relative overflow-hidden border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-lg">{p.fullName}</h3>
                <span className="text-xs text-slate-400">{p.gender}, {p.age} years old</span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  p.status === 'MISSING'
                    ? 'bg-red-950/80 text-red-400 border-red-800'
                    : p.status === 'IN_SHELTER'
                    ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                }`}
              >
                {p.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Last seen: {p.lastSeenLocation}</span>
              </div>
              {p.shelterAssigned && p.shelterAssigned !== 'None' && (
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Located at: {p.shelterAssigned}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Contact: {p.contactName} ({p.contactPhone})</span>
              </div>
            </div>

            {p.additionalNotes && (
              <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                "{p.additionalNotes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Missing Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Heart className="w-5 h-5 text-amber-400" />
              <span>Report Missing Individual</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Person's Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Last Seen Location</label>
                <input
                  type="text"
                  required
                  placeholder="Street / Landmark / Sector"
                  value={formData.lastSeenLocation}
                  onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Reporter Name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Additional Identifiers / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clothing details, distinctive features..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
