const express = require('express');
const router = express.Router();
const UserInfo = require('./userInfo');
const RideHistory = require('./rideHistory')

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const users = await UserInfo.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Lỗi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa người dùng
router.delete('/:id', async (req, res) => {
  try {
    await UserInfo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa người dùng' });
  }
});

// Sửa người dùng
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, birthday } = req.body;
    const updatedUser = await UserInfo.findByIdAndUpdate(
      req.params.id,
      { name, phone, birthday },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật người dùng' });

  }
});

// Lấy lịch sử chuyến đi của người dùng
router.get('/history', async (req, res) => {
  try {
    const history = await RideHistory.find().sort({ createdAt: -1 }); // Mới nhất lên trước
    res.json(history);
  } catch (err) {
    console.error("Lỗi khi lấy toàn bộ lịch sử:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
