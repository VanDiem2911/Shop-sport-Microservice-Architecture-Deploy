import axiosClient from './axiosClient';

const paymentApi = {
  pay: (paymentData) => {
    return axiosClient.post('/payments', paymentData);
  }
};

export default paymentApi;
