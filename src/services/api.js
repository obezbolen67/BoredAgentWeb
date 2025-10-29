import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Health check
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  // Upload files
  uploadFiles: async (formData, onUploadProgress) => {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Get all results (cache-busted)
  getResults: async () => {
    const response = await axios.get(`${API_BASE_URL}/results`, {
      params: { _ts: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },

  // Get specific result (cache-busted)
  getResult: async (stem) => {
    const response = await axios.get(`${API_BASE_URL}/result/${stem}`, {
      params: { _ts: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },

  // Get statistics (cache-busted)
  getStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/stats`, {
      params: { _ts: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },

  // Download PDF
  downloadPDF: (stem) => {
    return `${API_BASE_URL}/pdf/${stem}`;
  },

  // Clear all results
  clearResults: async () => {
    const response = await axios.post(`${API_BASE_URL}/clear`);
    return response.data;
  },
};

export default api;
