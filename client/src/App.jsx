import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CommandCenter from './portals/CommandCenter';
import CitizenPortal from './portals/CitizenPortal';
import ResponderPortal from './portals/ResponderPortal';
import ShelterManager from './portals/ShelterManager';
import MissingPersonPortal from './portals/MissingPersonPortal';
import DonationTracker from './portals/DonationTracker';
import { socket, fetchIncidents, fetchResponders, fetchShelters, fetchAnalytics } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'victim' | 'responder' | 'shelters' | 'missing' | 'donations'
  const [socketConnected, setSocketConnected] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [analytics, setAnalytics] = useState({});

  const loadData = async () => {
    try {
      const [incRes, respRes, shRes, anaRes] = await Promise.all([
        fetchIncidents(),
        fetchResponders(),
        fetchShelters(),
        fetchAnalytics()
      ]);
      setIncidents(incRes || []);
      setResponders(respRes || []);
      setShelters(shRes || []);
      setAnalytics(anaRes || {});
    } catch (err) {
      console.error('Error fetching platform data:', err);
    }
  };

  useEffect(() => {
    loadData();

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('incident:created', (newIncident) => {
      setIncidents((prev) => [newIncident, ...prev]);
      fetchAnalytics().then((res) => setAnalytics(res));
    });

    socket.on('dispatch:created', () => {
      loadData();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('incident:created');
      socket.off('dispatch:created');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        socketConnected={socketConnected}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'command' && (
          <CommandCenter
            incidents={incidents}
            responders={responders}
            shelters={shelters}
            analytics={analytics}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'victim' && (
          <CitizenPortal
            onReportSubmitted={() => {
              loadData();
              setActiveTab('command');
            }}
          />
        )}

        {activeTab === 'responder' && (
          <ResponderPortal
            responders={responders}
            incidents={incidents}
          />
        )}

        {activeTab === 'shelters' && (
          <ShelterManager
            shelters={shelters}
          />
        )}

        {activeTab === 'missing' && (
          <MissingPersonPortal />
        )}

        {activeTab === 'donations' && (
          <DonationTracker />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 font-mono">
        Rescuenet AI — Disaster Relief Coordination Platform &bull; Built with Express, Mongoose 2DSphere, Socket.io, Gemini AI & React Leaflet
      </footer>
    </div>
  );
}
