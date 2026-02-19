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
export const getProductImages = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/products/images/${id}`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProductImages:", error);
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
export const deleteProductImage = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/products/images/delete/${id}`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product image:", error);
    return [];
  }
}