import axiosInstance from './axiosConfig';

export const CartService = {
  // 获取购物车内容
  getCart: async () => {
    return axiosInstance.get('/cart');
  },

  // 添加商品到购物车
  addToCart: async (cartItem: { productId: number; quantity: number }) => {
    return axiosInstance.post('/cart', cartItem);
  },

  // 更新购物车商品数量
  updateCartItem: async (itemId: number, quantity: number) => {
    return axiosInstance.put(`/cart/items/${itemId}`, { quantity });
  },

  // 删除购物车商品
  removeFromCart: async (itemId: number) => {
    return axiosInstance.delete(`/cart/items/${itemId}`);
  },

  // 清空购物车
  clearCart: async () => {
    return axiosInstance.delete('/cart');
  }
};