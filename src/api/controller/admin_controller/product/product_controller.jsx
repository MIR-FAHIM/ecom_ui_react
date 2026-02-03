import axiosInstance from '../../../axiosInstance.jsx'

// Fetch posts from API
export const getProduct = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/products/list`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    // Return API payload (status/message/data) so callers can inspect response.status and response.data
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return { status: 'error', message: error.message, data: null };
  }
};

export const getCategoryWiseProduct = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/products/category/wise`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    // Return API payload (status/message/data) so callers can inspect response.status and response.data
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return { status: 'error', message: error.message, data: null };
  }
};


export const getFeaturedProduct = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/products/list/featured?featured=1`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    // Return API payload (status/message/data) so callers can inspect response.status and response.data
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return { status: 'error', message: error.message, data: null };
  }
};

export const getTodayDealProduct = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/api/products/list/today-deal?todays_deal=1`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    // Return API payload (status/message/data) so callers can inspect response.status and response.data
    return response.data;
  } catch (error) {
    console.error("Error fetching getProduct:", error);
    return { status: 'error', message: error.message, data: null };
  }
};



export const getProductDetails = async (id) => {

  try {
    const response = await axiosInstance.get(`/api/products/details/${id}`,
      // {
      //   headers: {
      //     // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
      //     'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      //   },
      // }
    );


    return response.data;


  } catch (error) {


    console.error("Error fetching getProductDetails:", error);



  }
}
export const getProductReviews = async (id) => {

  try {
    const response = await axiosInstance.get(`/api/reviews/product/${id}`,
      // {
      //   headers: {
      //     // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
      //     'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      //   },
      // }
    );


    return response.data;


  } catch (error) {


    console.error("Error fetching getProductReviews:", error);



  }
}


export const getStock = async () => {
  try {
    const response = await axiosInstance.get(`/api/stock/list`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header   
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getStock:", error);
    return [];
  }
}

export const getProductWithVariants = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/product-variant/all/${id}`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getProductWithVariants:", error);
    return [];
  }
}
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
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading product images:', error);
    return { status: 'error', message: error.message };
  }
};
export const getAllVarients = async () => {
  try {
    const response = await axiosInstance.get(`/api/product-variant/get-all-varients`,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product-variant/get-all-varients:", error);
    return [];
  }
}
export const createProduct = async (productData) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post('/api/products/create', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    return { status: 'error', message: error.message };
  }
};

export const updateProduct = async (id,productData) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post(`/api/products/update/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    return { status: 'error', message: error.message };
  }
};


export const addProdductDiscount = async (data) => {
  try {
    // productData should contain: shop_id, category_id, brand_id, name, slug, sku, short_description, description
    const response = await axiosInstance.post('/api/product-discounts/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating addProdductDiscount:', error);
    return { status: 'error', message: error.message };
  }
};


export const addProductAttribute = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/product-attributes/create`, data,
      {
        headers: {
          // 'token': localStorage.getItem("authToken"), // Add the token in Authorization header
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`, // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching addAttribute:", error);
    return [];
  }
}