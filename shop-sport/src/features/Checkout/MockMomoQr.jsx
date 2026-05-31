import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MockMomoQr = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { targetUrl, amount, orderId } = location.state || {};

    if (!targetUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin thanh toán</h2>
                <button onClick={() => navigate('/cart')} className="bg-[#A50064] text-white px-6 py-2 rounded-xl">Quay lại giỏ hàng</button>
            </div>
        );
    }

    const handleRedirect = () => {
        try {
            const urlObj = new URL(targetUrl);
            const localPath = urlObj.pathname + urlObj.search;
            navigate(localPath);
        } catch (e) {
            window.location.href = targetUrl;
        }
    };

    const formattedAmount = Number(amount || 0).toLocaleString('vi-VN') + 'đ';

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center py-16 px-4 font-sans text-white relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A50064]/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A50064]/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-10 shadow-2xl relative z-10 text-center flex flex-col items-center overflow-hidden">
                {/* MoMo Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#A50064] shadow-lg shadow-[#A50064]/50"></div>

                {/* MoMo Logo Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-[#A50064] rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#A50064]/30">
                        M
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">CỔNG THANH TOÁN</p>
                        <h2 className="text-xl font-bold text-white tracking-tight leading-none">Ví MoMo</h2>
                    </div>
                </div>

                {/* Order Details Card */}
                <div className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl p-5 mb-8 text-left space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-zinc-850 pb-2">
                        <span className="text-zinc-400">Đơn hàng:</span>
                        <span className="font-bold text-zinc-200">#{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Số tiền thanh toán:</span>
                        <span className="font-black text-[#A50064] text-xl">{formattedAmount}</span>
                    </div>
                </div>

                {/* Dynamic QR Code Screen */}
                <div className="bg-white p-6 rounded-3xl shadow-2xl border border-zinc-800 mb-8 relative group">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=a50064&data=${encodeURIComponent(targetUrl || '')}`} 
                        alt="MoMo QR Code" 
                        className="w-48 h-48 object-contain"
                    />
                </div>

                {/* Instructions */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A50064]"></span>
                        </span>
                        <p className="text-sm font-bold text-zinc-300">Đang chờ quét mã QR...</p>
                    </div>
                    
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mx-auto">
                        Quét mã QR bằng ứng dụng MoMo của bạn để thanh toán hoặc click vào nút thanh toán bên dưới để xác nhận hoàn tất giao dịch.
                    </p>
                </div>

                {/* Payment Action Button */}
                <button 
                    onClick={handleRedirect}
                    className="w-full py-5 bg-[#A50064] hover:bg-[#850050] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition duration-300 shadow-lg shadow-[#A50064]/20 active:scale-[0.98]">
                    XÁC NHẬN THANH TOÁN
                </button>
            </div>
        </div>
    );
};

export default MockMomoQr;
