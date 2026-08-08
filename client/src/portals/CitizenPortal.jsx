import React, { useState } from 'react';
import { Radio, Cpu, Send, CheckCircle2, AlertTriangle, MapPin, Camera } from 'lucide-react';
import { submitIncidentReport, getAiTriagePreview } from '../services/api';

export default function CitizenPortal({ onReportSubmitted }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportedBy: '',
    contactPhone: '',
    latitude: 12.9716,
    longitude: 77.5946,
    addressText: 'Silk Board Junction, Bengaluru'
  });

  const [aiPreview, setAiPreview] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleAiAnalyze = async () => {
    if (!formData.description) return;
    setIsAiLoading(true);
    try {
      const res = await getAiTriagePreview(formData.description);
      setAiPreview(res);
    } catch (err) {
      console.error('AI Triage error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitIncidentReport(formData);
      setSubmittedSuccess(true);
      if (onReportSubmitted) onReportSubmitted(res);
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950">
        <div className="flex items-center space-x-3 text-red-400 mb-2">
          <Radio className="w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-bold tracking-tight text-white">CITIZEN EMERGENCY REPORT PORTAL</h2>
        </div>
        <p className="text-slate-300 text-sm">
          Submit an emergency report with location coordinates. Our **Gemini AI Engine** will instantly triage urgency level and dispatch nearest available NDRF & Volunteer teams.
        </p>
      </div>

      {submittedSuccess ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border border-emerald-500/30">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-2xl font-bold text-white">Emergency Request Broadcasted!</h3>
          <p className="text-slate-300 max-w-md mx-auto text-sm">
            Your report has been submitted to the Command Center and plotted live on the GIS map. Nearby responders are being auto-dispatched.
          </p>
          <button
            onClick={() => {
              setSubmittedSuccess(false);
              setAiPreview(null);
              setFormData({ title: '', description: '', reportedBy: '', contactPhone: '', latitude: 12.9716, longitude: 77.5946, addressText: '' });
            }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-sm border border-slate-700 transition"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Report Form */}
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Incident Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Title / Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Flash Flood Water Logging in Sector 4"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Detailed Situation Description</label>
              <textarea
                rows={4}
                required
                placeholder="Describe what happened, number of stranded people, immediate dangers..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={isAiLoading || !formData.description}
                className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'AI Triage Analyzing...' : '⚡ Test Instant AI Triage Preview'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reporter Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Location Address / Landmark</label>
              <input
                type="text"
                placeholder="Address or nearby landmark"
                value={formData.addressText}
                onChange={(e) => setFormData({ ...formData, addressText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting & Broadcasting...' : 'Broadcast Emergency Signal'}</span>
            </button>
          </form>

          {/* AI Triage Card Preview */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-slate-900/60">
              <div className="flex items-center space-x-2 text-cyan-400 mb-3">
                <Cpu className="w-5 h-5 animate-spin" />
                <h3 className="font-bold text-slate-100 text-sm">Gemini AI Real-Time Triage Engine</h3>
              </div>

              {aiPreview ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400">Classified Disaster Type:</span>
                    <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                      {aiPreview.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400">Calculated Urgency Level:</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      aiPreview.urgencyScore >= 8 ? 'bg-red-950 text-red-400 border-red-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {aiPreview.urgencyScore} / 10
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400 block mb-1">Extracted Resource Needs:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiPreview.extractedNeeds?.map((need, i) => (
                        <span key={i} className="text-xs bg-slate-900 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                    "{aiPreview.summary}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Fill in the incident description and click "⚡ Test Instant AI Triage Preview" to see Gemini classification live.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
