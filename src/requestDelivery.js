const mongoose = require("mongoose")

const requestDeliverySchema = new mongoose.Schema({
    senderName: String,
    receiverName: String,
    senderMobile: String,
    receiverMobile: String,
    price: String,
    distance: String,
    clientOriginName: String,
    clientDestinationName: String,
    weight:  String,
    type: String,
    size: String,
    senderLatitude: String,
    senderLongitude: String,
    receiverLatitude: String,
    receiverLongitude: String,
    rideId: { type: String, unique: true},
    status: {
    type: String,
    enum: ['arriving','arrived', 'pickedUpGoods', 'completed'],
    default: 'arriving'
  },

  statusHistory: [
    {
      status: String,
      time: Date
    }
  ]
},{
    collection:"RequestDelivery"
});
module.exports = mongoose.model("RequestDelivery", requestDeliverySchema)