import axiosInstance from '../../axiosInstance.jsx'
import { companyID } from '../../config'

// Fetch posts from API

export const registerEmployee = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/register-employee`, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
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
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
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
    const response = await axiosInstance.post(`/api/login`, data,
      {
        headers: {
          'token': 'prefix_67e12b036e3f06.63889147', // Add the token in Authorization header
        },
      }
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
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error; // Rethrow the error for further handling in your component
  }   
}