const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
  responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: { type: Number, required: true },
  distanceKm: { type: Number, required: true },
  status: {
    type: String,
    enum: ['ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED', 'DECLINED'],
    default: 'ASSIGNED'
  },
  assignedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dispatch', DispatchSchema);
