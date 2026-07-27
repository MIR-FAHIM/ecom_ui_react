import axiosInstance from '../../../axiosInstance.jsx'



export const getCategoryWithAllChildren = async () => {
  try {
    const response = await axiosInstance.get(`/api/categories/with-children`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getCategoryWithAllChildren:", error);
    return { status: 'error', data: [] };
  }
}

export const createCategory = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/categories/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}
export const getCategoryChildren = async () => {
  try {
    const response = await axiosInstance.get(`/api/categories/children`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getCategoryChildren:", error);
    return { status: 'error', data: [] };
  }
}
export const getCategoryInfo = async (category_id = 0) => {
  try {
    const response = await axiosInstance.get(`/api/categories/category/info?category_id=${category_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getCategoryInfo:", error);
    return { status: 'error', data: [] };
  }
}
