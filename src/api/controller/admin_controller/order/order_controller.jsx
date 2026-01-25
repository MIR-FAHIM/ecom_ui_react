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
export const assignDeliveryBoy = async (data) => {
  try {
    const payload = data instanceof FormData ? data : (() => {
      const fd = new FormData();
      if (data?.delivery_man_id != null) fd.append("delivery_man_id", data.delivery_man_id);
      if (data?.order_id != null) fd.append("order_id", data.order_id);
      if (data?.note != null) fd.append("note", data.note);
      return fd;
    })();

    const response = await axiosInstance.post(`/api/deliveries/assign`, payload, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error assignDeliveryBoy data:", error);
    throw error;
  }
}

export const unassignDeliveryBoy = async (data) => {
  try {
    const payload = data instanceof FormData ? data : (() => {
      const fd = new FormData();
      if (data?.order_id != null) fd.append("order_id", data.order_id);
      return fd;
    })();

    const response = await axiosInstance.post(`/api/deliveries/unassign`, payload, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error unassignDeliveryBoy data:", error);
    throw error;
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

export const getUserOrder = async (id, params = {}) => {
  try {
    // Backend endpoint: /api/orders/list/{userId} or similar; using /api/orders/list/{id}
    const response = await axiosInstance.get(`/api/orders/list/${id}`, {
      params: params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { status: 'error', data: null };
  }
};


