const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyAnalysisRouter = require('./bodyAnalysis');
const bcrypt = require('bcrypt');

// .env dosyasının yolunu belirtiyoruz
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS ayarları
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Test endpoint'i
app.get('/api', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// Vücut analizi router'ını ekle
app.use('/api/body-analysis', bodyAnalysisRouter);

// MongoDB bağlantı URL'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitAnalysis';

// MongoDB Bağlantısı
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    console.log('Bağlantı URL:', MONGODB_URI);
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1); // Hata durumunda uygulamayı sonlandır
  });

// Kullanıcı Modeli
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  height: Number,
  weight: Number,
  dailyCalories: Number,
  fatPercent: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Giriş API endpoint'i
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'E-posta ve şifre zorunludur' 
      });
    }
    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı' 
      });
    }
    // Şifre kontrolü (bcrypt ile hash karşılaştırması)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Hatalı şifre' 
      });
    }
    res.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender,
        height: user.height,
        weight: user.weight
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası oluştu',
      error: error.message 
    });
  }
});

// Kayıt API endpoint'i
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate, gender, height, weight } = req.body;
    if (!firstName || !lastName || !email || !password || !birthDate || !gender || !height || !weight) {
      return res.status(400).json({ success: false, message: 'Tüm alanlar zorunludur.' });
    }
    // E-posta daha önce kayıtlı mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Bu e-posta ile zaten bir kullanıcı var.' });
    }
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthDate,
      gender,
      height,
      weight,
      dailyCalories: 0,
      fatPercent: 0
    });
    await user.save();
    res.status(201).json({ success: true, message: 'Kayıt başarılı. Giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu', error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 