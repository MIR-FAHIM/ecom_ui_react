import axiosInstance from '../../../axiosInstance.jsx';

export const addShop = async (data) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post('/api/shops/create', 
      data,
     
    );
    return response.data;
  } catch (error) {
    console.error('Error creating addShop:', error);
    return { status: 'error', message: error.message };
  }
};
export const getShopProduct = async (id, params = {}) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.get(`/api/shops/products/${id}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting shop products:', error);
    return { status: 'error', message: error.message };
  }
};
export const getShopDetails = async (id, params = {}) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.get(`/api/shops/details/${id}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting shop details:', error);
    return { status: 'error', message: error.message };
  }
};
export const getAllShops = async (params = {}) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.get(`/api/shops/list`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting shop getAllShops:', error);
    return { status: 'error', message: error.message };
  }
};
export const updateShop = async (id, data) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post(`/api/shops/update/${id}`, data,); 
    return response.data;
  } catch (error) {
    console.error('Error updating shop updateShop:', error);
    return { status: 'error', message: error.message };
  }
};