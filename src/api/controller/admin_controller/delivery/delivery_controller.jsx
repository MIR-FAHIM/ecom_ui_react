import axiosInstance from '../../../axiosInstance.jsx'



export const getAllDeliveries = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/deliveries/all/${id}`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllDeliveries:", error);
    return { status: 'error', data: [] };
  }
}
export const getAssignedDeliveries = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/deliveries/assigned/${id}`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching getAssignedDeliveries:", error);
    return { status: 'error', data: [] };
  }
}
export const getCompletedDeliveries = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/deliveries/completed/${id}`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching getCompletedDeliveries:", error);
    return { status: 'error', data: [] };
  }
}