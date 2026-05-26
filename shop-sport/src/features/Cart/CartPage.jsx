import React from 'react';
import { useCart } from './CartContext'; // Đảm bảo đường dẫn này đúng với file Context của bạn
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { cartItems } = useCart();

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-6 py-16">
                {/* Tiêu đề trang */}
                <div className="mb-12">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">
                         <span className="text-blue-600"> Giỏ hàng của bạn</span>
                    </h2>
                    <p className="text-gray-400 font-medium mt-2 uppercase tracking-widest text-xs">
                        {cartItems.length} Sản phẩm trong túi đồ
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    /* Giao diện khi giỏ hàng trống */
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="mb-6 flex justify-center">
                            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống!</h3>
                        <Link to="/" className="inline-block bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-blue-600 transition shadow-lg">
                            Quay lại cửa hàng
                        </Link>
                    </div>
                ) : (
                    /* Giao diện chính của giỏ hàng */
                    <div className="flex flex-col lg:flex-row gap-16">
                        
                        {/* 1. Danh sách các CartItem (Bên trái) */}
                        <div className="w-full lg:w-2/3 space-y-6">
                            {cartItems.map((item) => (
                                <CartItem key={`${item.id}-${item.size}`} item={item} />
                            ))}
                        </div>

                        {/* 2. Bảng tổng kết CartSummary (Bên phải) */}
                        <div className="w-full lg:w-1/3">
                            <CartSummary />
                            
                            {/* Thông tin bổ sung dưới Summary */}
                            <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <div className="flex items-center space-x-3 text-blue-600 mb-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold text-sm uppercase">Chính sách ưu đãi</span>
                                </div>
                                <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                                    Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Đổi trả dễ dàng trong vòng 30 ngày.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;