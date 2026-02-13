

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type Grievance = {
  id: number;
  reference_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category_name?: string;
  subcategory_name?: string;
  created_at: string;
  updated_at?: string;
};

// Get auth token
const getAuthToken = (): string | null => {
  const possibleKeys = [
    'token',
    'accessToken', 
    'access_token',
    'authToken',
    'auth_token',
    'jwt',
    'jwtToken'
  ];
  
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }
  
  for (const key of possibleKeys) {
    const token = sessionStorage.getItem(key);
    if (token) {
      return token;
    }
  }
  
  return null;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ✅ FIXED: Get my grievances
export async function getMyGrievances(limit?: number): Promise<Grievance[]> {
  try {
    const timestamp = Date.now();
    const response = await apiClient.get(`/my-grievances?limit=${limit || 10}&_t=${timestamp}`);
    
    console.log('Grievances response:', response.data);
    
    if (response.data.status === 'ok' && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching grievances:', error.message);
    return [];
  }
}

// Get single grievance
export async function getGrievanceById(id: number): Promise<Grievance | null> {
  try {
    const response = await apiClient.get(`/grievances/${id}`);
    
    if (response.data.status === 'ok') {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching grievance:', error.message);
    return null;
  }
}

// Submit grievance
export async function submitGrievance(data: any): Promise<{ success: boolean; reference_number?: string; message?: string }> {
  try {
    const response = await apiClient.post('/grievances', data);
    
    if (response.data.status === 'ok') {
      window.dispatchEvent(new Event('grievanceSubmitted'));
      
      return {
        success: true,
        reference_number: response.data.data.reference_number
      };
    }
    
    return { success: false, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to submit' };
  }
}