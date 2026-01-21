import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getProductCategory = async () => {
  try {
    const response = await axiosInstance.get(`/api/categories/list`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return [];
  }
}
export const getProductCategoryDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/categories/details/${id}`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProductCategoryDetails:", error);
    return [];
  }
}
export const getCategoryChildren = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/categories/children/${id}`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getCategoryChildren:", error);
    return [];
  }
}