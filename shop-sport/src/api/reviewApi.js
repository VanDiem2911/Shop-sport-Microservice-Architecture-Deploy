import axiosClient from './axiosClient';

const reviewApi = {
  addReview: (productId, reviewData) => {
    return axiosClient.post(`/reviews/${productId}`, reviewData);
  },
  getReviewsByProduct: (productId) => {
    return axiosClient.get(`/reviews/product/${productId}`);
  }
};

export default reviewApi;
