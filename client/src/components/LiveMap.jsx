import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Custom Leaflet Icons using SVG Data URIs
const createCustomIcon = (color, isCritical = false) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`;
  return L.divIcon({
    className: isCritical ? 'pulse-critical' : '',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const iconCritical = createCustomIcon('#ef4444', true);  // Red
const iconModerate = createCustomIcon('#f97316', false); // Orange
const iconLow = createCustomIcon('#eab308', false);      // Yellow
const iconResponder = createCustomIcon('#10b981', false);// Emerald Green
const iconShelter = createCustomIcon('#a855f7', false);  // Purple

export default function LiveMap({ incidents = [], responders = [], shelters = [], onSelectIncident }) {
  const defaultCenter = [12.9716, 77.5946]; // Bangalore center

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Incident Pins */}
        {incidents.map((inc) => {
          const [lng, lat] = inc.location?.coordinates || [77.5946, 12.9716];
          const isCritical = inc.urgencyScore >= 8;
          let icon = iconLow;
          if (inc.urgencyScore >= 8) icon = iconCritical;
          else if (inc.urgencyScore >= 5) icon = iconModerate;

          return (
            <React.Fragment key={inc._id}>
              <Marker position={[lat, lng]} icon={icon}>
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inc.urgencyScore >= 8 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        URGENCY: {inc.urgencyScore}/10
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{inc.type}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{inc.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2">{inc.description}</p>
                    
                    {inc.aiTriage?.extractedNeeds && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {inc.aiTriage.extractedNeeds.map((need, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {need}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => onSelectIncident && onSelectIncident(inc)}
                      className="w-full mt-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded transition"
                    >
                      Trigger DSA Dispatch
                    </button>
                  </div>
                </Popup>
              </Marker>
              
              {/* Radar Circle for Critical Incidents */}
              {isCritical && (
                <Circle
                  center={[lat, lng]}
                  radius={1500}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1 }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Responder Pins */}
        {responders.map((resp) => {
          const [lng, lat] = resp.location?.coordinates || [77.5946, 12.9716];
          return (
            <Marker key={resp._id} position={[lat, lng]} icon={iconResponder}>
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">RESPONDER</span>
                  <h4 className="font-bold text-sm text-slate-100 mt-1">{resp.name}</h4>
                  <p className="text-xs text-slate-300">Skills: {resp.skills?.join(', ')}</p>
                  <p className="text-xs text-emerald-400 font-mono mt-1">Status: Available</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shelter Pins */}
        {shelters.map((shelter) => {
          const [lng, lat] = shelter.location?.coordinates || [77.5946, 12.9716];
          return (
            <Marker key={shelter._id} position={[lat, lng]} icon={iconShelter}>
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] font-bold bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded">SHELTER</span>
                  <h4 className="font-bold text-sm text-slate-100 mt-1">{shelter.name}</h4>
                  <p className="text-xs text-slate-300">{shelter.address}</p>
                  <p className="text-xs text-purple-300 mt-1">
                    Capacity: {shelter.currentOccupancy} / {shelter.totalCapacity} beds occupied
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
