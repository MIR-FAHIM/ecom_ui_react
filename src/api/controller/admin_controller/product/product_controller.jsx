import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getProduct = async () => {
  try {
    const response = await axiosInstance.get(`/api/products/list`,
       
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return [];
  }
}
export const getStock = async () => {
  try {
    const response = await axiosInstance.get(`/api/stock/list`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}

export const getProductWithVariants = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/product-variant/all/${id}`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProductWithVariants:", error);
    return [];
  }
}

export const getAllVarients = async () => {
  try {
    const response = await axiosInstance.get(`/api/product-variant/get-all-varients`,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product-variant/get-all-varients:", error);
    return [];
  }
}
export const addProduct = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/products/create`, data
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addProduct:", error);
    return [];
  }
}


export const addVariant = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/product-variant/add`, data,
        {
            headers: {
              // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
              'token': localStorage.getItem("authToken"), // Add the token in Authorization header
            },}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addProduct:", error);
    return [];
  }
}