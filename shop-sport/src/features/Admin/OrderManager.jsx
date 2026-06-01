import React, { useState, useEffect } from 'react';
import orderApi from '../../api/orderApi';
import toast from 'react-hot-toast';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // ─── Filter States ─────────────────────────────────────────────
    const [filterDay,    setFilterDay]    = useState('');
    const [filterMonth,  setFilterMonth]  = useState('');
    const [filterYear,   setFilterYear]   = useState('');
    const [filterStatus, setFilterStatus] = useState('');

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
            'PENDING':   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
            'PREPARING': 'bg-blue-500/20   text-blue-400   border border-blue-500/30',
            'SHIPPING':  'bg-purple-500/20 text-purple-400 border border-purple-500/30',
            'DELIVERED': 'bg-green-500/20  text-green-400  border border-green-500/30',
            'CANCELLED': 'bg-red-500/20    text-red-400    border border-red-500/30',
        };
        const labels = {
            'PENDING':   'CHƯA THANH TOÁN',
            'PREPARING': 'ĐANG CHUẨN BỊ',
            'SHIPPING':  'ĐANG GIAO',
            'DELIVERED': 'ĐÃ GIAO',
            'CANCELLED': 'ĐÃ HỦY',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${styles[status] || 'bg-zinc-700 text-zinc-400'}`}>
                {labels[status] || status}
            </span>
        );
    };

    // ─── Tập hợp các năm có trong data ───────────────────────────
    const availableYears = [...new Set(
        orders
            .filter(o => o.createdAt)
            .map(o => new Date(o.createdAt).getFullYear())
    )].sort((a, b) => b - a);

    // ─── Lọc đơn hàng theo năm / tháng / ngày / trạng thái ──────
    const filteredOrders = orders.filter(order => {
        if (filterStatus && order.status !== filterStatus) return false;
        if (!order.createdAt) return true;
        const d = new Date(order.createdAt);
        if (filterYear  && d.getFullYear()  !== parseInt(filterYear))  return false;
        if (filterMonth && d.getMonth() + 1 !== parseInt(filterMonth)) return false;
        if (filterDay   && d.getDate()      !== parseInt(filterDay))   return false;
        return true;
    });

    const clearFilters = () => {
        setFilterDay('');
        setFilterMonth('');
        setFilterYear('');
        setFilterStatus('');
    };

    if (loading) {
        return (
            <div className="text-center py-20 font-black italic text-2xl animate-pulse text-blue-400">
                ĐANG TẢI ĐƠN HÀNG...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">

            {/* ── Header + Bộ lọc ── */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">

                {/* Tiêu đề */}
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                        Quản lý <span className="text-blue-400">Đơn hàng</span>
                    </h2>
                    <p className="text-zinc-400 font-medium mt-1">
                        Hiển thị{' '}
                        <span className="text-white font-bold">{filteredOrders.length}</span>
                        {' '}/ {orders.length} đơn hàng
                    </p>
                </div>

                {/* Bộ lọc */}
                <div className="flex flex-wrap gap-3 items-end">

                    {/* Trạng thái */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Trạng thái</label>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 transition cursor-pointer min-w-[150px]"
                        >
                            <option value="">Tất cả</option>
                            <option value="PENDING">Chưa thanh toán</option>
                            <option value="PREPARING">Đang chuẩn bị</option>
                            <option value="SHIPPING">Đang giao hàng</option>
                            <option value="DELIVERED">Đã giao hàng</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>

                    {/* Năm */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Năm</label>
                        <select
                            value={filterYear}
                            onChange={e => { setFilterYear(e.target.value); setFilterMonth(''); setFilterDay(''); }}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 transition cursor-pointer min-w-[90px]"
                        >
                            <option value="">Tất cả</option>
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tháng */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tháng</label>
                        <select
                            value={filterMonth}
                            onChange={e => { setFilterMonth(e.target.value); setFilterDay(''); }}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 transition cursor-pointer min-w-[110px]"
                        >
                            <option value="">Tất cả</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ngày */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ngày</label>
                        <select
                            value={filterDay}
                            onChange={e => setFilterDay(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 transition cursor-pointer min-w-[100px]"
                        >
                            <option value="">Tất cả</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                <option key={d} value={d}>Ngày {d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nút xóa filter */}
                    {(filterYear || filterMonth || filterDay || filterStatus) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-700/60 hover:bg-red-500/20 border border-zinc-600 hover:border-red-500/50 text-zinc-300 hover:text-red-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 self-end"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Xóa lọc
                        </button>
                    )}
                </div>
            </div>

            {/* ── Bảng đơn hàng ── */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-800/60 text-zinc-400 font-bold text-xs uppercase tracking-widest border-b border-zinc-700">
                                <th className="px-6 py-4">Mã Đơn</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Địa chỉ</th>
                                <th className="px-6 py-4">Ngày đặt</th>
                                <th className="px-6 py-4">Tổng tiền</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-800/40 transition border-b border-zinc-800/60">
                                    <td className="px-6 py-4 font-bold text-white">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-zinc-100">{order.username}</p>
                                        <p className="text-xs text-zinc-500">{order.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-zinc-400 max-w-[200px] truncate" title={order.address}>
                                            {order.address || "Chưa có địa chỉ"}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-black text-blue-400">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                            .format(order.totalAmount || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status === 'PENDING' ? 'PREPARING' : order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 transition cursor-pointer"
                                        >
                                            <option value="PREPARING">Đang chuẩn bị hàng</option>
                                            <option value="SHIPPING">Đang giao hàng</option>
                                            <option value="DELIVERED">Đã giao hàng</option>
                                            <option value="CANCELLED">Hủy đơn</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}

                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-zinc-500">
                                            <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="font-bold italic">Không tìm thấy đơn hàng phù hợp.</p>
                                        </div>
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
