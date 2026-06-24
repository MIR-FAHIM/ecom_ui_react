import axiosInstance from "../../axiosInstance.jsx";

export const getProductCreateErrorLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/error-logs/product-create", {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching product create error logs:", error);
    return { status: "error", message: error.message, data: null };
  }
};
