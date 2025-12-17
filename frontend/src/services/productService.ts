import axiosInstance from './axiosConfig';

const ProductService = {
  // 获取商品列表
  getProducts: async (params?: any) => {
    return axiosInstance.get('/products', { params });
  },

  // 获取商品详情
  getProduct: async (id: number) => {
    return axiosInstance.get(`/products/${id}`);
  },

  // 获取商品分类列表
  getCategories: async () => {
    return axiosInstance.get('/products/categories');
  },

  // 添加商品（管理员）
  addProduct: async (productData: any) => {
    return axiosInstance.post('/products', productData);
  },

  // 更新商品（管理员）
  updateProduct: async (id: number, productData: any) => {
    return axiosInstance.put(`/products/${id}`, productData);
  },

  // 删除商品（管理员）
  deleteProduct: async (id: number) => {
    return axiosInstance.delete(`/products/${id}`);
  },

  // 上传商品图片（管理员）
  uploadProductImage: async (id: number, formData: FormData) => {
    return axiosInstance.post(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 设置主要商品图片（管理员）
  setPrimaryImage: async (productId: number, imageId: number) => {
    return axiosInstance.put(`/products/${productId}/images/${imageId}/primary`);
  },

  // 删除商品图片（管理员）
  deleteProductImage: async (productId: number, imageId: number) => {
    return axiosInstance.delete(`/products/${productId}/images/${imageId}`);
  },

  // 添加商品分类（管理员）
  addCategory: async (categoryData: any) => {
    return axiosInstance.post('/products/categories', categoryData);
  },

  // 更新商品分类（管理员）
  updateCategory: async (id: number, categoryData: any) => {
    return axiosInstance.put(`/products/categories/${id}`, categoryData);
  },

  // 删除商品分类（管理员）
  deleteCategory: async (id: number) => {
    return axiosInstance.delete(`/products/categories/${id}`);
  }
};

export const {
  getProducts,
  getProduct,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  setPrimaryImage,
  deleteProductImage,
  addCategory,
  updateCategory,
  deleteCategory
} = ProductService;