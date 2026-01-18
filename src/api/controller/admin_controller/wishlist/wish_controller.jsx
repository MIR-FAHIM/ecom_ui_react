import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API




export const getUserWish = async (id) => {



    try {
        const response = await axiosInstance.get(`/api/wishlists/list/${id}`,

        );
        return response.data;
    } catch (error) {
        console.error("Error fetching report-text:", error);
        return [];
    }
}
export const deleteWish = async (id) => {



    try {
        const response = await axiosInstance.delete(`/api/wishlists/delete/${id}`,

        );
        return response.data;
    } catch (error) {
        console.error("Error fetching report-text:", error);
        return [];
    }
}
export const addWish = async (data) => {



    try {
        const response = await axiosInstance.post(`/api/wishlists/add`, data,

        );
        return response.data;
    } catch (error) {
        console.error("Error fetching report-text:", error);
        return [];
    }
}
