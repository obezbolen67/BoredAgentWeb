import axios from 'axios';

// Determine API base URL for different environments
// Priority:
// 1) REACT_APP_API_URL (explicit override at build time)
// 2) Same-origin "/api" (works with CRA proxy in dev and with reverse proxy in prod)
// 3) Fallback to "/api"
const resolveBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/api`;
  }
  return '/api';
};

const API_BASE_URL = resolveBaseUrl();

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

  // Get image URL
  getImageUrl: (filename) => `${API_BASE_URL}/image/${filename}`,

  // Get bulk download ZIP URL
  getDownloadAllUrl: () => `${API_BASE_URL}/download-all`,

  // Clear all results
  clearResults: async () => {
    const response = await axios.post(`${API_BASE_URL}/clear`);
    return response.data;
  },
};

export default api;
