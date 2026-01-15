import axiosInstance from '../../axiosInstance.jsx'
import { companyID } from '../../config'

// Fetch posts from API

export const registerEmployee = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/users/create`, data,


    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add Department data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const uploadProfileImage = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/upload-user-image`, data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error upload Image data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const loginController = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/auth/login`, data,

    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error login data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const getAllCustomers = async () => {
  try {
    const response = await axiosInstance.get(`/api/users/customers`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error; // Rethrow the error for further handling in your component
  }
}

export const getAllVendors = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/users/vendors', { 
      params: params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
     });
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return { status: 'error', data: [] };
  }
};
export const getAllShops = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/shops/list', { 
      params: params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
     });
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllShops:", error);
    return { status: 'error', data: [] };
  }
};
export const getUserDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/users/details/${id}`, { 
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
     });
    return response.data;
  } catch (error) {
    console.error("Error fetching getUserDetail:", error);
    return { status: 'error', data: [] };
  }
};