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
 * Fetches all grievance categories from the MySQL backend
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.status === 'ok') {
      return result.data || [];
    }
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
    const response = await fetch(`${API_BASE_URL}/subcategories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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