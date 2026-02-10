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
