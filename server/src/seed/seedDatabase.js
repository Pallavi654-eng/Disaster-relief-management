const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Incident = require('../models/Incident');
const User = require('../models/User');
const Shelter = require('../models/Shelter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/disaster_relief_db';

const sampleUsers = [
  {
    name: 'Rahul Sharma (NDRF Responder)',
    email: 'rahul.ndrf@disaster.gov.in',
    role: 'NGO_RESPONDER',
    phone: '+91 9876543210',
    skills: ['Boat Rescue', 'First Aid', 'Search & Rescue'],
    rating: 4.9,
    capacity: 10,
    location: { type: 'Point', coordinates: [77.5946, 12.9716] } // Bangalore Center
  },
  {
    name: 'Dr. Priya Ananth (Medical Team)',
    email: 'priya.medical@redcross.org',
    role: 'VOLUNTEER',
    phone: '+91 9812345678',
    skills: ['First Aid', 'Ambulance', 'Trauma Care'],
    rating: 4.8,
    capacity: 4,
    location: { type: 'Point', coordinates: [77.6012, 12.9654] }
  },
  {
    name: 'Vikram Singh (Fire & Rescue)',
    email: 'vikram.rescue@gmail.com',
    role: 'VOLUNTEER',
    phone: '+91 9765432109',
    skills: ['Fire Extinguisher', 'Heavy Machinery'],
    rating: 4.7,
    capacity: 8,
    location: { type: 'Point', coordinates: [77.5823, 12.9845] }
  },
  {
    name: 'Command Officer Rajesh',
    email: 'admin@disaster-control.org',
    role: 'ADMIN',
    phone: '+91 9900011122',
    skills: ['Command', 'Logistics'],
    location: { type: 'Point', coordinates: [77.5946, 12.9716] }
  }
];

const sampleIncidents = [
  {
    title: 'Severe Urban Flooding - Silk Board Junction',
    description: 'Heavy torrential downpour has caused 4 feet of water logging. Multiple commuters stranded in buses and cars.',
    type: 'FLOOD',
    urgencyScore: 8,
    status: 'TRIAGED',
    reportedBy: 'Kavita Nair',
    contactPhone: '+91 9123456789',
    addressText: 'Silk Board Flyover Ramp, Bengaluru',
    location: { type: 'Point', coordinates: [77.6245, 12.9172] }, // Silk Board
    aiTriage: {
      extractedNeeds: ['Boat Rescue', 'Life Jackets', 'Evacuation'],
      victimCountEstimate: 12,
      confidenceScore: 0.95,
      isVerified: true
    }
  },
  {
    title: 'Short Circuit Electrical Fire - Industrial Area',
    description: 'Smoke billowing from chemical warehouse. Risk of chemical fumes spreading to nearby residential residential quarters.',
    type: 'FIRE',
    urgencyScore: 9,
    status: 'TRIAGED',
    reportedBy: 'Security Guard Suresh',
    contactPhone: '+91 9888777666',
    addressText: 'Peenya Industrial Area Phase 2, Bengaluru',
    location: { type: 'Point', coordinates: [77.5186, 13.0315] }, // Peenya
    aiTriage: {
      extractedNeeds: ['Fire Extinguisher', 'Medical Kit', 'Search & Rescue'],
      victimCountEstimate: 5,
      confidenceScore: 0.92,
      isVerified: true
    }
  },
  {
    title: 'Wall Collapse due to Landslide Risk',
    description: 'Old concrete retaining wall cracked and collapsed near construction site. 2 workers trapped under minor rubble.',
    type: 'BUILDING_COLLAPSE',
    urgencyScore: 7,
    status: 'PENDING',
    reportedBy: 'Anil Kumar',
    contactPhone: '+91 9444333222',
    addressText: 'MG Road Metro Station North, Bengaluru',
    location: { type: 'Point', coordinates: [77.6070, 12.9756] },
    aiTriage: {
      extractedNeeds: ['Heavy Machinery', 'First Aid', 'Ambulance'],
      victimCountEstimate: 2,
      confidenceScore: 0.88,
      isVerified: true
    }
  }
];

const sampleShelters = [
  {
    name: 'Kanteerava Relief Center & Stadium Shelter',
    address: 'Kanteerava Indoor Stadium, MG Road, Bengaluru',
    totalCapacity: 500,
    currentOccupancy: 120,
    contactPhone: '+91 80 22221111',
    supplies: { foodPacks: 450, waterLiters: 2000, medicalKits: 50, blankets: 300 },
    location: { type: 'Point', coordinates: [77.5929, 12.9698] }
  },
  {
    name: 'Indiranagar Community Emergency Hall',
    address: '100 Feet Road, Indiranagar, Bengaluru',
    totalCapacity: 200,
    currentOccupancy: 45,
    contactPhone: '+91 80 44445555',
    supplies: { foodPacks: 180, waterLiters: 800, medicalKits: 30, blankets: 120 },
    location: { type: 'Point', coordinates: [77.6412, 12.9784] }
  }
];

async function seedDB() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    console.log('Clearing existing data...');
    await Incident.deleteMany({});
    await User.deleteMany({});
    await Shelter.deleteMany({});

    console.log('Seeding Users...');
    await User.insertMany(sampleUsers);

    console.log('Seeding Incidents...');
    await Incident.insertMany(sampleIncidents);

    console.log('Seeding Shelters...');
    await Shelter.insertMany(sampleShelters);

    console.log('Creating 2dsphere indexes...');
    await Incident.createIndexes();
    await User.createIndexes();
    await Shelter.createIndexes();

    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Seeding Failed:', err);
    process.exit(1);
  }
}

seedDB();
