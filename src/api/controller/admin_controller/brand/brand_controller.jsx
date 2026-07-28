import axiosInstance from '../../../axiosInstance.jsx'



export const getBrand = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/brands/list`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching getBrand:", error);
    return { status: 'error', data: [] };
  }
}

export const createBrand = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/brands/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating brand:", error);
    throw error;
  }
}

export const getBrandDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/brands/details/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching brand details:", error);
    throw error;
  }
}

export const updateBrand = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/brands/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
}

export const deleteBrand = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/brands/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
}
