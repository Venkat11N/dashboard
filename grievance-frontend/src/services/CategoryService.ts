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



export const getAllCategories = async (): Promise<any[]> => {
  try {

    const token = localStorage.getItem('accessToken'); 

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',

        'Authorization': `Bearer ${token}` 
      }
    });


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