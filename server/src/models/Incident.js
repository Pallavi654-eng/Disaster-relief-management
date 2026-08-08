const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['FLOOD', 'FIRE', 'MEDICAL', 'BUILDING_COLLAPSE', 'LANDSLIDE', 'OTHER'],
    default: 'OTHER'
  },
  urgencyScore: { type: Number, min: 1, max: 10, default: 5 },
  status: {
    type: String,
    enum: ['PENDING', 'TRIAGED', 'DISPATCHED', 'RESOLVED', 'SPAM'],
    default: 'PENDING'
  },
  reportedBy: { type: String, default: 'Citizen' },
  contactPhone: { type: String },
  // GeoJSON Point location for 2dsphere indexing
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  addressText: { type: String },
  photoUrl: { type: String },
  aiTriage: {
    extractedNeeds: [String],
    victimCountEstimate: { type: Number, default: 1 },
    confidenceScore: { type: Number, default: 0.9 },
    fakeDetectionScore: { type: Number, default: 5 }, // 0% = Genuine, 100% = Fake/Spam
    imageVerificationScore: { type: Number, default: 95 }, // 0% = Invalid photo, 100% = High authenticity
    isVerified: { type: Boolean, default: true },
    isDuplicate: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// Index for MongoDB 2DSphere Geospatial queries ($near, $geoWithin)
IncidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', IncidentSchema);
