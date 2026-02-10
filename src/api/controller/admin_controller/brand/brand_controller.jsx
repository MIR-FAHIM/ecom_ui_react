import axiosInstance from '../../../axiosInstance.jsx'



export const getBrand = async () => {
  try {
    const response = await axiosInstance.get(`/api/brands/list`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getBrand:", error);
    return { status: 'error', data: [] };
  }
}
