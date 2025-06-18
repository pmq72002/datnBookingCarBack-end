const mongoose = require("mongoose")

const requestRideSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    price: String,
    distance: String,
    clientOriginName: String,
    clientDestinationName: String,
    clientLatitude: String,
    clientLongitude: String,
    clientDestinationLatitude: String,
    clientDestinationLongitude: String,
    rideId: { type: String, unique: true},
    status: {
    type: String,
    enum: ['arriving','arrived', 'pickedUp', 'completed'],
    default: 'arriving'
  },

  statusHistory: [
    {
      status: String,
      time: Date
    }
  ]
},{
    collection:"RequestRide"
});
module.exports = mongoose.model("RequestRide", requestRideSchema)