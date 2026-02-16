import axios from 'axios';



const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
};

export const getStatusColor = (status: string): string => {
  switch (status?. toUpperCase()) {
    case 'RESOLVED': return 'bg-green-100 text-green-700';
    case 'IN_PROGRESS' : return 'bg-amber-100 text-amber-700';
    case 'REJECTED' : return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

export const getFileIcon = (fileType: string): string => {
  if (fileType?.includes('pdf')) return '📄';
  if (fileType?.includes('image')) return '🖼️';
  return '📎';
};

export const trackGrievance = async (reference: string)=> {
  const token = getAuthToken();

  const response = await axios.get(
    `${API_BASE_URL}/grievances/track.${reference.trim()}`,
    {
      headers: {'Authorization' : `Bearer ${token}`}
    }
  );

  return response.data;
};

export const downloadFile = async (fileId: number, fileName: string) => {
  const token = getAuthToken();

  const response = await axios.get(
    `${API_BASE_URL}/files/${fileId}/downlaod`,
    {
    headers: {'Authorization': `Bearer ${token}`},
    responseType: 'blob'
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link : = document.createElement('a');
  link.href = url;
  link.setAttribute('downlaod', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};