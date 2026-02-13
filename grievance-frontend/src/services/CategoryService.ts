import { API_BASE_URL } from "../config/api"; 

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}

/**
 * Fetches all grievance categories with required Bearer Token
 */


export const getAllCategories = async (): Promise<any[]> => {
  try {
    // FIX: Change 'authToken' to 'accessToken' to match your login storage
    const token = localStorage.getItem('accessToken'); 

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Send the token. Without this, you get the 401 error.
        'Authorization': `Bearer ${token}` 
      }
    });

    // If the response is 401, the token is likely expired or missing
    if (response.status === 401) {
      console.error("Unauthorized: Please log in again.");
      return [];
    }

    const result = await response.json();
    if (result.status === 'ok') return result.data || [];
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

/**
 * Fetches subcategories for a specific category ID
 */
export const getSubcategories = async (categoryId: number): Promise<Subcategory[]> => {
  try {
    const token = localStorage.getItem('accessToken'); 

    const response = await fetch(`${API_BASE_URL}/subcategories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    const result = await response.json();

    if (result.status === 'ok') {
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
};