// src/driver.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DriverInfo = require('../src/driverInfo')

// Cấu hình lưu ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/register', upload.single('image'), async (req, res) => {
try {
    const { name, phone, password, vehicleType, licensePlate } = req.body;
    const imageFilename = req.file ? req.file.filename : null;

    const newDriver = new DriverInfo({
      name,
      phone,
      password,
      vehicleType,
      licensePlate,
      imageUrl: imageFilename
    });

    await newDriver.save();
    res.status(201).json({
  message: 'Tài xế đã được tạo thành công',
  driver: {
    ...newDriver._doc,
    imageUrl: newDriver.imageUrl ? `http://localhost:3000/uploads/${newDriver.imageUrl}` : null
  }
});

  } catch (err) {
    console.error('Error saving driver:', err);
    if (err.code === 11000 && err.keyPattern?.phone) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi khi lưu thông tin tài xế' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await DriverInfo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa tài xế thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa tài xế:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, phone, vehicleType, licensePlate } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    const updateData = { name, phone, vehicleType, licensePlate };
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updatedDriver = await DriverInfo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedDriver);
  } catch (error) {
    console.error('Lỗi cập nhật tài xế:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật tài xế' });
  }
});

module.exports = router;
