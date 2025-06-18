const mongoose = require("mongoose")

const userInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    birthday: String,
},{
    collection:"UserInfo"
});
const UserInfo = mongoose.models.UserInfo || mongoose.model("UserInfo", userInfoSchema);

module.exports=UserInfo