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
export const getShippingCosts = async () => {
  try {
    const response = await axiosInstance.get(`/api/shipping-costs/get`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getShippingCosts:", error);
    return { status: 'error', data: [] };
  }
}
export const getDivisions = async () => {
  try {
    const response = await axiosInstance.get(`/api/locations/divisions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getShippingCosts:", error);
    return { status: 'error', data: [] };
  }
}
export const getDistricts = async (divisionId) => {
  try {
    const response = await axiosInstance.get(`/api/locations/districts/${divisionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getShippingCosts:", error);
    return { status: 'error', data: [] };
  }
}
export const setShippingCosts = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/shipping-costs/set`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching setShippingCosts:", error);
    return { status: 'error', data: [] };
  }
}