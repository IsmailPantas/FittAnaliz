import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const bodyAnalysisService = {
  analyzeBody: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/body-analysis/analyze`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Bir hata oluştu' };
    }
  }
}; 