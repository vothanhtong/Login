require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'login')));

// Kết nối MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Kết nối MongoDB Atlas thành công'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB Atlas:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token không hợp lệ' });
    req.user = user;
    next();
  });
};

// Route đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });
    res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
  }
});

// Route đăng nhập
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      message: 'Đăng nhập thành công!', 
      token,
      email: user.email 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
