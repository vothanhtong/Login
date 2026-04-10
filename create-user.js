require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
  console.error('❌ Vui lòng cấu hình MONGODB_URI chính xác trong tệp .env trước khi chạy!');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }));

    const email = 'tong.vt.65ttql@ntu.edu.vn';
    const password = 'Cute123.'; // Bạn có thể thay đổi mật khẩu mong muốn tại đây

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️  Email đã tồn tại:', email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });

    console.log('✅ Tạo tài khoản thành công!');
    console.log('   Email   :', email);
    console.log('   Password:', password);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  });
