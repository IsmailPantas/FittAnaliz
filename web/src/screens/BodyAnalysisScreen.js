import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import axios from 'axios';

function BodyAnalysisScreen() {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  // Python analizi için state'ler
  const [pythonLoading, setPythonLoading] = useState(false);
  const [pythonError, setPythonError] = useState('');
  const [pythonResult, setPythonResult] = useState(null);

  // Kamera ve görüntü işleme için state'ler
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraAnalysisResult, setCameraAnalysisResult] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const calculateBMI = (weight, height) => {
    const heightM = height / 100;
    return Number((weight / (heightM ** 2)).toFixed(2));
  };

  const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    }
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  };

  const calculateDailyCalories = (bmr, activityLevel) => {
    const activityMultipliers = {
      'sedentary': 1.2,      // Hareketsiz
      'light': 1.375,        // Hafif aktif
      'moderate': 1.55,      // Orta aktif
      'very': 1.725,         // Çok aktif
      'extra': 1.9           // Ekstra aktif
    };
    return Math.round(bmr * activityMultipliers[activityLevel]);
  };

  const calculateBodyFatPercentage = (bmi, age, gender) => {
    if (gender === 'male') {
      return Number(((1.20 * bmi) + (0.23 * age) - 16.2).toFixed(2));
    }
    return Number(((1.20 * bmi) + (0.23 * age) - 5.4).toFixed(2));
  };

  const calculateIdealWeight = (height, gender) => {
    let idealWeight;
    if (gender === 'male') {
      idealWeight = 50 + 2.3 * ((height / 2.54) - 60);
    } else {
      idealWeight = 45.5 + 2.3 * ((height / 2.54) - 60);
    }
    return Number((idealWeight * 0.45359237).toFixed(2)); // Convert to kg
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { height, weight, age, gender, activityLevel } = formData;

      // Hesaplamaları yap
      const bmi = calculateBMI(Number(weight), Number(height));
      const bmr = calculateBMR(Number(weight), Number(height), Number(age), gender);
      const dailyCalories = calculateDailyCalories(bmr, activityLevel);
      const bodyFatPercentage = calculateBodyFatPercentage(bmi, Number(age), gender);
      const idealWeight = calculateIdealWeight(Number(height), gender);

      setResult({
        bmi,
        bmr,
        dailyCalories,
        bodyFatPercentage,
        idealWeight
      });
    } catch (err) {
      setError('Hesaplama yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePythonSubmit = async (e) => {
    e.preventDefault();
    setPythonLoading(true);
    setPythonError('');
    setPythonResult(null);

    try {
      const response = await axios.post('http://localhost:3001/api/body-analysis/analyze', formData);
      if (response.data.success) {
        setPythonResult(response.data.data);
      } else {
        setPythonError(response.data.message);
      }
    } catch (err) {
      setPythonError(err.response?.data?.message || 'Python analizi sırasında bir hata oluştu');
    } finally {
      setPythonLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setCameraError('Kamera erişimi sağlanamadı');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Canvas boyutlarını video boyutlarına ayarla
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Video karesini canvas'a çiz
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Canvas'ı base64 formatına çevir
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setCameraLoading(true);
    setCameraError('');
    setCameraAnalysisResult(null);

    try {
      // Base64 görüntüyü backend'e gönder
      const response = await axios.post('http://localhost:3001/api/body-analysis/analyze-image', {
        image: capturedImage,
        gender: formData.gender
      });

      if (response.data.success) {
        setCameraAnalysisResult(response.data.data);
      } else {
        setCameraError(response.data.message);
      }
    } catch (err) {
      setCameraError('Görüntü analizi sırasında bir hata oluştu');
    } finally {
      setCameraLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vücut Analizi
        </Typography>

        {/* Kamera Analizi Bölümü */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Kamera ile Vücut Analizi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Kamera ile çekilen görüntü üzerinde kullanarak vücut analizi yapın.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: 'black' }}>
                {!cameraActive && !capturedImage && (
                  <Button
                    variant="contained"
                    onClick={startCamera}
                    sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    Kamerayı Başlat
                  </Button>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', display: cameraActive ? 'block' : 'none' }}
                />
                
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>

              {cameraActive && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={captureImage}
                  sx={{ mt: 2 }}
                >
                  Fotoğraf Çek
                </Button>
              )}

              {capturedImage && (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={analyzeImage}
                  disabled={cameraLoading}
                  sx={{ mt: 2 }}
                >
                  {cameraLoading ? <CircularProgress size={24} /> : 'Görüntüyü Analiz Et'}
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {cameraError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {cameraError}
                </Alert>
              )}

              {cameraAnalysisResult && (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Kamera Analiz Sonuçları
                  </Typography>
                  <Typography>Vücut Yağ Oranı: {cameraAnalysisResult['Vücut Yağ Oranı (%)']}%</Typography>
                  <Typography>Bel-Kalça Oranı: {cameraAnalysisResult['Bel-Kalça Oranı (WHR)']}</Typography>
                  <Typography>Omuz Genişliği: {cameraAnalysisResult['Omuz Genişliği (px)']} px</Typography>
                  <Typography>Kalça Genişliği: {cameraAnalysisResult['Kalça Genişliği (px)']} px</Typography>
                  <Typography>Boy Uzunluğu: {cameraAnalysisResult['Boy Uzunluğu (px)']} px</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* JavaScript Hesaplama Bölümü */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Kendi Hesaplamalarınızı Yapın
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Boy (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Kilo (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Yaş"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Cinsiyet</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="male">Erkek</MenuItem>
                <MenuItem value="female">Kadın</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Aktivite Seviyesi</InputLabel>
              <Select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                required
              >
                <MenuItem value="sedentary">Hareketsiz</MenuItem>
                <MenuItem value="light">Hafif Aktif</MenuItem>
                <MenuItem value="moderate">Orta Aktif</MenuItem>
                <MenuItem value="very">Çok Aktif</MenuItem>
                <MenuItem value="extra">Ekstra Aktif</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Analiz Et'}
            </Button>
          </form>

          {result && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                JavaScript Analiz Sonuçları
              </Typography>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography>BMI: {result.bmi}</Typography>
                <Typography>BMR: {result.bmr}</Typography>
                <Typography>Günlük Kalori İhtiyacı: {result.dailyCalories}</Typography>
                <Typography>Vücut Yağ Oranı: {result.bodyFatPercentage}%</Typography>
                <Typography>İdeal Kilo: {result.idealWeight} kg</Typography>
              </Paper>
            </Box>
          )}
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Python Hesaplama Bölümü */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Python ile Hesaplama
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bu bölüm, P:\kodlar\FitAnaliz\backend\python\body_analysis.py dosyasındaki Python kodunu kullanarak hesaplama yapar.
          </Typography>
          
          <form onSubmit={handlePythonSubmit}>
            <TextField
              fullWidth
              label="Boy (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Kilo (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Yaş"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Cinsiyet</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="male">Erkek</MenuItem>
                <MenuItem value="female">Kadın</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Aktivite Seviyesi</InputLabel>
              <Select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                required
              >
                <MenuItem value="sedentary">Hareketsiz</MenuItem>
                <MenuItem value="light">Hafif Aktif</MenuItem>
                <MenuItem value="moderate">Orta Aktif</MenuItem>
                <MenuItem value="very">Çok Aktif</MenuItem>
                <MenuItem value="extra">Ekstra Aktif</MenuItem>
              </Select>
            </FormControl>

            {pythonError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {pythonError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={pythonLoading}
            >
              {pythonLoading ? <CircularProgress size={24} /> : 'Python ile Analiz Et'}
            </Button>
          </form>

          {pythonResult && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Python Analiz Sonuçları
              </Typography>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography>BMI: {pythonResult.bmi}</Typography>
                <Typography>BMR: {pythonResult.bmr}</Typography>
                <Typography>Günlük Kalori İhtiyacı: {pythonResult.dailyCalories}</Typography>
                <Typography>Vücut Yağ Oranı: {pythonResult.bodyFatPercentage}%</Typography>
                <Typography>İdeal Kilo: {pythonResult.idealWeight} kg</Typography>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default BodyAnalysisScreen;