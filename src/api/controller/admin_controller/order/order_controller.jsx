import axiosInstance from '../../../axiosInstance.jsx'

// Fetch all orders with pagination
export const getOrder = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/orders/list', {
       params : params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
      },
       });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { status: 'error', data: [] };
  }
}
export const getCompletedOrder = async (params = {}) => {
  console.log("Token from localStorage:", localStorage.getItem("authToken"));

  try {
    const response = await axiosInstance.get('/api/orders/completed', {

      params: params,

      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
      },
    }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { status: 'error', data: [] };
  }
}
export const getAllOrder = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/orders/all/orders', {
       params : params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
      },
      });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { status: 'error', data: [] };
  }
}

// Get order details by ID
export const getOrderDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/orders/details/${id}`,

      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return { status: 'error', data: {} };
  }
}

// Update order status (PATCH endpoint)
export const updateOrderStatusPatch = async (id, status) => {
  try {
    const formData = new FormData();
    formData.append('status', status);

    const response = await axiosInstance.patch(
      `/api/orders/status/${id}?status=${status}`,

      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    return { status: 'error', message: error.message };
  }
}
export const checkOutOrder = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/orders/checkout`, data,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error checkOutOrder data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
// Update order status (PUT endpoint - fallback)
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(`/api/orders/${id}/status`, {
      params: status,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    return { status: 'error', message: error.message };
  }
}

// Delete order
export const deleteOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/orders/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    return { status: 'error', message: error.message };
  }
}
