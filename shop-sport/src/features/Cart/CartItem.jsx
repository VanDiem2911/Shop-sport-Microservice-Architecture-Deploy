import React from 'react';
import { useCart } from '../Cart/CartContext'; // Import cái này để dùng context giỏ hàng

const CartItem = ({ item }) => {
    const { removeFromCart } = useCart();

    return (
        <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center space-x-6">
                {/* Ảnh sản phẩm */}
                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Thông tin sản phẩm */}
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <div className="mt-2 flex items-center space-x-4">
                        <span className="text-blue-600 font-black italic">
                            {item.price.toLocaleString()}đ
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm font-bold text-gray-500">Số lượng: {item.quantity}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold">Size: {item.size || 'Standard'}</span>
                    </div>
                </div>
            </div>

            {/* Nút xóa */}
            <button 
                onClick={() => removeFromCart(item.id, item.size)}
                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition duration-300"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};

export default CartItem;