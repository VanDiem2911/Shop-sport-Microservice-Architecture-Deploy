import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProductList from './features/Catalog/ProductList';
import ProductDetail from './features/Catalog/ProductDetail';
import SearchResults from './features/Catalog/SearchResults';
import Login from './features/Auth/Login';
import Register from './features/Auth/Register';
import Profile from './features/Auth/Profile';
import CartPage from './features/Cart/CartPage'; // Import trang giỏ hàng
import { CartProvider } from './features/Cart/CartContext'; // ĐẢM BẢO ĐƯỜNG DẪN NÀY ĐÚNG
import CheckoutPage from './features/Checkout/CheckoutPage';
import OrderHistory from './features/Checkout/OrderHistory';
import Payment from './features/Checkout/Payment';
import MomoCallback from './features/Checkout/MomoCallback';
import MockMomoQr from './features/Checkout/MockMomoQr';
import ChatWidget from './components/AI/ChatWidget';
import LiveChatWidget from './components/Chat/LiveChatWidget';
import AdminRoute from './features/Admin/AdminRoute';
import ProductManager from './features/Admin/ProductManager';
import OrderManager from './features/Admin/OrderManager';
import ProductForm from './features/Admin/ProductForm';
import RevenueStats from './features/Admin/RevenueStats';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    // BƯỚC QUAN TRỌNG NHẤT: Bọc toàn bộ Router bằng CartProvider
    <CartProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <ScrollToTop />
        
        <div className="flex flex-col min-h-screen font-sans antialiased text-zinc-100 bg-transparent">
          <Header />
          
          <main className="flex-grow bg-transparent">
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Thêm Route cho giỏ hàng */}
              <Route path="/cart" element={<CartPage />} />
              
              {/* Thêm Route cho Order Service */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment/mock-qr" element={<MockMomoQr />} />
              <Route path="/payment/momo-callback" element={<MomoCallback />} />
              <Route path="/orders" element={<OrderHistory />} />

              {/* Admin Routes */}
              <Route path="/admin/products" element={
                <AdminRoute>
                  <ProductManager />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <OrderManager />
                </AdminRoute>
              } />
              <Route path="/admin/products/add" element={
                <AdminRoute>
                  <ProductForm />
                </AdminRoute>
              } />
              <Route path="/admin/products/edit/:id" element={
                <AdminRoute>
                  <ProductForm />
                </AdminRoute>
              } />
              <Route path="/admin/revenue" element={
                <AdminRoute>
                  <RevenueStats />
                </AdminRoute>
              } />
            </Routes>
          </main>

          <Footer />
          
          {/* AI Shopping Assistant Agent */}
          <ChatWidget />
          
          {/* Live Real-time Chat with Seller/Admin */}
          <LiveChatWidget />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;