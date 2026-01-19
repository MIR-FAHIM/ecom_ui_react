import axiosInstance from '../../../axiosInstance.jsx'


export const addMedia = async (data) => {
    try {
      // expect FormData for file upload
      const response = await axiosInstance.post(`/api/uploads/image`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error posting data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }

export const getAllMedia = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/uploads/list`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching getBanner:", error);
    return [];
  }
}