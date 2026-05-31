import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentApi from '../../api/paymentApi';
import { useCart } from '../Cart/CartContext';
import toast from 'react-hot-toast';

const MomoCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('verifying'); // verifying | success | failed
    const [orderInfo, setOrderInfo] = useState({ orderId: '', amount: '', transId: '', message: '' });
    const [countdown, setCountdown] = useState(5);
    const hasCalledVerify = useRef(false);

    useEffect(() => {
        if (hasCalledVerify.current) return;
        hasCalledVerify.current = true;

        const verifyPayment = async () => {
            try {
                // Parse query parameters
                const queryParams = new URLSearchParams(location.search);
                const params = {};
                for (const [key, value] of queryParams.entries()) {
                    params[key] = value;
                }

                // If no signature or resultCode, it is not a valid callback
                if (!params.signature || !params.resultCode) {
                    setStatus('failed');
                    setOrderInfo(prev => ({ ...prev, message: 'Tham số phản hồi không hợp lệ từ MoMo' }));
                    return;
                }

                // Extract original orderId from "ourOrderId-timestamp"
                const rawOrderId = params.orderId || '';
                const displayOrderId = rawOrderId.split('-')[0];

                setOrderInfo({
                    orderId: displayOrderId,
                    amount: Number(params.amount || 0).toLocaleString() + ' VNĐ',
                    transId: params.transId || 'N/A',
                    message: params.message || 'Thanh toán không thành công'
                });

                // Call backend to verify signature and update DB
                console.log('Sending parameters to backend for verification:', params);
                const response = await paymentApi.verifyMomo(params);

                if (response.data?.status === 'SUCCESS') {
                    setStatus('success');
                    clearCart();
                    toast.success('Thanh toán đơn hàng qua MoMo thành công!');
                } else {
                    setStatus('failed');
                    setOrderInfo(prev => ({ 
                        ...prev, 
                        message: response.data?.message || params.message || 'Thanh toán bị từ chối' 
                    }));
                    toast.error('Thanh toán qua MoMo không thành công.');
                }
            } catch (error) {
                console.error('Error verifying MoMo payment:', error);
                setStatus('failed');
                const errMsg = error.response?.data?.message || 'Có lỗi hệ thống xảy ra khi xác thực giao dịch';
                setOrderInfo(prev => ({ ...prev, message: errMsg }));
                toast.error(errMsg);
            }
        };

        verifyPayment();
    }, [location, clearCart]);

    // Countdown timer for automatic redirect
    useEffect(() => {
        if (status !== 'success') return;
        
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/orders');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center py-16 px-4 font-sans text-white relative overflow-hidden">
            {/* Glowing background shapes */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A50064]/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 text-center flex flex-col items-center overflow-hidden">
                {/* Header Pink Line */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#A50064] shadow-lg shadow-[#A50064]/50"></div>

                {status === 'verifying' && (
                    <div className="py-8 w-full flex flex-col items-center">
                        {/* Premium Spinning Loader */}
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-[#A50064] border-r-purple-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#A50064] to-purple-600 opacity-20 blur-sm"></div>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-2">Đang xác thực giao dịch</h2>
                        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">Vui lòng không tắt trình duyệt hoặc tải lại trang. Hệ thống đang đối soát chữ ký bảo mật với MoMo...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-6 w-full flex flex-col items-center animate-fade-in-up">
                        {/* Premium success anim */}
                        <div className="relative w-24 h-24 bg-emerald-500/15 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-bounce">
                            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {/* Halo effect */}
                            <span className="absolute -inset-1 rounded-full border border-emerald-500/30 animate-ping opacity-75"></span>
                        </div>

                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-300 text-sm mb-8">Giao dịch của bạn đã được MoMo xác nhận hợp lệ.</p>

                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-400">Mã đơn hàng:</span>
                                <span className="font-bold text-white">#{orderInfo.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-400">Số tiền:</span>
                                <span className="font-bold text-emerald-400 text-lg">{orderInfo.amount}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Mã giao dịch MoMo:</span>
                                <span className="font-mono text-xs text-gray-300">{orderInfo.transId}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-6 italic">
                            Tự động chuyển về trang lịch sử đơn hàng sau <span className="text-emerald-400 font-bold">{countdown}</span> giây...
                        </p>

                        <button 
                            onClick={() => navigate('/orders')}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold tracking-wide transition duration-300 shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                            XEM ĐƠN HÀNG CỦA BẠN
                        </button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="py-6 w-full flex flex-col items-center animate-fade-in-up">
                        {/* Premium failure anim */}
                        <div className="relative w-24 h-24 bg-rose-500/15 border-2 border-rose-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.2)] animate-pulse">
                            <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>

                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300 tracking-tight mb-2">Thanh toán thất bại</h2>
                        <p className="text-gray-300 text-sm mb-8">Giao dịch MoMo bị hủy hoặc gặp sự cố đối soát.</p>

                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left">
                            <p className="text-xs text-gray-400 mb-1">Lý do thất bại:</p>
                            <p className="text-sm font-semibold text-rose-300 leading-relaxed">{orderInfo.message || 'Người dùng hủy thanh toán hoặc hết hạn phiên làm việc.'}</p>
                        </div>

                        <div className="w-full flex flex-col space-y-3">
                            <button 
                                onClick={() => navigate('/cart')}
                                className="w-full py-4 bg-[#A50064] hover:bg-[#850050] text-white rounded-2xl font-bold tracking-wide transition duration-300 shadow-lg shadow-[#A50064]/20 active:scale-[0.98]">
                                QUAY LẠI GIỎ HÀNG
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold tracking-wide transition duration-300 active:scale-[0.98]">
                                VỀ TRANG CHỦ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MomoCallback;
