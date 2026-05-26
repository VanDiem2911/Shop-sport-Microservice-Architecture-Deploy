import React, { useState, useEffect } from 'react';
import { useCart } from '../Cart/CartContext';
import { useNavigate } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import authApi from '../../api/authApi';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: localStorage.getItem('username') || '',
        phone: '',
        address: ''
    });

    const [loading, setLoading] = useState(false);

    // Kiểm tra đăng nhập và load dữ liệu người dùng
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        if (!token) {
            toast.error("Vui lòng đăng nhập để thanh toán!");
            navigate('/login');
        } else if (username) {
            // Lấy thông tin user (địa chỉ, số điện thoại đã lưu)
            const fetchUserInfo = async () => {
                try {
                    const res = await authApi.getUserInfo(username);
                    if (res.data) {
                        setFormData(prev => ({
                            ...prev,
                            phone: res.data.phone || prev.phone,
                            address: res.data.address || prev.address
                        }));
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin người dùng:", error);
                }
            };
            fetchUserInfo();
        }
    }, [navigate]);
    
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shipping;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống!");
            return;
        }

        try {
            setLoading(true);
            const username = localStorage.getItem('username');
            
            // Lưu địa chỉ và sđt mới nhất vào User Profile
            if (username) {
                try {
                    await authApi.updateUserInfo(username, {
                        address: formData.address,
                        phone: formData.phone
                    });
                } catch (err) {
                    console.error("Không thể lưu địa chỉ:", err);
                }
            }

            const orderPayload = {
                username: formData.fullName,
                phone: formData.phone,
                address: formData.address,
                totalAmount: total,
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    imageUrl: item.imageUrl
                }))
            };

            // Gọi Order Service
            const orderResponse = await orderApi.createOrder(orderPayload);
            const orderId = orderResponse.data?.id || Math.floor(Math.random() * 10000);

            // Xóa giỏ hàng sau khi đặt thành công
            clearCart();
            toast.success("Đặt hàng thành công!");

            // Chuyển tiếp tới trang thanh toán
            navigate('/payment', { 
                state: { 
                    orderId: orderId, 
                    totalAmount: total,
                    items: cartItems
                } 
            });
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            toast.error("Đã xảy ra lỗi khi tạo đơn hàng, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-6 max-w-5xl">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-center">Xác nhận thanh toán</h2>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-xl font-bold uppercase mb-6 flex items-center">
                            <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
                            Thông tin giao hàng
                        </h3>
                        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100 font-medium" placeholder="Ví dụ: Nguyễn Văn A" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100 font-medium" placeholder="0912345678" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng</label>
                                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100 font-medium" placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố"></textarea>
                            </div>
                        </form>
                    </div>

                    {/* Hóa đơn */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24">
                            <h3 className="text-2xl font-black italic uppercase mb-6 tracking-tighter">Tổng kết đơn hàng</h3>
                            
                            <div className="space-y-4 mb-6 text-sm">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-gray-300">
                                        <span className="truncate w-2/3">{item.quantity}x {item.name}</span>
                                        <span className="font-medium">{(item.price * item.quantity).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-800 mb-6" />

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-400 font-medium">
                                    <span>Tạm tính</span>
                                    <span className="text-white">{subtotal.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-400 font-medium">
                                    <span>Vận chuyển</span>
                                    <span className="text-white">{shipping === 0 ? "MIỄN PHÍ" : shipping.toLocaleString() + "đ"}</span>
                                </div>
                                <div className="border-t border-gray-800 pt-4 flex justify-between items-end">
                                    <span className="text-lg font-bold">CẦN THANH TOÁN</span>
                                    <span className="text-2xl font-black text-blue-500">{total.toLocaleString()}đ</span>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition duration-300 shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
