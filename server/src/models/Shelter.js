const mongoose = require('mongoose');

const ShelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  totalCapacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  contactPhone: { type: String },
  supplies: {
    foodPacks: { type: Number, default: 100 },
    waterLiters: { type: Number, default: 500 },
    medicalKits: { type: Number, default: 25 },
    blankets: { type: Number, default: 150 }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [lng, lat]
    }
  }
});

ShelterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shelter', ShelterSchema);
