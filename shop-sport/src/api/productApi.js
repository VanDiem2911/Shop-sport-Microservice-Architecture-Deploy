import axiosClient from './axiosClient';

const productApi = {
  // Lấy tất cả sản phẩm
  getAll() {
    return axiosClient.get('/products');
  },
  // Lấy chi tiết sản phẩm
  getById(id) {
    return axiosClient.get(`/products/${id}`);
  },
  // Lấy sản phẩm theo danh mục
  getByCategory(categoryName) {
    return axiosClient.get(`/products/category?name=${categoryName}`);
  },
  // Thêm mới sản phẩm
  create(data) {
    return axiosClient.post('/products', data);
  },
  // Cập nhật sản phẩm
  update(id, data) {
    return axiosClient.put(`/products/${id}`, data);
  },
  // Cập nhật tồn kho nhanh
  updateStock(id, stock) {
    return axiosClient.put(`/products/${id}/stock?stock=${stock}`);
  },
  // Xóa sản phẩm
  remove(id) {
    return axiosClient.delete(`/products/${id}`);
  }
};

export default productApi;