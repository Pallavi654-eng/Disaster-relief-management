const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  contactPhone: { type: String },
  category: {
    type: String,
    enum: ['FOOD', 'WATER', 'MEDICAL', 'CLOTHING', 'FUNDS', 'EQUIPMENT'],
    default: 'FOOD'
  },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'items' },
  targetShelter: { type: String, default: 'Central Relief Depot' },
  status: {
    type: String,
    enum: ['PLEDGED', 'IN_TRANSIT', 'DELIVERED'],
    default: 'PLEDGED'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);
