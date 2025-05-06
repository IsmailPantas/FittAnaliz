import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek interceptor'ı
api.interceptors.request.use(
  (config) => {
    console.log('API İsteği:', config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
api.interceptors.response.use(
  (response) => {
    console.log('API Yanıtı:', response.data);
    return response;
  },
  (error) => {
    console.error('API Yanıt Hatası:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login Hatası:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const bodyAnalysisService = {
  getAnalysis: async (userId) => {
    try {
      const response = await api.get(`/body-analysis/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Vücut Analizi Getirme Hatası:', error);
      throw error;
    }
  },

  saveAnalysis: async (userId, data) => {
    try {
      const response = await api.post(`/body-analysis/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Vücut Analizi Kaydetme Hatası:', error);
      throw error;
    }
  },
};

export default api; 