import axiosClient from './axiosClient';

const orderApi = {
  createOrder: (orderData) => {
    return axiosClient.post('/orders', orderData);
  },

  getMyOrders: () => {
    const user = localStorage.getItem('username');
    return axiosClient.get(`/orders/my-orders?username=${user}`);
  },

  getAllOrders: () => {
    return axiosClient.get('/orders/my-orders');
  },

  updateOrderStatus: (id, status) => {
    return axiosClient.put(`/orders/${id}/status?status=${status}`);
  }
};

export default orderApi;