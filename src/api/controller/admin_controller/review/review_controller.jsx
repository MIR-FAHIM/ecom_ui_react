
import axiosInstance from '../../../axiosInstance.jsx'


export const addReview = async (data) => {
    try {
      const response = await axiosInstance.post(`/api/reviews/add`, data,
        { headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
      );
      return response; // Return the response from the API
    } catch (error) {
      console.error("Error addReview data:", error);
      throw error; // Rethrow the error for further handling in your component
    }
  
  }

export const getProductReviews = async () => {
  try {
    const response = await axiosInstance.get(`/api/reviews/list`,
        {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
            },
        }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProductReviews:", error);
    return [];
  }
}