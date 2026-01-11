// src/api/apiController.js
import axiosInstance from '../axiosInstance.jsx'



// Fetch posts from API
export const getProfile = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/getProfile?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
   
};

// Get all customers
export const getAllCustomers = async () => {
  try {
    const response = await axiosInstance.get('/api/users/customers',);
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { status: 'error', data: [] };
  }
};

// Get single customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { status: 'error', data: {} };
  }
};

// Get all vendors/sellers
export const getAllVendors = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/users/vendors', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return { status: 'error', data: [] };
  }
};

// Get single vendor by ID
export const getVendorById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/users/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return { status: 'error', data: {} };
  }
};

