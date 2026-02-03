import axiosInstance from '../../../axiosInstance.jsx'



export const getWebsiteLogo = async () => {
  try {
    const response = await axiosInstance.get(`/api/website-settings/logo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getWebsiteLogo:", error);
    return { status: 'error', data: [] };
  }
}

export const getWebsiteSetting = async () => {
  try {
    const response = await axiosInstance.get(`/api/website-settings/website`);
    return response.data;
  } catch (error) {
    console.error("Error fetching getWebsiteLogo:", error);
    return { status: 'error', data: [] };
  }
}




export const addWebsiteLogo = async (data) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post('/api/website-settings/logo', 
      data,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
          // 'Content-Type': 'multipart/form-data', // If you're sending FormData
        },
      }  
    );
    return response.data;
  } catch (error) {
    console.error('Error creating addWebsiteLogo:', error);
    return { status: 'error', message: error.message };
  }
};
export const addWebsite = async (data) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post('/api/website-settings/add', 
      data,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
          // 'Content-Type': 'multipart/form-data', // If you're sending FormData
        },
      }  
    );
    return response.data;
  } catch (error) {
    console.error('Error creating addWebsite:', error);
    return { status: 'error', message: error.message };
  }
};