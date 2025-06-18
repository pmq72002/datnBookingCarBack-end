const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    senderId: String,
    senderName: String,
    receiverId: String,
    rideId: String,
    message: String,
    timeStamp: {type: Date, default: Date.now}
},{
    collection:"Message"
});
mongoose.model("Message", messageSchema)