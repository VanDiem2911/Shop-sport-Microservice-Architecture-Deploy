import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentApi from '../../api/paymentApi';
import orderApi from '../../api/orderApi';
import { useCart } from '../Cart/CartContext';
import toast from 'react-hot-toast';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearSelectedItems } = useCart();
    
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");

    const orderState = location.state || {};
    const { orderId, totalAmount, items } = orderState;

    if (!orderId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin đơn hàng</h2>
                <button onClick={() => navigate('/cart')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Quay lại giỏ hàng</button>
            </div>
        );
    }

    const handlePaymentSubmit = () => {
        handleFinishPayment();
    };

    const handleFinishPayment = async () => {
        try {
            setLoading(true);
            const username = localStorage.getItem('username') || "Khách vãng lai";
            
            const response = await paymentApi.pay({
                orderId: orderId,
                amount: totalAmount,
                method: paymentMethod,
                username: username
            });
            
            if (paymentMethod === "MOMO" && response.data?.status === "REDIRECT") {
                toast.success("Đang chuyển hướng sang cổng thanh toán MoMo...");
                window.location.href = response.data.payUrl;
                return;
            }
            
            if (paymentMethod === "CASH_ON_DELIVERY") {
                try {
                    await orderApi.updateOrderStatus(orderId, 'PREPARING');
                } catch (err) {
                    console.error("Lỗi khi cập nhật trạng thái đơn hàng COD:", err);
                }
                toast.success("Đã ghi nhận đơn hàng COD. Vui lòng chuẩn bị tiền khi nhận hàng!");
            } else {
                toast.success("Thanh toán thành công! Shop đang chuẩn bị hàng cho bạn.");
            }
            clearSelectedItems();
            navigate('/orders');
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            if (error.response?.data?.message) {
                toast.error(`Thanh toán thất bại: ${error.response.data.message}`);
            } else {
                toast.error("Đã có lỗi xảy ra trong quá trình xử lý thanh toán!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-transparent min-h-screen py-16 relative">
            
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-center text-blue-600">Thanh Toán Đơn Hàng</h2>
                
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-8 rounded-[2.5rem] shadow-xl mb-8">
                    <h3 className="text-xl font-bold uppercase mb-6 border-b pb-4">Mã đơn hàng: #{orderId}</h3>
                    
                    <div className="space-y-4 mb-8">
                        {items && items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-zinc-800/60 p-4 rounded-xl border border-zinc-700">
                                    <div className="flex items-center space-x-4">
                                        <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-black text-blue-600 text-sm">{item.quantity}x</span>
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase">Size: {item.size || 'N/A'}</p>
                                        </div>
                                    </div>
                                <span className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}đ</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-end border-t pt-6 mb-10">
                        <span className="text-lg font-bold text-gray-500">CẦN THANH TOÁN:</span>
                        <span className="text-4xl font-black text-red-500">{Number(totalAmount).toLocaleString()}đ</span>
                    </div>

                    <h3 className="text-lg font-bold mb-4">Mời bạn chọn phương thức thanh toán:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        
                        {/* MoMo Option */}
                        <div 
                            onClick={() => setPaymentMethod("MOMO")}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === "MOMO" ? 'border-[#A50064] bg-pink-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "MOMO" ? 'border-[#A50064]' : 'border-gray-300'}`}>
                                    {paymentMethod === "MOMO" && <span className="w-2 h-2 rounded-full bg-[#A50064]"></span>}
                                </span>
                                <h4 className="font-bold text-[#A50064]">Quét mã MoMo (Khuyên dùng)</h4>
                            </div>
                            <p className="text-sm text-gray-500 ml-7">Thanh toán siêu tốc qua ví MoMo bằng QR Code.</p>
                        </div>
                        {/* COD Option */}
                        <div 
                            onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === "CASH_ON_DELIVERY" ? 'border-black bg-gray-100 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "CASH_ON_DELIVERY" ? 'border-black' : 'border-gray-300'}`}>
                                    {paymentMethod === "CASH_ON_DELIVERY" && <span className="w-2 h-2 rounded-full bg-black"></span>}
                                </span>
                                <h4 className="font-bold text-gray-800">Thanh Toán Tiền Mặt (COD)</h4>
                            </div>
                            <p className="text-sm text-gray-500 ml-7">Thanh toán bằng tiền mặt khi bạn nhận được hàng.</p>
                        </div>

                    </div>

                    <button 
                        onClick={handlePaymentSubmit}
                        disabled={loading}
                        className={`w-full ${paymentMethod === 'MOMO' ? 'bg-[#A50064] hover:bg-pink-800' : 'bg-black hover:bg-blue-600'} text-white py-5 rounded-2xl font-black uppercase tracking-widest transition duration-300 shadow-xl active:scale-95 disabled:opacity-50`}>
                        {loading ? "ĐANG TIẾN HÀNH..." : paymentMethod === 'MOMO' ? "QUÉT MÃ MOMO NGAY" : "XÁC NHẬN THANH TOÁN"}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Mọi giao dịch đều được đảm bảo an toàn & bảo mật
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Payment;
