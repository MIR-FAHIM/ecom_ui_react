import axiosInstance from '../../../axiosInstance.jsx'



export const getUserAddresses = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/addresses/user/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching getUserAddresses:", error);
        return { status: 'error', data: [] };
    }
}


export const addUserAddress = async (data) => {
    try {
        const response = await axiosInstance.post(`/api/addresses/add`, data,
            { headers: {
                'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
            },
        }
        );
        return response; // Return the response from the API
    } catch (error) {
        console.error("Error posting data:", error);
        throw error; // Rethrow the error for further handling in your component
    }

}