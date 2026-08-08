const mongoose = require('mongoose');

const MissingPersonSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  lastSeenLocation: { type: String, required: true },
  lastSeenDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['MISSING', 'FOUND_SAFE', 'IN_SHELTER', 'HOSPITALIZED'],
    default: 'MISSING'
  },
  photoUrl: { type: String },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  shelterAssigned: { type: String, default: 'None' },
  additionalNotes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissingPerson', MissingPersonSchema);
