const express = require("express")
const app = express()
const http = require('http');
const mongoose = require("mongoose")
app.use(express.json())
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const socketIo = require('socket.io');
const cors = require('cors');
const router = express.Router();
const axios = require('axios');
const fetch = require('node-fetch');
const FormData = require('form-data');
const querystring = require('querystring');
app.use(cors());
const bodyParser = require('body-parser');
const kmeans = require('ml-kmeans');
const fs = require('fs');
const mongoUrl="mongodb+srv://pmqdz:quandz123@datn.mxtjud1.mongodb.net/?retryWrites=true&w=majority&appName=DATN"
const JWT_SECRET = "laksjflsdfja()kjafldksjflajfla[]lfaj323i20jffj2of38lkajld;kjcaj3kl2j4kl2j3lfj23oij23foijc32oij3ocij2oj" 
mongoose
    .connect(mongoUrl)
    .then(()=>{
    console.log("Database connected")
    })
    .catch((e)=>{
    console.log(e)
})

require("./userInfo")
require("./requestRide")
require("./message")
require("./Otp")
require("./requestDelivery")
const user = mongoose.model("UserInfo")
const requestRide = mongoose.model("RequestRide")
const Message = mongoose.model("Message")
const requestDelivery = mongoose.model("RequestDelivery")

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});
io.on('connection', (socket) => {
  console.log('AcceptRide connected:', socket.id);

  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);
    // Gửi message đến tất cả client, kể cả sender
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('AcceptRide disconnected:', socket.id);
  });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('acceptRide', ({ rideId, driverInfo }) => {
    console.log('Tài xế nhận đơn:', driverInfo);

    // Gửi thông tin tài xế đến client theo rideId (phòng riêng hoặc broadcast)
    io.emit(`driverInfo:${rideId}`, driverInfo); // hoặc sử dụng io.to(rideId).emit(...) nếu dùng phòng

    
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('acceptDelivery', ({ rideId, driverInfo }) => {
    console.log('Tài xế nhận đơn:', driverInfo);

    // Gửi thông tin tài xế đến client theo rideId (phòng riêng hoặc broadcast)
    io.emit(`driverInfo:${rideId}`, driverInfo); // hoặc sử dụng io.to(rideId).emit(...) nếu dùng phòng

    
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

io.on('connection', (socket) => {
  console.log('AcceptDelivery connected:', socket.id);

  socket.on('sendDelivery', (message) => {
    console.log('Received message:', message);
    // Gửi message đến tất cả client, kể cả sender
    io.emit('receiveDelivery', message);
  });

  socket.on('disconnect', () => {
    console.log('AcceptDelivery disconnected:', socket.id);
  });
});

io.on('connection', (socket) => {
  console.log('CancelRide connected:', socket.id);

  socket.on('sendCancel', (message) => {
    console.log('Received cancel message:', message);
    // Gửi message đến tất cả client, kể cả sender
    io.emit('receiveCancel', message);
  });

  socket.on('disconnect', () => {
    console.log('CancelRide disconnected:', socket.id);
  });
});

io.on('connection', (socket) => {
  console.log('CompleteRide connected:', socket.id);

  socket.on('sendComplete', (message) => {
    console.log('Received cancel message:', message);
    // Gửi message đến tất cả client, kể cả sender
    io.emit('receiveComplete', message);
  });

  socket.on('disconnect', () => {
    console.log('CompleteRide disconnected:', socket.id);
  });
});

io.on('connection', (socket) => {
  console.log('CompleteDelivery connected:', socket.id);

  socket.on('sendCompleteDelivery', (message) => {
    console.log('Received cancel message:', message);
    // Gửi message đến tất cả client, kể cả sender
    io.emit('receiveCompleteDelivery', message);
  });

  socket.on('disconnect', () => {
    console.log('CompleteDelivery disconnected:', socket.id);
  });
});
io.on('connection', (socket) => {
  console.log('ChatMessage connected');

  socket.on('join', (userId) => {
    socket.join(userId); // mỗi người join theo ID riêng
    console.log(`User ${userId} joined their room`);
  });

  socket.on('chatMessage', async (data) => {
    // Lưu tin nhắn
    await Message.create(data);

    // Gửi cho người nhận
    io.to(data.receiverId).emit('chatMessage', data);
    console.log(`Emit message to receiverId: ${data.receiverId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/messages/:rideId', async (req, res) => {
  const messages = await Message.find({ rideId: req.params.rideId }).sort({ timestamp: -1 });
  res.json(messages);
});


app.get("/",(req, res)=>{
    res.send({status: "quan has Started"})
})

app.get("/request-ride", async (req, res) => {
  try {
    const rides = await requestRide.find().sort({ _id: -1 }); // Lấy chuyến mới nhất trước
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi lấy danh sách chuyến" });
  }
});
app.get("/request-delivery", async (req, res) => {
  try {
    const rides = await requestDelivery.find().sort({ _id: -1 }); // Lấy chuyến mới nhất trước
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi lấy danh sách chuyến" });
  }
});
app.get("/request-ride/latest", (req, res) => {
  if (rides.length === 0) return res.json(null);
  const latest = rides[rides.length - 1];
  res.json(latest);
});

app.post('/register', async (req, res) => {
  const { phone, name, birthday } = req.body;
  if (!phone || !name || !birthday) {
    return res.status(400).json({ status: "error", data: "Thiếu thông tin đăng ký" });
  }

  try {
    const existingUser = await user.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ status: "error", data: "Số điện thoại đã được đăng ký" });
    }

    await user.create({ phone, name, birthday });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", data: "Lỗi server" });
  }
});


app.post('/login-driver', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const driver = await DriverInfo.findOne({ phone });

    if (!driver) {
      return res.status(404).json({ message: "Số điện thoại không tồn tại" });
    }

    if (driver.password !== password) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    return res.status(200).json({
      message: "Đăng nhập thành công",
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        licensePlate: driver.licensePlate,
        imageUrl: driver.imageUrl
      }
    });
  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});



app.post("/login-user", async(req,res)=>{
     const { phone } = req.body;
 if (!phone) {
    return res.status(400).json({ message: 'Vui lòng nhập số điện thoại' });
  }
    const user = await UserInfo.findOne({ phone });

  if (!user) {
    return res.status(400).json({ message: 'Số điện thoại chưa đăng ký' });
  }

  // Nếu dùng OTP để login thì tạo token ở bước xác thực OTP hoặc gửi token luôn
  res.json({ message: 'Đăng nhập thành công', userId: user._id, name: user.name });
})

app.post('/get-user', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Thiếu số điện thoại" });

  const existingUser = await user.findOne({ phone });
  if (!existingUser) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  res.json({
    name: existingUser.name,
    phone: existingUser.phone
  });
});

//------------------------------------------------requestRide---------------------------------
app.post("/request-ride", async(req, res)=>{
    const 
    {name, 
    mobile,
    price,
    distance, 
    clientOriginName, 
    clientDestinationName,
    clientLatitude,
    clientLongitude, 
    clientDestinationLatitude,
    clientDestinationLongitude,
    rideId} = req.body
    
    try {
        await requestRide.create({
            name,
            mobile,
            price,
            distance,
            clientOriginName,
            clientDestinationName,
            clientLatitude,
            clientLongitude,
            clientDestinationLatitude,
            clientDestinationLongitude,
            rideId
        })
        res.send({status:"ok", data: "RequestRide created"})
    } catch (error) {
        res.send({status:"error", data: error})
    }
})

//------------------------------------------------requestDelivery---------------------------------
app.post("/request-delivery", async(req, res)=>{
    const 
    {
      senderName,
    receiverName,
    senderMobile,
    receiverMobile,
    price,
    distance,
    clientOriginName,
    clientDestinationName,
    weight,
    type,
    size,
    senderLatitude,
    senderLongitude,
    receiverLatitude,
    receiverLongitude,
    rideId} = req.body
    
    try {
        await requestDelivery.create({
            senderName,
            receiverName,
            senderMobile,
            receiverMobile,
            price,
            distance,
            clientOriginName,
            clientDestinationName,
            weight,
            type,
            size,
            senderLatitude,
            senderLongitude,
            receiverLatitude,
            receiverLongitude,
            rideId
        })
        res.send({status:"ok", data: "RequestDelivery created"})
    } catch (error) {
        res.send({status:"error", data: error})
    }
})

app.post('/delete-ride/:rideId', async(req, res)=>{
    const {rideId} = req.params
    try{
        await requestRide.deleteOne({rideId})
        res.send({status:"ok", data: "Ride deleted"})
    }catch(error) {
        res.send({status:"error", data: error})
    }
})
app.post('/delete-ride-delivery/:rideId', async(req, res)=>{
    const {rideId} = req.params
    try{
        await requestDelivery.deleteOne({rideId})
        res.send({status:"ok", data: "Ride deleted"})
    }catch(error) {
        res.send({status:"error", data: error})
    }
})
const Otp = mongoose.model("Otp")

function sendSms(phone, otp) {
  console.log(`📲 Gửi OTP ${otp} đến số ${phone}`);
}

app.post('/check-phone', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone is required' });

  try {
    const userExists = await user.findOne({ phone });
    return res.json({ exists: !!userExists });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    console.log("📥 Body nhận được:", req.body);

    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({ phone, otp });

    console.log(`📲 Đã tạo OTP ${otp} cho số ${phone}`);

    sendSms(phone, otp); // hoặc mô phỏng

    return res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error("❌ Lỗi send-otp:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  const record = await Otp.findOne({ phone, otp });

  if (!record) return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });

  // Xác thực thành công => tạo user hoặc token
  // VD: tạo JWT
  // const token = createToken({ phone });

  // Xóa mã sau xác thực
  await Otp.deleteMany({ phone });

  res.json({ message: 'Xác thực thành công' });
});
app.use("/", router);


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


//---------------------------------------------------faceAPI-----------------------------------------------

const apiKey = '3O1c5hnf51bj3OPJVQ1URw0cbIxi1nqt';
const apiSecret = 'aD4ppIGuzgN1bdkc5D5nwHSmeD7NO8_j';

app.post('/face-detect', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const formData = new FormData();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('image_base64', imageBase64);
    formData.append('return_attributes', 'age,gender,smiling,emotion');

    const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const responseText = await response.text();
    console.log('Face++ detect response:', responseText);
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (err) {
    console.error('Face++ detect error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/face-compare', async (req, res) => {
  try {
    const { imageBase64_1, imageBase64_2 } = req.body;

    const formData = new URLSearchParams();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('image_base64_1', imageBase64_1);
    formData.append('image_base64_2', imageBase64_2);

    const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('Face++ compare response:', responseText);
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//-----------------------------------------------------------------------------Ride Status-------------------------------------------------------------------------


router.patch('/:rideId/status', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    const validStatuses = ['arriving','arrived', 'pickedUp', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const ride = await requestRide.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Không tìm thấy chuyến đi' });
    }

    const currentStatus = ride.status || 'arriving'; // nếu chưa có, mặc định là arriving

    const nextStepMap = {
      arriving: 'arrived',
      arrived: 'pickedUp',
      pickedUp: 'completed'
    };

    const expectedNext = nextStepMap[currentStatus];
    if (status !== expectedNext) {
      return res.status(400).json({ error: `Không thể chuyển từ "${currentStatus}" sang "${status}"` });
    }

    // Cập nhật trạng thái và thời gian
    ride.status = status;
    ride.statusHistory = ride.statusHistory || []; // mảng lưu các lần cập nhật
    ride.statusHistory.push({ status, time: new Date() });

    await ride.save();

    return res.json({ message: 'Cập nhật trạng thái thành công', ride });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái chuyến:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

router.patch('/:rideId/deliStatus', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    const validStatuses = ['arriving','arrived', 'pickedUpGoods', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const ride = await requestDelivery.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Không tìm thấy chuyến đi' });
    }

    const currentStatus = ride.status || 'arriving'; // nếu chưa có, mặc định là arriving

    const nextStepMap = {
      arriving: 'arrived',
      arrived: 'pickedUpGoods',
      pickedUpGoods: 'completed'
    };

    const expectedNext = nextStepMap[currentStatus];
    if (status !== expectedNext) {
      return res.status(400).json({ error: `Không thể chuyển từ "${currentStatus}" sang "${status}"` });
    }

    // Cập nhật trạng thái và thời gian
    ride.status = status;
    ride.statusHistory = ride.statusHistory || []; // mảng lưu các lần cập nhật
    ride.statusHistory.push({ status, time: new Date() });

    await ride.save();

    return res.json({ message: 'Cập nhật trạng thái thành công', ride });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái chuyến:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});
//-----------------------------------------------------------------------------save history ride--------------------------------------------------------------------------
require("./rideHistory");
const RideHistory = mongoose.model("RideHistory")
app.post("/save-history", async (req, res) => {
  try {
    const { rideId, price, originName, destinationName, type } = req.body;

    await RideHistory.create({
      rideId,
      price,
      originName,
      destinationName,
      completedAt: new Date(),
      type: "Đặt xe"
    });
  await requestRide.findByIdAndDelete(rideId);
   res.json({ message: "Ride history saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save ride history" });
  }
});
app.post("/save-Delihistory", async (req, res) => {
  try {
    const { rideId, price, originName, destinationName, type } = req.body;

    await RideHistory.create({
      rideId,
      price,
      originName,
      destinationName,
      completedAt: new Date(),
      type: "Giao hàng"
    });
 ;
  await requestDelivery.findByIdAndDelete(rideId);
   res.json({ message: "Ride history saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save ride history" });
  }
});
app.get("/ride-history", async (req, res) => {
  try {
    const history = await RideHistory.find().sort({ completedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving history" });
  }
});

app.get("/ride-history/income-stats", async (req, res) => {
  try {
    const stats = await RideHistory.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          totalIncome: {
            $sum: {
              $toDouble: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: "$price",
                      find: ".",
                      replacement: ""
                    }
                  },
                  find: "đ",
                  replacement: ""
                }
              }
            }
          },
          rides: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Lỗi lấy thống kê thu nhập:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/ride-history", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const history = await RideHistory.find({
      $or: [
        { senderMobile: phone },
        { receiverMobile: phone },
      ],
    }).sort({ completedAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving history" });
  }
});

app.delete("/delete-ride-request/:id", async (req, res) => {
  try {
    const rideId = req.params.id;
    await requestRide.findByIdAndDelete(rideId);
    res.json({ message: "Ride request deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete ride request" });
  }
});
//-----------------------------------------------------------------------------KMEANS--------------------------------------------------------------------------
const peakHoursMapping = {
    'Morning': 0,    
    'Afternoon': 1,  
    'Evening': 2     
};

const data = [
    { area: 'Ba Đình', population: 226315, trafficDensity: 7000, peakHours: 'Morning', "latitude": 21.03587000 , "longitude": 105.82163000 },
    { area: 'Cầu Giấy', population: 294235, trafficDensity: 7500, peakHours: 'Morning', "latitude": 21.034481105889583, "longitude":105.79232545388217 },
    { area: 'Hoàn Kiếm', population: 141687, trafficDensity: 8000, peakHours: 'Morning', "latitude": 21.030927326947985, "longitude":105.85465786150633 },
    { area: 'Hai Bà Trưng', population: 304101, trafficDensity: 7000, peakHours: 'Morning', "latitude": 21.008483307182715,"longitude": 105.85705942473847 },
    { area: 'Hoàng Mai', population: 540732, trafficDensity: 9000, peakHours: 'Afternoon', "latitude": 20.97821822457275,"longitude": 105.8549853573415 },
    { area: 'Đống Đa', population: 376709, trafficDensity: 6000, peakHours: 'Afternoon', "latitude": 21.0181463164228,"longitude": 105.82826209193549 },
    { area: 'Tây Hồ', population: 167851, trafficDensity: 5500, peakHours: 'Morning', "latitude": 21.080678869336605, "longitude": 105.81122029060487},
    { area: 'Thanh Xuân', population: 293292, trafficDensity: 7000, peakHours: 'Morning', "latitude": 20.99703003772091,"longitude": 105.81550015646395 },
    { area: 'Bắc Từ Liêm', population: 354364, trafficDensity: 6000, peakHours: 'Afternoon', "latitude": 21.068366901811856,"longitude": 105.76541400721648 },
    { area: 'Hà Đông', population: 382637, trafficDensity: 6500, peakHours: 'Evening', "latitude": 20.957543767951123,"longitude": 105.7632956156826 },
    { area: 'Long Biên', population: 337982, trafficDensity: 5500, peakHours: 'Morning', "latitude": 21.043078555666053,"longitude": 105.90179890730909 },
    { area: 'Nam Từ Liêm', population: 282444, trafficDensity: 5700, peakHours: 'Afternoon', "latitude": 21.011561229421837,"longitude": 105.76262931893416},
    { area: 'Chương Mỹ', population: 347564, trafficDensity: 4500, peakHours: 'Afternoon', "latitude": 20.920490277844646,"longitude": 105.7039403351986 },
    { area: 'Đan Phượng', population: 185653, trafficDensity: 3000, peakHours: 'Afternoon', "latitude": 21.089840402851653,"longitude": 105.66949350166723},
    { area: 'Đông Anh', population: 437308, trafficDensity: 5000, peakHours: 'Morning', "latitude": 21.145267470593005,"longitude": 105.8443310237667 },
    { area: 'Gia Lâm', population: 292943, trafficDensity: 4800, peakHours: 'Morning', "latitude": 21.026681100988608,"longitude": 105.96217748024849},
    { area: 'Hoài Đức', population: 257633, trafficDensity: 4500, peakHours: 'Afternoon', "latitude": 21.029106281153176,"longitude": 105.69974648698528 },
    { area: 'Mê Linh', population: 241633, trafficDensity: 4000, peakHours: 'Morning', "latitude": 21.17807839990104,"longitude": 105.70868183777569},
    { area: 'Phú Xuyên', population: 229847, trafficDensity: 5000, peakHours: 'Morning', "latitude": 20.716321499166266,"longitude": 105.89834064734896},
    { area: 'Phúc Thọ', population: 194754, trafficDensity: 6000, peakHours: 'Evening', "latitude": 21.086563487230553,"longitude": 105.62573712483675},
    { area: 'Quốc Oai', population: 203079, trafficDensity: 4000, peakHours: 'Afternoon', "latitude": 20.999350670361466, "longitude": 105.63612548771746 },
    { area: 'Thạch Thất', population: 223844, trafficDensity: 5000, peakHours: 'Afternoon', "latitude": 21.015924474175762,"longitude": 105.52337155155129},
    { area: 'Thanh Oai', population: 227541, trafficDensity: 4000, peakHours: 'Morning', "latitude": 20.865962034934636,"longitude": 105.78226646826553 },
    { area: 'Thanh Trì', population: 288839, trafficDensity: 5700, peakHours: 'Afternoon', "latitude": 20.935682614424767,"longitude": 105.83963371892257},
    { area: 'Thường Tín', population: 262222, trafficDensity: 4500, peakHours: 'Morning', "latitude": 20.871022330773137,"longitude": 105.86195106297885},


];



app.post('/recluster', (req, res) => {
// Kiểm tra số lượng điểm dữ liệu
const numPoints = data.length;
let k = 2; // Giá trị k, số cụm muốn phân

// Đảm bảo k không vượt quá số lượng điểm dữ liệu
if (k > numPoints) {
    console.log(`Lỗi: Số lượng cụm k (${k}) không thể lớn hơn số điểm dữ liệu (${numPoints}). Đặt k = ${numPoints}`);
    k = numPoints;  // Điều chỉnh k thành số điểm dữ liệu nếu k lớn hơn số lượng điểm dữ liệu
}
// Chuyển đổi dữ liệu để phù hợp với K-means 
const trafficData = data.map(item => [
    item.population, 
    item.trafficDensity,
]);


// Route phân cụm

    // Phân cụm với K-means và số cụm k (đảm bảo k không vượt quá số điểm dữ liệu)
    const result = kmeans(trafficData,  k );
    console.log('Kết quả phân cụm (clusters):', result.clusters);

// Tạo mảng các cụm và phân loại các điểm dữ liệu vào cụm tương ứng
const clustersResult = [];

for (let i = 0; i < k; i++) {
    const clusterInfo = {
        clusterNumber: i + 1,  // Đánh số các cụm bắt đầu từ 1
        label: "",
        points: []
    };

    // Lặp qua tất cả các điểm dữ liệu và phân loại chúng vào các cụm
    result.clusters.forEach((clusterId, pointIndex) => {
        if (clusterId === i) {
            clusterInfo.points.push({
                area: data[pointIndex].area,
                population: data[pointIndex].population,
                trafficDensity: data[pointIndex].trafficDensity,
                peakHours: data[pointIndex].peakHours,
                latitude: data[pointIndex].latitude,
                longitude: data[pointIndex].longitude
            });
        }
    });

    // Thêm thông tin của cụm vào kết quả
    clustersResult.push(clusterInfo);
}
// Gắn nhãn cho cụm: cụm có tổng dân số + giao thông cao hơn sẽ là "Nhiều"
    const clusterSums = clustersResult.map(cluster =>
        cluster.points.reduce((sum, p) => sum + p.population + p.trafficDensity, 0)
    );

    const [highIdx, lowIdx] = clusterSums[0] > clusterSums[1] ? [0, 1] : [1, 0];

    clustersResult[highIdx].label = "Nhiều";
    clustersResult[lowIdx].label = "Ít";
// In kết quả phân cụm
console.log(clustersResult);

// Lưu kết quả phân cụm vào tệp JSON
fs.writeFileSync('clusters_region.json', JSON.stringify(clustersResult, null, 2));
res.json({ message: 'Phân cụm thành công', clusters: clustersResult });
});

app.get('/clustering', (req, res) => {
    fs.readFile('clusters_region.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Không thể đọc tệp JSON' });
        } else {
            res.header("Content-Type", "application/json");
            res.send(data);
        }
    });
});
//-------------------------------------------------------driverManagament-------------------------------------------------------------------
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const driverRoutes = require('./driver');
const DriverInfo = require('./driverInfo');

app.use('/api/driver', driverRoutes);

app.get('/api/driver', async (req, res) => {
  try {
    const drivers = await DriverInfo.find();

    const fullDrivers = drivers.map(driver => {
  console.log('Image path:', driver.imageUrl); // 👈 thêm dòng này
  return {
    ...driver._doc,
    imageUrl: driver.imageUrl ? `http://localhost:3000/uploads/${driver.imageUrl}` : null
  };
});

    res.status(200).json(fullDrivers);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tài xế:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

//------------------------------------------------userManagament--------------------------------------------------
const userRoutes = require('./user'); // đường dẫn tới file user.js
app.use('/api/users', userRoutes);

// Cấu hình static (nếu có file ảnh, như ảnh đại diện user)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


server.listen(3000, ()=> {
    console.log("node js server started")
})