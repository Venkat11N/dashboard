import { API_BASE_URL } from "../config/api.ts"; 
export async function getGrievanceCounts() {
  try {

    const token = localStorage.getItem('accessToken');


    const response = await fetch(`${API_BASE_URL}/my-grievances`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.status !== 'ok') {
      throw new Error(result.message || 'Failed to fetch data');
    }

    const grievances = result.data;


    return {
      total: result.count || 0,
      pending: grievances.filter((g: any) => g.status === 'SUBMITTED').length,
      resolved: grievances.filter((g: any) => g.status === 'RESOLVED').length,
      escalated: grievances.filter((g: any) => g.status === 'IN_PROGRESS').length,
    };
  } catch (error) {
    console.error("Error getting grievance counts:", error);
    return {
      total: 0,
      pending: 0,
      resolved: 0,
      escalated: 0,
    };
  }
}