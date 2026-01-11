// Product API Controller
import axiosInstance from '../axiosInstance.jsx';

// Create a new product
export const createProduct = async (productData) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post('/api/products/create', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    return { status: 'error', message: error.message };
  }
};

// Upload product images
export const uploadProductImages = async (productId, images) => {
  try {
    // images should be an array of FormData entries with image and is_primary
    const formData = new FormData();
    
    images.forEach((img, index) => {
      if (img.file) {
        formData.append(`images[${index}][image]`, img.file);
        formData.append(`images[${index}][is_primary]`, img.is_primary ? '1' : '0');
      }
    });

    const response = await axiosInstance.post(
      `/api/products/images/upload/${productId}`,
      formData,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading product images:', error);
    return { status: 'error', message: error.message };
  }
};

// Get all products (with pagination)
export const getAllProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/products/list', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return { status: 'error', data: [] };
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return { status: 'error', data: {} };
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`/api/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    return { status: 'error', message: error.message };
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    return { status: 'error', message: error.message };
  }
};
