import axiosClient from './axiosClient';

const paymentApi = {
  pay: (paymentData) => {
    return axiosClient.post('/payments', paymentData);
  },
  verifyMomo: (callbackParams) => {
    return axiosClient.post('/payments/momo-callback', callbackParams);
  }
};

export default paymentApi;
