import React, { useState, useEffect } from 'react';
import orderApi from '../../api/orderApi';
import toast from 'react-hot-toast';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderApi.getAllOrders();
            setOrders(res.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng:", error);
            toast.error("Không thể tải danh sách đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderApi.updateOrderStatus(orderId, newStatus);
            toast.success("Cập nhật trạng thái thành công!");
            // Cập nhật local state
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            toast.error("Cập nhật thất bại!");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'PREPARING': 'bg-blue-100 text-blue-700',
            'SHIPPING': 'bg-purple-100 text-purple-700',
            'DELIVERED': 'bg-green-100 text-green-700',
            'CANCELLED': 'bg-red-100 text-red-700',
        };
        const labels = {
            'PENDING': 'CHƯA THANH TOÁN',
            'PREPARING': 'ĐANG CHUẨN BỊ',
            'SHIPPING': 'ĐANG GIAO',
            'DELIVERED': 'ĐÃ GIAO',
            'CANCELLED': 'ĐÃ HỦY',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return <div className="text-center py-20 font-black italic text-2xl animate-pulse text-blue-600">ĐANG TẢI ĐƠN HÀNG...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Quản lý <span className="text-blue-600">Đơn hàng</span></h2>
                <p className="text-gray-500 font-medium mt-1">Tổng cộng: {orders.length} đơn hàng</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest border-b">
                                <th className="px-6 py-4">Mã Đơn</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Địa chỉ</th>
                                <th className="px-6 py-4">Ngày đặt</th>
                                <th className="px-6 py-4">Tổng tiền</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-blue-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">{order.username}</p>
                                        <p className="text-xs text-gray-400">{order.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 max-w-[200px] truncate" title={order.address}>
                                            {order.address || "Chưa có địa chỉ"}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-black text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-xs font-bold outline-none focus:border-blue-600 transition cursor-pointer"
                                        >
                                            <option value="PENDING">Chưa thanh toán</option>
                                            <option value="PREPARING">Đang chuẩn bị hàng</option>
                                            <option value="SHIPPING">Đang giao hàng</option>
                                            <option value="DELIVERED">Đã giao hàng</option>
                                            <option value="CANCELLED">Hủy đơn</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold italic">
                                        Chưa có đơn hàng nào được đặt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderManager;
