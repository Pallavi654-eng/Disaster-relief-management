const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['CITIZEN', 'VOLUNTEER', 'NGO_RESPONDER', 'ADMIN'],
    default: 'VOLUNTEER'
  },
  phone: { type: String },
  skills: [{ type: String }], // e.g. ['First Aid', 'Boat Rescue', 'Firefighting', 'Heavy Machinery']
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 4.8 },
  capacity: { type: Number, default: 5 }, // resource payload capacity
  // GeoJSON Point location for 2dsphere indexing of live responder coordinates
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.5946, 12.9716] // Default Bangalore coords
    }
  },
  lastUpdated: { type: Date, default: Date.now }
});

UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
