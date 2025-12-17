import axiosInstance from './axiosConfig';

export const OrderService = {
  // 创建订单
  createOrder: async (orderData: any) => {
    return axiosInstance.post('/orders', orderData);
  },

  // 获取订单列表
  getOrders: async (params?: any) => {
    return axiosInstance.get('/orders', { params });
  },

  // 获取订单详情
  getOrder: async (id: number) => {
    return axiosInstance.get(`/orders/${id}`);
  },

  // 支付订单
  payOrder: async (id: number) => {
    return axiosInstance.put(`/orders/${id}/pay`);
  },

  // 取消订单
  cancelOrder: async (id: number) => {
    return axiosInstance.put(`/orders/${id}/cancel`);
  },

  // 更新订单状态（管理员）
  updateOrderStatus: async (id: number, status: string) => {
    return axiosInstance.put(`/orders/${id}/status`, { status });
  },

  // 获取订单统计（管理员）
  getOrderStats: async () => {
    return axiosInstance.get('/orders/stats');
  }
};