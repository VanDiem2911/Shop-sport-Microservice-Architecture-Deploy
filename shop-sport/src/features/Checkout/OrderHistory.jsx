import React, { useEffect, useState } from 'react';
import orderApi from '../../api/orderApi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import reviewApi from '../../api/reviewApi';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Review Modal States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const tabs = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'PENDING', label: 'Chờ thanh toán' },
        { id: 'PREPARING', label: 'Vận chuyển' },
        { id: 'SHIPPING', label: 'Đang giao' },
        { id: 'DELIVERED', label: 'Hoàn thành' },
        { id: 'CANCELLED', label: 'Đã hủy' },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await orderApi.getMyOrders();
                const data = response.data || [];
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (activeTab === 'ALL') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === activeTab));
        }
    }, [activeTab, orders]);

    const handlePayNow = (order) => {
        navigate('/payment', { 
            state: { 
                orderId: order.id, 
                totalAmount: order.totalAmount,
                items: order.items 
            } 
        });
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
            try {
                await orderApi.updateOrderStatus(orderId, 'CANCELLED');
                toast.success("Đã hủy đơn hàng thành công!");
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
            } catch (error) {
                console.error("Lỗi khi hủy đơn hàng:", error);
                toast.error("Không thể hủy đơn hàng lúc này!");
            }
        }
    };

    const handleOpenReview = (item) => {
        setSelectedItemForReview(item);
        setReviewRating(5);
        setReviewContent("");
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewContent.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        try {
            setSubmittingReview(true);
            const username = localStorage.getItem('username') || "Ẩn danh";
            await reviewApi.addReview(selectedItemForReview.productId, {
                username,
                content: reviewContent,
                rating: reviewRating
            });
            toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
            setShowReviewModal(false);
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            toast.error("Không thể gửi đánh giá lúc này!");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 font-bold text-gray-400">Đang tải lịch sử đơn hàng...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Review Modal */}
            {showReviewModal && selectedItemForReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Đánh giá sản phẩm</h3>
                            <button onClick={() => setShowReviewModal(false)} className="hover:rotate-90 transition duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex gap-4 items-center mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <img src={selectedItemForReview.imageUrl} alt="" className="w-16 h-16 object-cover rounded-xl border border-white shadow-sm" />
                                <div>
                                    <h4 className="font-black text-gray-800 line-clamp-1">{selectedItemForReview.name}</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Phân loại: {selectedItemForReview.size}</p>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Bạn thấy sản phẩm thế nào?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            onClick={() => setReviewRating(star)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${reviewRating >= star ? 'text-yellow-400 bg-yellow-50 scale-110' : 'text-gray-200'}`}
                                        >
                                            <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs font-black text-blue-600 uppercase">
                                    {reviewRating === 5 ? "Tuyệt vời" : reviewRating === 4 ? "Hài lòng" : reviewRating === 3 ? "Bình thường" : reviewRating === 2 ? "Không tốt" : "Tệ"}
                                </p>
                            </div>

                            <div className="mb-8">
                                <textarea 
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                                    className="w-full h-32 bg-gray-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-[2rem] p-6 text-sm font-medium transition-all outline-none resize-none"
                                />
                            </div>

                            <button 
                                onClick={handleSubmitReview}
                                disabled={submittingReview}
                                className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {submittingReview ? "ĐANG GỬI..." : "GỬI ĐÁNH GIÁ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[120px] py-4 text-sm font-bold transition-all border-b-2 ${
                                    activeTab === tab.id 
                                    ? 'text-blue-600 border-blue-600' 
                                    : 'text-gray-500 border-transparent hover:text-blue-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-5xl mt-8">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-lg font-medium">Chưa có đơn hàng nào trong mục này.</p>
                        <Link to="/" className="mt-6 text-blue-600 font-bold hover:underline">Tiếp tục mua sắm ngay</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition duration-300">
                                <div className="flex justify-between items-center w-full border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">SHOP-SPORT</div>
                                        <h3 className="font-bold text-gray-800">Đơn hàng #{order.id}</h3>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        {(() => {
                                            switch(order.status) {
                                                case 'PENDING': return <span className="text-yellow-600 text-xs font-bold uppercase tracking-wider">● Chờ thanh toán</span>;
                                                case 'PREPARING': return <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">● Đang chuẩn bị hàng</span>;
                                                case 'SHIPPING': return <span className="text-purple-600 text-xs font-bold uppercase tracking-wider">● Đang giao hàng</span>;
                                                case 'DELIVERED': return <span className="text-green-600 text-xs font-bold uppercase tracking-wider">● Giao hàng thành công</span>;
                                                case 'CANCELLED': return <span className="text-red-500 text-xs font-bold uppercase tracking-wider">● Đã hủy</span>;
                                                default: return <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">● {order.status}</span>;
                                            }
                                        })()}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start">
                                            <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img 
                                                    src={item.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200"} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1">Phân loại hàng: {item.size || 'Standard'}</p>
                                                <p className="text-sm font-bold text-gray-700 mt-1">x{item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-blue-600 font-bold">{item.price?.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-6 flex flex-col items-end">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
                                        </svg>
                                        <span className="text-sm text-gray-500 font-medium">Thành tiền:</span>
                                        <span className="text-2xl font-black text-blue-600">{Number(order.totalAmount).toLocaleString()}đ</span>
                                    </div>

                                    <div className="flex gap-3">
                                        {order.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-8 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition">
                                                    Hủy đơn hàng
                                                </button>
                                                <button 
                                                    onClick={() => handlePayNow(order)}
                                                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md">
                                                    Thanh toán
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <button 
                                                onClick={() => handleOpenReview(order.items[0])} // Tạm thời đánh giá item đầu tiên
                                                className="px-8 py-2.5 bg-yellow-500 text-white font-black rounded-lg hover:bg-black transition shadow-lg shadow-yellow-100 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                Đánh giá ngay
                                            </button>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <button className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                                                Mua lại
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('open-seller-chat', { detail: { orderId: order.id } }));
                                            }}
                                            className="px-8 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Liên hệ người bán
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
