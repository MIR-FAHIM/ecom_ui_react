import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API
export const getProductVa = async () => {
  try {
    const response = await axiosInstance.get(`/api/products/list`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return [];
  }
}