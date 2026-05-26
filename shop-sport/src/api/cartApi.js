import axiosClient from './axiosClient';

const cartApi = {
  getCart: (username) => {
    return axiosClient.get(`/orders/cart?username=${username}`);
  },

  addToCart: (cartItem) => {
    return axiosClient.post('/orders/cart', cartItem);
  },

  removeFromCart: (username, productId, size) => {
    return axiosClient.delete(`/orders/cart?username=${username}&productId=${productId}&size=${size}`);
  },

  clearCart: (username) => {
    return axiosClient.delete(`/orders/cart/clear?username=${username}`);
  },

  syncCart: (username, localCart) => {
    return axiosClient.post(`/orders/cart/sync?username=${username}`, localCart);
  }
};

export default cartApi;
