const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Incident = require('./models/Incident');
const User = require('./models/User');
const Dispatch = require('./models/Dispatch');
const Shelter = require('./models/Shelter');
const MissingPerson = require('./models/MissingPerson');
const Donation = require('./models/Donation');

const { performAiTriage } = require('./services/aiService');
const { findOptimalResponders } = require('./dsa/matchingEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/disaster_relief_db';

let isMongoConnected = false;

// Memory Cache fallback if MongoDB is offline
const inMemoryStore = {
  incidents: [
    {
      _id: 'inc-101',
      title: 'Flash Flood Emergency - Sector 4 Bridge',
      description: 'Rising water level trapped 3 elderly citizens near the river bank.',
      type: 'FLOOD',
      urgencyScore: 9,
      status: 'TRIAGED',
      reportedBy: 'Local Resident',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      addressText: 'Sector 4 River Bridge, Bengaluru',
      aiTriage: {
        extractedNeeds: ['Boat Rescue', 'First Aid', 'Evacuation'],
        victimCountEstimate: 3,
        confidenceScore: 0.96,
        fakeDetectionScore: 2,
        imageVerificationScore: 98,
        isVerified: true
      },
      createdAt: new Date()
    },
    {
      _id: 'inc-102',
      title: 'Commercial Building Electrical Fire',
      description: 'Fire on 2nd floor, dense smoke in stairwell. Need immediate evacuation assistance.',
      type: 'FIRE',
      urgencyScore: 8,
      status: 'PENDING',
      reportedBy: 'Shop Owner',
      location: { type: 'Point', coordinates: [77.6100, 12.9600] },
      addressText: 'Commercial Street, Bengaluru',
      aiTriage: {
        extractedNeeds: ['Fire Extinguisher', 'Ambulance'],
        victimCountEstimate: 4,
        confidenceScore: 0.91,
        fakeDetectionScore: 4,
        imageVerificationScore: 92,
        isVerified: true
      },
      createdAt: new Date()
    }
  ],
  users: [
    {
      _id: 'u-1',
      name: 'NDRF Disaster Unit Alpha',
      email: 'ndrf.alpha@gov.in',
      role: 'NGO_RESPONDER',
      skills: ['Boat Rescue', 'First Aid', 'Search & Rescue'],
      isAvailable: true,
      rating: 4.9,
      location: { type: 'Point', coordinates: [77.5900, 12.9750] }
    },
    {
      _id: 'u-2',
      name: 'Dr. Anita Roy (Red Cross)',
      email: 'anita@redcross.org',
      role: 'VOLUNTEER',
      skills: ['First Aid', 'Ambulance'],
      isAvailable: true,
      rating: 4.8,
      location: { type: 'Point', coordinates: [77.6050, 12.9650] }
    }
  ],
  dispatches: [],
  shelters: [
    {
      _id: 'sh-1',
      name: 'Central Relief Shelter',
      address: 'Town Hall Grounds, Bengaluru',
      totalCapacity: 400,
      currentOccupancy: 110,
      supplies: { foodPacks: 350, waterLiters: 1500, medicalKits: 40, blankets: 250 },
      location: { type: 'Point', coordinates: [77.5800, 12.9600] }
    }
  ],
  missingPersons: [
    {
      _id: 'mp-1',
      fullName: 'Ramesh Kumar',
      age: 42,
      gender: 'Male',
      lastSeenLocation: 'Silk Board Junction, Bengaluru',
      lastSeenDate: new Date(),
      status: 'MISSING',
      contactName: 'Suman Kumar (Spouse)',
      contactPhone: '+91 9876501234',
      additionalNotes: 'Wearing blue jacket, last seen heading towards flooded ramp.'
    },
    {
      _id: 'mp-2',
      fullName: 'Aarav Sharma',
      age: 8,
      gender: 'Male',
      lastSeenLocation: 'Peenya Industrial Market',
      lastSeenDate: new Date(),
      status: 'IN_SHELTER',
      shelterAssigned: 'Central Relief Shelter',
      contactName: 'Priya Sharma (Mother)',
      contactPhone: '+91 9812344321',
      additionalNotes: 'Safely evacuated by NDRF team.'
    }
  ],
  donations: [
    {
      _id: 'don-1',
      donorName: 'Rotary Club Bengaluru',
      category: 'WATER',
      itemName: 'Drinking Water Bottles (5L)',
      quantity: 500,
      unit: 'Bottles',
      targetShelter: 'Central Relief Shelter',
      status: 'DELIVERED',
      createdAt: new Date()
    },
    {
      _id: 'don-2',
      donorName: 'Apex Pharma',
      category: 'MEDICAL',
      itemName: 'First Aid Emergency Kits',
      quantity: 100,
      unit: 'Kits',
      targetShelter: 'Kanteerava Relief Center',
      status: 'IN_TRANSIT',
      createdAt: new Date()
    }
  ]
};

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully to', MONGODB_URI);
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection warning (Operating with In-Memory repository):', err.message);
  });

// --- REST API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    dbStatus: isMongoConnected ? 'CONNECTED (MongoDB Persistent)' : 'MEMORY_FALLBACK',
    timestamp: new Date()
  });
});

// 1. GET Incidents (Supports GeoSpatial MongoDB $near query if lat/lng provided)
app.get('/api/incidents', async (req, res) => {
  try {
    const { lat, lng, radiusKm } = req.query;

    if (isMongoConnected) {
      let query = {};
      if (lat && lng) {
        const radiusMeters = (parseFloat(radiusKm) || 20) * 1000;
        query.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: radiusMeters
          }
        };
      }
      const incidents = await Incident.find(query).sort({ createdAt: -1 });
      return res.json(incidents);
    } else {
      return res.json(inMemoryStore.incidents);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST AI Triage Preview
app.post('/api/incidents/triage-preview', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description text is required' });
    const aiResult = await performAiTriage(description);
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  // 3. POST Create Incident (Citizen Report)
  app.post('/api/incidents', async (req, res) => {
    try {
      const { title, description, reportedBy, contactPhone, latitude, longitude, addressText, photoUrl } = req.body;

      const lat = parseFloat(latitude) || 12.9716;
      const lng = parseFloat(longitude) || 77.5946;

      // Run AI Triage Pipeline
      const aiTriageResult = await performAiTriage(description, photoUrl);

      const incidentData = {
        title: title || `${aiTriageResult.type} Incident Reported`,
        description,
        type: aiTriageResult.type,
        urgencyScore: aiTriageResult.urgencyScore,
        status: 'TRIAGED',
        reportedBy: reportedBy || 'Citizen',
        contactPhone,
        location: { type: 'Point', coordinates: [lng, lat] },
        addressText: addressText || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        photoUrl,
        aiTriage: {
          extractedNeeds: aiTriageResult.extractedNeeds,
          victimCountEstimate: aiTriageResult.victimCountEstimate,
          confidenceScore: 0.95,
          isVerified: aiTriageResult.isVerified
        },
        createdAt: new Date()
      };

      let newIncident;
      if (isMongoConnected) {
        newIncident = await Incident.create(incidentData);
      } else {
        newIncident = { ...incidentData, _id: 'inc-' + Date.now() };
        inMemoryStore.incidents.unshift(newIncident);
      }

      // Broadcast to real-time clients via Socket.io
      io.emit('incident:created', newIncident);

      res.status(201).json(newIncident);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// 4. GET Responders / Volunteers
app.get('/api/responders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const users = await User.find({ role: { $in: ['VOLUNTEER', 'NGO_RESPONDER'] } });
      res.json(users);
    } else {
      res.json(inMemoryStore.users);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST DSA Auto-Match & Resource Dispatch
app.post('/api/dispatches/auto-match/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params;
    let incident;
    let availableVolunteers;

    if (isMongoConnected) {
      incident = await Incident.findById(incidentId);
      availableVolunteers = await User.find({ role: { $in: ['VOLUNTEER', 'NGO_RESPONDER'] }, isAvailable: true });
    } else {
      incident = inMemoryStore.incidents.find((i) => i._id.toString() === incidentId);
      availableVolunteers = inMemoryStore.users.filter((u) => u.isAvailable);
    }

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Execute DSA Matching Engine
    const optimalMatches = findOptimalResponders(incident, availableVolunteers, 3);

    const createdDispatches = [];
    for (const match of optimalMatches) {
      const dispatchData = {
        incidentId: incident._id,
        responderId: match.responder._id,
        responderName: match.responder.name,
        matchScore: match.matchScore,
        distanceKm: match.distanceKm,
        status: 'ASSIGNED',
        assignedAt: new Date()
      };

      if (isMongoConnected) {
        const saved = await Dispatch.create(dispatchData);
        createdDispatches.push(saved);
      } else {
        const saved = { ...dispatchData, _id: 'disp-' + Date.now() + Math.random() };
        inMemoryStore.dispatches.push(saved);
        createdDispatches.push(saved);
      }
    }

    // Update Incident status
    if (isMongoConnected) {
      await Incident.findByIdAndUpdate(incidentId, { status: 'DISPATCHED' });
    } else {
      incident.status = 'DISPATCHED';
    }

    // Emit socket update
    io.emit('dispatch:created', { incidentId, dispatches: createdDispatches });

    res.json({
      message: `Successfully matched ${createdDispatches.length} optimal responders via DSA Engine.`,
      dispatches: createdDispatches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET Shelters
app.get('/api/shelters', async (req, res) => {
  try {
    if (isMongoConnected) {
      const shelters = await Shelter.find({});
      res.json(shelters);
    } else {
      res.json(inMemoryStore.shelters);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. GET Admin Command Center Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    let incidents = isMongoConnected ? await Incident.find({}) : inMemoryStore.incidents;
    let responders = isMongoConnected ? await User.find({ role: { $in: ['VOLUNTEER', 'NGO_RESPONDER'] } }) : inMemoryStore.users;
    let shelters = isMongoConnected ? await Shelter.find({}) : inMemoryStore.shelters;

    const criticalCount = incidents.filter((i) => i.urgencyScore >= 8).length;
    const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;
    const activeRespondersCount = responders.filter((r) => r.isAvailable).length;

    res.json({
      totalIncidents: incidents.length,
      criticalIncidents: criticalCount,
      resolvedIncidents: resolvedCount,
      activeResponders: activeRespondersCount,
      sheltersAvailable: shelters.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. GET & POST Missing Persons Registry
app.get('/api/missing-persons', async (req, res) => {
  try {
    if (isMongoConnected) {
      const list = await MissingPerson.find({}).sort({ createdAt: -1 });
      res.json(list);
    } else {
      res.json(inMemoryStore.missingPersons);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/missing-persons', async (req, res) => {
  try {
    const data = req.body;
    let saved;
    if (isMongoConnected) {
      saved = await MissingPerson.create(data);
    } else {
      saved = { ...data, _id: 'mp-' + Date.now(), createdAt: new Date() };
      inMemoryStore.missingPersons.unshift(saved);
    }
    io.emit('missingPerson:created', saved);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. GET & POST Donation Tracking
app.get('/api/donations', async (req, res) => {
  try {
    if (isMongoConnected) {
      const list = await Donation.find({}).sort({ createdAt: -1 });
      res.json(list);
    } else {
      res.json(inMemoryStore.donations);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const data = req.body;
    let saved;
    if (isMongoConnected) {
      saved = await Donation.create(data);
    } else {
      saved = { ...data, _id: 'don-' + Date.now(), createdAt: new Date() };
      inMemoryStore.donations.unshift(saved);
    }
    io.emit('donation:created', saved);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. GET AI Predictive Resource Shortage Forecast
app.get('/api/analytics/predictive', async (req, res) => {
  try {
    let incidents = isMongoConnected ? await Incident.find({}) : inMemoryStore.incidents;
    let shelters = isMongoConnected ? await Shelter.find({}) : inMemoryStore.shelters;

    let totalVictims = incidents.reduce((sum, inc) => sum + (inc.aiTriage?.victimCountEstimate || 1), 0);
    let totalWaterAvailable = shelters.reduce((sum, s) => sum + (s.supplies?.waterLiters || 0), 0);
    let totalFoodAvailable = shelters.reduce((sum, s) => sum + (s.supplies?.foodPacks || 0), 0);

    // AI Prediction math: Each victim consumes ~3L water/day and 2 food packs/day
    let waterBurnRatePerDay = totalVictims * 3;
    let foodBurnRatePerDay = totalVictims * 2;

    let daysWaterRemaining = waterBurnRatePerDay > 0 ? (totalWaterAvailable / waterBurnRatePerDay).toFixed(1) : 10;
    let daysFoodRemaining = foodBurnRatePerDay > 0 ? (totalFoodAvailable / foodBurnRatePerDay).toFixed(1) : 10;

    let isShortagePredicted = daysWaterRemaining < 3 || daysFoodRemaining < 3;

    res.json({
      totalVictimsEstimated: totalVictims,
      totalWaterLiters: totalWaterAvailable,
      totalFoodPacks: totalFoodAvailable,
      daysWaterRemaining,
      daysFoodRemaining,
      isShortagePredicted,
      alertMessage: isShortagePredicted
        ? `⚠️ AI Shortage Alert: Resource depletion predicted in ${Math.min(daysWaterRemaining, daysFoodRemaining)} days for active victims!`
        : `✅ Resource Buffer Stable: Supply reserves sufficient for ~${daysWaterRemaining} days.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCKET.IO REALTIME EVENTS ---
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Real-Time Socket.io stream: ${socket.id}`);

  socket.on('responder:location_update', (data) => {
    // Broadcast live location marker update to all connected maps
    socket.broadcast.emit('responder:location_changed', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, "0.0.0.0" ,() => {
  console.log(`🚀 Disaster Relief Backend Server running on port ${PORT}`);
});
