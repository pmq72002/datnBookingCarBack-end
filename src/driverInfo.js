const mongoose = require('mongoose');

const driverInfoSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
  vehicleType: String,
  licensePlate: String,
  imageUrl: String,
},{
    collection:"DriverInfo"
});

module.exports = mongoose.model('DriverInfo', driverInfoSchema);
