const mongoose = require('mongoose');

const rideStatusSchema = new mongoose.Schema({
  clientId: String,
  driverId: String,
  origin: Object,
  destination: Object,
  price: Number,
  status: {
    type: String,
    enum: ['pending', 'arriving','arrived' ,'pickedUp', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ride', rideStatusSchema);
