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