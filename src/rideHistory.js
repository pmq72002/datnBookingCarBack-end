const mongoose = require("mongoose");

const RideHistorySchema = new mongoose.Schema({
  rideId: String,
  price: String,
  originName: String,
  destinationName: String,
  type: String,
  completedAt: {
    type: Date,
    default: Date.now,
  },
  
},{
    collection:"RideHistory"
});

module.exports = mongoose.model("RideHistory", RideHistorySchema);