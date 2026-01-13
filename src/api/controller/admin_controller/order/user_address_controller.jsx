import axiosInstance from '../../../axiosInstance.jsx'



export const getUserAddresses = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/addresses/user/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching getUserAddresses:", error);
        return { status: 'error', data: [] };
    }
}


export const addUserAddress = async (data) => {
    try {
        const response = await axiosInstance.post(`/api/addresses/add`, data);
        return response; // Return the response from the API
    } catch (error) {
        console.error("Error posting data:", error);
        throw error; // Rethrow the error for further handling in your component
    }

}