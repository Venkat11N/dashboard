import { supabase } from "../lib/supabase";

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('grievance_categories')
    .select('id, name')
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
};

export const getSubcategories = async (categoryId: number): Promise<Subcategory[]> => {
  const { data, error } = await supabase
    .from('grievance_subcategories')
    .select('id, category_id, name')
    .eq('category_id', categoryId) // Fixed: changed category_id to categoryId to match parameter
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
  return data || [];
};