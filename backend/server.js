const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyAnalysisRouter = require('./bodyAnalysis');
const bcrypt = require('bcrypt');
const MealPlan = require('./mealPlan');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ExercisePlan = require('./exercisePlan');
const WaterIntake = require('./waterIntake');

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

// Kullanıcıya ait beslenme planlarını getir
app.get('/api/meal-plans', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId zorunludur.' });
    }
    const plans = await MealPlan.find({ userId });
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Planları getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Yeni beslenme planı oluştur
app.post('/api/meal-plans', async (req, res) => {
  try {
    console.log('Gelen istek:', req.body);
    const { userId, title, days } = req.body;
    
    // Gerekli alanların kontrolü
    if (!userId) {
      console.log('userId eksik');
      return res.status(400).json({ success: false, message: 'userId zorunludur.' });
    }
    if (!title || title.trim() === '') {
      console.log('title eksik veya boş');
      return res.status(400).json({ success: false, message: 'Plan başlığı zorunludur.' });
    }
    if (!days || typeof days !== 'object') {
      console.log('days eksik veya geçersiz');
      return res.status(400).json({ success: false, message: 'Geçerli bir plan yapısı gerekli.' });
    }

    // Kullanıcının varlığını kontrol et
    const user = await User.findById(userId);
    if (!user) {
      console.log('Kullanıcı bulunamadı:', userId);
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    // Planın boş olup olmadığını kontrol et
    const hasMeals = Object.values(days).some(day => 
      Object.values(day).some(meals => meals && meals.length > 0)
    );

    if (!hasMeals) {
      console.log('Plan boş');
      return res.status(400).json({ success: false, message: 'Plan en az bir öğün içermelidir.' });
    }

    console.log('Plan oluşturuluyor:', { userId, title });
    const mealPlan = new MealPlan({ userId, title, days });
    await mealPlan.save();
    console.log('Plan başarıyla oluşturuldu:', mealPlan._id);
    
    res.status(201).json({ success: true, message: 'Plan başarıyla oluşturuldu.', mealPlan });
  } catch (error) {
    console.error('Plan oluşturma hatası:', error);
    if (error.name === 'ValidationError') {
      console.log('Validation hatası:', error.errors);
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz plan verisi.',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.name === 'CastError') {
      console.log('Cast hatası:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz veri formatı.',
        error: error.message
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Beslenme planını güncelle
app.put('/api/meal-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, days } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Plan başlığı zorunludur.' });
    }
    if (!days || typeof days !== 'object') {
      return res.status(400).json({ success: false, message: 'Geçerli bir plan yapısı gerekli.' });
    }

    const mealPlan = await MealPlan.findById(id);
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
    }

    // Planın boş olup olmadığını kontrol et
    const hasMeals = Object.values(days).some(day => 
      Object.values(day).some(meals => meals && meals.length > 0)
    );

    if (!hasMeals) {
      return res.status(400).json({ success: false, message: 'Plan en az bir öğün içermelidir.' });
    }

    mealPlan.title = title;
    mealPlan.days = days;
    mealPlan.updatedAt = Date.now();
    await mealPlan.save();
    
    res.json({ success: true, message: 'Plan başarıyla güncellendi.', mealPlan });
  } catch (error) {
    console.error('Plan güncelleme hatası:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz plan verisi.',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Beslenme planını sil
app.delete('/api/meal-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mealPlan = await MealPlan.findByIdAndDelete(id);
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
    }
    res.json({ success: true, message: 'Plan başarıyla silindi.' });
  } catch (error) {
    console.error('Plan silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Beslenme planını Gemini API ile analiz et
app.post('/api/meal-plans/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyCalories } = req.body;
    
    if (!dailyCalories) {
      return res.status(400).json({ success: false, message: 'dailyCalories zorunludur.' });
    }

    const mealPlan = await MealPlan.findById(id);
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
    }

    // Tüm günlerin makro değerlerini hesapla
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const dayMeals = mealPlan.days[day];
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        if (dayMeals[mealType]) {
          dayMeals[mealType].forEach(meal => {
            totalCalories += meal.calories || 0;
            totalProtein += meal.protein || 0;
            totalCarbs += meal.carbs || 0;
            totalFat += meal.fat || 0;
          });
        }
      });
    });

    // Gemini API'ya gönderilecek prompt'u hazırla
    const prompt = `\
Aşağıdaki beslenme planını, bir diyetisyen gibi kullanıcıya doğrudan hitap ederek değerlendir. Cevabında "sen" zamirini kullan, önerilerini ve analizini sohbet eder gibi, samimi ve motive edici bir dille yaz. Maddeler halinde, Türkçe olarak açıkla.

- Günlük kalori ihtiyacın: ${dailyCalories} kcal
- Planın günlük ortalama değerleri:
  - Kalori: ${Math.round(totalCalories / 7)} kcal
  - Protein: ${Math.round(totalProtein / 7)}g
  - Karbonhidrat: ${Math.round(totalCarbs / 7)}g
  - Yağ: ${Math.round(totalFat / 7)}g

Sorular:
1. Bu plan günlük kalori ihtiyacını karşılıyor mu?
2. Makro besin dağılımı dengeli mi?
3. Planı daha sağlıklı hale getirmek için neler önerirsin?
4. Hangi besinleri ekleyebilir veya çıkarabilirsin?
`;

    // Yeni Gemini SDK ile analiz
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCdPuLcFaq-xcFDUwDzOMAWYwMMwIczk-o");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      analysis: text,
      macros: {
        dailyAverageCalories: Math.round(totalCalories / 7),
        dailyAverageProtein: Math.round(totalProtein / 7),
        dailyAverageCarbs: Math.round(totalCarbs / 7),
        dailyAverageFat: Math.round(totalFat / 7)
      }
    });
  } catch (error) {
    console.error('Plan analiz hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcının günlük kalori ihtiyacını güncelle
app.put('/api/users/:id/daily-calories', async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyCalories } = req.body;
    
    if (!dailyCalories || dailyCalories < 0) {
      return res.status(400).json({ success: false, message: 'Geçerli bir kalori değeri giriniz.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    user.dailyCalories = dailyCalories;
    await user.save();

    res.json({ success: true, message: 'Günlük kalori ihtiyacı güncellendi.', user });
  } catch (error) {
    console.error('Kalori güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcıyı ID ile getir
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcıya ait egzersiz planlarını getir
app.get('/api/exercise-plans', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId zorunludur.' });
    }
    const plans = await ExercisePlan.find({ userId });
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Egzersiz planlarını getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Yeni egzersiz planı oluştur
app.post('/api/exercise-plans', async (req, res) => {
  try {
    const { userId, title, days } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId zorunludur.' });
    }
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Plan başlığı zorunludur.' });
    }
    if (!days || typeof days !== 'object') {
      return res.status(400).json({ success: false, message: 'Geçerli bir plan yapısı gerekli.' });
    }
    // Planın boş olup olmadığını kontrol et
    const hasExercises = Object.values(days).some(day =>
      day.exercises && day.exercises.length > 0
    );
    if (!hasExercises) {
      return res.status(400).json({ success: false, message: 'Plan en az bir egzersiz içermelidir.' });
    }
    const plan = new ExercisePlan({ userId, title, days });
    await plan.save();
    res.status(201).json({ success: true, message: 'Plan başarıyla oluşturuldu.', plan });
  } catch (error) {
    console.error('Egzersiz planı oluşturma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Egzersiz planını güncelle
app.put('/api/exercise-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, days } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Plan başlığı zorunludur.' });
    }
    if (!days || typeof days !== 'object') {
      return res.status(400).json({ success: false, message: 'Geçerli bir plan yapısı gerekli.' });
    }
    const plan = await ExercisePlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
    }
    // Planın boş olup olmadığını kontrol et
    const hasExercises = Object.values(days).some(day =>
      day.exercises && day.exercises.length > 0
    );
    if (!hasExercises) {
      return res.status(400).json({ success: false, message: 'Plan en az bir egzersiz içermelidir.' });
    }
    plan.title = title;
    plan.days = days;
    plan.updatedAt = Date.now();
    await plan.save();
    res.json({ success: true, message: 'Plan başarıyla güncellendi.', plan });
  } catch (error) {
    console.error('Egzersiz planı güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Egzersiz planını sil
app.delete('/api/exercise-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ExercisePlan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
    }
    res.json({ success: true, message: 'Plan başarıyla silindi.' });
  } catch (error) {
    console.error('Egzersiz planı silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Egzersiz planını Gemini API ile analiz et
app.post('/api/exercise-plans/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ExercisePlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan bulunamadı.' });
    }
    // Toplam egzersiz, bölge, kas grubu, set, tekrar, süre gibi özetler hazırla
    let totalExercises = 0, totalSets = 0, totalReps = 0, totalDuration = 0;
    const bodyParts = new Set();
    const targets = new Set();
    Object.values(plan.days).forEach(day => {
      (day.exercises || []).forEach(ex => {
        totalExercises++;
        totalSets += ex.sets || 0;
        totalReps += ex.reps || 0;
        totalDuration += ex.duration || 0;
        if (ex.bodyPart) bodyParts.add(ex.bodyPart);
        if (ex.target) targets.add(ex.target);
      });
    });
    const prompt = `Aşağıda bir haftalık egzersiz planı var. Lütfen bir spor eğitmeni gibi kullanıcıya doğrudan hitap ederek, planı değerlendir. Eksik veya fazla olan noktaları, kas grubu ve bölge çeşitliliğini, toplam set/tekrar/süreyi ve genel yeterliliği analiz et. Eksik kas grubu veya bölge varsa öner, motivasyonel ve samimi bir dille yaz.\n\n- Toplam egzersiz: ${totalExercises}\n- Toplam set: ${totalSets}\n- Toplam tekrar: ${totalReps}\n- Toplam süre: ${totalDuration} dakika\n- Çalışılan bölgeler: ${Array.from(bodyParts).join(', ') || 'Yok'}\n- Hedef kas grupları: ${Array.from(targets).join(', ') || 'Yok'}\n\nSorular:\n1. Bu plan genel olarak yeterli mi?\n2. Hangi kas grupları/bölgeler eksik?\n3. Planı daha iyi ve dengeli yapmak için neler önerirsin?\n4. Hangi egzersizler eklenebilir veya çıkarılabilir?`;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCdPuLcFaq-xcFDUwDzOMAWYwMMwIczk-o");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({
      success: true,
      analysis: text,
      summary: {
        totalExercises,
        totalSets,
        totalReps,
        totalDuration,
        bodyParts: Array.from(bodyParts),
        targets: Array.from(targets)
      }
    });
  } catch (error) {
    console.error('Egzersiz planı analiz hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
});

// Günlük su ekle veya güncelle
app.post('/api/water-intake', async (req, res) => {
  try {
    const { userId, date, amount } = req.body;
    if (!userId || !date || !amount) return res.status(400).json({ success: false, message: 'Eksik parametre' });
    let water = await WaterIntake.findOne({ userId, date });
    const now = new Date();
    const time = now.toTimeString().slice(0,5);
    if (water) {
      water.amount += amount;
      water.logs.push({ time, amount });
      await water.save();
    } else {
      water = await WaterIntake.create({ userId, date, amount, logs: [{ time, amount }] });
    }
    res.json({ success: true, data: water });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: e.message });
  }
});

// Günlük su verisini getir
app.get('/api/water-intake', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId || !date) return res.status(400).json({ success: false, message: 'Eksik parametre' });
    const water = await WaterIntake.findOne({ userId, date });
    res.json({ success: true, data: water });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: e.message });
  }
});

// Geçmiş (son 7 gün)
app.get('/api/water-intake/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'Eksik parametre' });
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0,10);
      days.push(dateStr);
    }
    const history = await WaterIntake.find({ userId, date: { $in: days } });
    res.json({ success: true, data: history });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 