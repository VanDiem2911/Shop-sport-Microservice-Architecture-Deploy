import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentApi from '../../api/paymentApi';
import { useCart } from '../Cart/CartContext';
import toast from 'react-hot-toast';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
    const [showMomoQR, setShowMomoQR] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const orderState = location.state || {};
    const { orderId, totalAmount, items } = orderState;

    useEffect(() => {
        let timer;
        if (showMomoQR) {
            timer = setTimeout(() => {
                handleFinishPayment();
            },10000);
        }
        return () => clearTimeout(timer);
    }, [showMomoQR]);

    if (!orderId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin đơn hàng</h2>
                <button onClick={() => navigate('/cart')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Quay lại giỏ hàng</button>
            </div>
        );
    }

    const handlePaymentSubmit = () => {
        if (paymentMethod === "MOMO") {
            setShowMomoQR(true);
        } else {
            handleFinishPayment();
        }
    };

    const handleFinishPayment = async () => {
        try {
            if (paymentMethod === "MOMO") {
                setPaymentSuccess(true); // show dấu tick xanh trong modal
                await new Promise(resolve => setTimeout(resolve, 1500)); // Đợi 1.5s cho KH nhìn thấy tick xanh
            } else {
                setLoading(true);
            }
            
            const username = localStorage.getItem('username') || "Khách vãng lai";
            
            await paymentApi.pay({
                orderId: orderId,
                amount: totalAmount,
                method: paymentMethod,
                username: username
            });
            
            if (paymentMethod === "CASH_ON_DELIVERY") {
                toast.success("Đã ghi nhận đơn hàng COD. Vui lòng chuẩn bị tiền khi nhận hàng!");
            } else {
                toast.success("Thanh toán thành công! Shop đang chuẩn bị hàng cho bạn.");
            }
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            toast.error("Đã có lỗi xảy ra trong quá trình xử lý thanh toán!");
        } finally {
            setLoading(false);
            setShowMomoQR(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-16 relative">
            
            {/* Modal Quét Mã MoMo */}
            {showMomoQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full flex flex-col items-center text-center relative overflow-hidden transform transition-all duration-500 scale-100">
                        {/* Header MoMo */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-[#A50064]"></div>
                        
                        {!paymentSuccess ? (
                            <>
                                <h2 className="text-3xl font-black italic tracking-tighter text-[#A50064] mb-2 mt-4">MoMo Payment</h2>
                                <p className="text-gray-500 text-sm mb-6">Sử dụng App MoMo hoặc ứng dụng Camera có hỗ trợ QR code để quét mã.</p>
                                
                                <div className="p-4 bg-white border-4 border-[#A50064] rounded-3xl mb-6 shadow-xl relative">
                                    {/* Dùng QR Server API để generate QR Code chứa thông tin order dạng văn bản */}
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`THÔNG TIN THANH TOÁN:\n- Mã đơn hàng: #${orderId}\n- Số tiền cần trả: ${Number(totalAmount).toLocaleString()} VNĐ`)}`} 
                                        alt="Order QR Code" 
                                        className="w-48 h-48 object-contain"
                                    />
                                    {/* Chấm tròn nháy nháy góc */}
                                    <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-400 animate-ping"></div>
                                    <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-500"></div>
                                </div>

                                <div className="flex items-center space-x-3 text-[#A50064] mb-6">
                                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-bold">Đang chờ bạn quét mã...</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-xl p-4 flex justify-between items-center text-left">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">Số tiền</p>
                                        <p className="text-xl font-black text-[#A50064]">{Number(totalAmount).toLocaleString()}đ</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold">Mã Đơn</p>
                                        <p className="font-bold text-gray-800">#{orderId}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setShowMomoQR(false)}
                                    className="mt-6 text-gray-400 font-bold text-sm hover:text-gray-800 transition">
                                    Hủy giao dịch
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
                                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="text-2xl font-black text-green-500 mb-2">Thanh toán thành công!</h3>
                                <p className="text-gray-500 font-medium text-sm">Đang chuyển về trang kết quả...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-center text-blue-600">Thanh Toán Đơn Hàng</h2>
                
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-8">
                    <h3 className="text-xl font-bold uppercase mb-6 border-b pb-4">Mã đơn hàng: #{orderId}</h3>
                    
                    <div className="space-y-4 mb-8">
                        {items && items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
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

                        {/* Credit Card Option */}
                        <div 
                            onClick={() => setPaymentMethod("CREDIT_CARD")}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === "CREDIT_CARD" ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "CREDIT_CARD" ? 'border-blue-600' : 'border-gray-300'}`}>
                                    {paymentMethod === "CREDIT_CARD" && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                                </span>
                                <h4 className="font-bold text-gray-800">Cổng Thanh Toán Online</h4>
                            </div>
                            <p className="text-sm text-gray-500 ml-7">Quẹt thẻ ngân hàng Visa, Mastercard, ATM.</p>
                        </div>

                        {/* COD Option */}
                        <div 
                            onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition ${paymentMethod === "CASH_ON_DELIVERY" ? 'border-black bg-gray-100 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'} md:col-span-2`}>
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
