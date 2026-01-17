import axiosInstance from '../../axiosInstance.jsx'

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