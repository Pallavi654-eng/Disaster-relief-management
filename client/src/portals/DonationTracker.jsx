import React, { useState, useEffect } from 'react';
import { Package, HeartHandshake, Plus, CheckCircle2, TrendingUp, Gift } from 'lucide-react';
import { fetchDonations, submitDonation } from '../services/api';

export default function DonationTracker() {
  const [donations, setDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    donorName: '',
    contactPhone: '',
    category: 'FOOD',
    itemName: '',
    quantity: 100,
    unit: 'Packs',
    targetShelter: 'Central Relief Shelter'
  });

  const loadData = async () => {
    try {
      const res = await fetchDonations();
      setDonations(res || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitDonation({ ...formData, quantity: Number(formData.quantity) });
      setShowModal(false);
      setFormData({ donorName: '', contactPhone: '', category: 'FOOD', itemName: '', quantity: 100, unit: 'Packs', targetShelter: 'Central Relief Shelter' });
      loadData();
    } catch (err) {
      alert('Error pledging donation: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <HeartHandshake className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">DONATION & RELIEF SUPPLY TRACKER</h2>
          </div>
          <p className="text-slate-300 text-sm">
            Track incoming food, medical supplies, clean water, and financial aid allocated across emergency disaster shelters.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Pledge Supply Donation</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Pledged Contributions</span>
          <div className="text-2xl font-bold text-emerald-400">{donations.length} Shipments</div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Water Supplies</span>
          <div className="text-2xl font-bold text-cyan-400">
            {donations.filter((d) => d.category === 'WATER').reduce((sum, d) => sum + d.quantity, 0)} Units
          </div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Food Packs</span>
          <div className="text-2xl font-bold text-amber-400">
            {donations.filter((d) => d.category === 'FOOD').reduce((sum, d) => sum + d.quantity, 0)} Packs
          </div>
        </div>
        <div className="glass-card p-4 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Medical Supplies</span>
          <div className="text-2xl font-bold text-rose-400">
            {donations.filter((d) => d.category === 'MEDICAL').reduce((sum, d) => sum + d.quantity, 0)} Kits
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Package className="w-5 h-5 text-emerald-400" />
          <span>Live Relief Inventory Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60 uppercase font-mono">
              <tr>
                <th className="p-3">Donor / NGO</th>
                <th className="p-3">Supply Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Destination Shelter</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {donations.map((d) => (
                <tr key={d._id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3 font-semibold text-white">{d.donorName}</td>
                  <td className="p-3 text-cyan-300">{d.itemName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-400">
                    {d.quantity} {d.unit}
                  </td>
                  <td className="p-3 text-slate-400">{d.targetShelter}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                        d.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span>Pledge Relief Supply Donation</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Donor Name / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Cross / Rotary Club / Private Donor"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Supply Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FOOD">FOOD</option>
                    <option value="WATER">WATER</option>
                    <option value="MEDICAL">MEDICAL</option>
                    <option value="CLOTHING">CLOTHING</option>
                    <option value="FUNDS">FUNDS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rice Bags / First Aid Kits"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Packs / Liters / Kits"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Relief Shelter</label>
                <input
                  type="text"
                  required
                  placeholder="Target Shelter or Central Depot"
                  value={formData.targetShelter}
                  onChange={(e) => setFormData({ ...formData, targetShelter: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Submit Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
