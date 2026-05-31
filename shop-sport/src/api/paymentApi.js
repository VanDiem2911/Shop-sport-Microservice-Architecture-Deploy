import axiosClient from './axiosClient';

const paymentApi = {
  pay: (paymentData) => {
    return axiosClient.post('/payments', paymentData);
  },
  verifyMomo: (callbackParams) => {
    return axiosClient.post('/payments/momo-callback', callbackParams);
  },
  getPaymentByOrderId: (orderId) => {
    return axiosClient.get(`/payments/order/${orderId}`);
  }
};

export default paymentApi;
