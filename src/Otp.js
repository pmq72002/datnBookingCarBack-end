const mongoose = require("mongoose")
const OtpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
},{
    collection:"Otp"
});
mongoose.model("Otp", OtpSchema)