import React from 'react';
import { useCart } from '../Cart/CartContext'; // Import cái này để dùng context giỏ hàng

import { useNavigate } from 'react-router-dom';

const CartSummary = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    // Tính tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 500000 ? 0 : 30000; // Free ship cho đơn trên 500k
    const total = subtotal + shipping;

    return (
        <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-24">
            <h3 className="text-2xl font-black italic uppercase mb-8 tracking-tighter">Hóa đơn</h3>
            
            <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-400 font-medium">
                    <span>Tạm tính</span>
                    <span className="text-white">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-400 font-medium">
                    <span>Phí vận chuyển</span>
                    <span className="text-white">{shipping === 0 ? "MIỄN PHÍ" : shipping.toLocaleString() + "đ"}</span>
                </div>
                <div className="border-t border-gray-800 pt-4 flex justify-between">
                    <span className="text-lg font-bold">TỔNG CỘNG</span>
                    <span className="text-2xl font-black text-blue-500">{total.toLocaleString()}đ</span>
                </div>
            </div>

            <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition duration-300 shadow-lg active:scale-95 transform">
                Thanh toán ngay
            </button>
            
            <p className="text-[10px] text-gray-500 mt-6 text-center font-medium uppercase tracking-widest">
                Đảm bảo bảo mật & thanh toán an toàn
            </p>
        </div>
    );
};

export default CartSummary;