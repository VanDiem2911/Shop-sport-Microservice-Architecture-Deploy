import React, { useState, useEffect, useMemo } from 'react';
import orderApi from '../../api/orderApi';
import paymentApi from '../../api/paymentApi';

/* ─── Mini Bar Chart (thuần CSS, không cần thư viện) ──────────────── */
const BarChart = ({ data, maxVal }) => (
    <div className="flex items-end gap-1 h-32 w-full">
        {data.map((item, i) => {
            const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
            return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
                        {item.label}: {new Intl.NumberFormat('vi-VN').format(item.value)}đ
                    </div>
                    <div
                        className="w-full rounded-t-md transition-all duration-500 bg-gradient-to-t from-blue-600 to-blue-400 hover:from-purple-600 hover:to-purple-400"
                        style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="text-[9px] text-zinc-500 font-bold">{item.label}</span>
                </div>
            );
        })}
    </div>
);

/* ─── KPI Card ─────────────────────────────────────────────────────── */
const KpiCard = ({ icon, label, value, sub, color }) => (
    <div className={`bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-6 flex items-center gap-5 shadow-xl hover:shadow-${color}-900/20 transition-all duration-300 group`}>
        <div className={`w-14 h-14 rounded-2xl bg-${color}-500/15 border border-${color}-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-black text-${color}-400 leading-none truncate`}>{value}</p>
            {sub && <p className="text-xs text-zinc-500 font-medium mt-1">{sub}</p>}
        </div>
    </div>
);

/* ─── Main Component ───────────────────────────────────────────────── */
const RevenueStats = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const res = await orderApi.getAllOrders();
                const rawOrders = res.data || [];

                // Fetch payment info song song
                const enriched = await Promise.all(
                    rawOrders.map(async (o) => {
                        try {
                            const p = await paymentApi.getPaymentByOrderId(o.id);
                            return { ...o, paymentInfo: p.data };
                        } catch {
                            return { ...o, paymentInfo: null };
                        }
                    })
                );
                setOrders(enriched);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    /* ── Dữ liệu đã thanh toán thành công ── */
    const paidOrders = useMemo(() =>
        orders.filter(o =>
            o.paymentInfo?.status === 'SUCCESS' &&
            ['PREPARING', 'SHIPPING', 'DELIVERED'].includes(o.status)
        ),
    [orders]);

    /* ── Năm có trong dữ liệu ── */
    const availableYears = useMemo(() => {
        const years = [...new Set(
            orders.filter(o => o.createdAt).map(o => new Date(o.createdAt).getFullYear())
        )].sort((a, b) => b - a);
        return years.length ? years : [new Date().getFullYear()];
    }, [orders]);

    /* ── Lọc theo năm ── */
    const ordersThisYear  = useMemo(() => orders.filter(o => o.createdAt && new Date(o.createdAt).getFullYear() === filterYear), [orders, filterYear]);
    const paidThisYear    = useMemo(() => paidOrders.filter(o => new Date(o.createdAt).getFullYear() === filterYear), [paidOrders, filterYear]);

    /* ── KPIs ── */
    const totalRevenue    = paidOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const revenueThisYear = paidThisYear.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOrders     = orders.length;
    const deliveredCount  = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledCount  = orders.filter(o => o.status === 'CANCELLED').length;
    const avgOrderValue   = paidOrders.length ? totalRevenue / paidOrders.length : 0;

    /* ── Doanh thu theo tháng (năm đang chọn) ── */
    const monthlyData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({ label: `T${i + 1}`, value: 0 }));
        paidThisYear.forEach(o => {
            const m = new Date(o.createdAt).getMonth();
            months[m].value += o.totalAmount || 0;
        });
        return months;
    }, [paidThisYear]);
    const maxMonthly = Math.max(...monthlyData.map(m => m.value), 1);

    /* ── Doanh thu theo trạng thái ── */
    const statusBreakdown = useMemo(() => {
        const map = { PREPARING: 0, SHIPPING: 0, DELIVERED: 0, CANCELLED: 0, PENDING: 0 };
        ordersThisYear.forEach(o => { if (map[o.status] !== undefined) map[o.status]++; });
        return map;
    }, [ordersThisYear]);

    /* ── Top sản phẩm bán chạy ── */
    const topProducts = useMemo(() => {
        const map = {};
        paidOrders.forEach(o => {
            (o.items || []).forEach(item => {
                if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0, img: item.imageUrl };
                map[item.name].qty     += item.quantity || 1;
                map[item.name].revenue += (item.price || 0) * (item.quantity || 1);
            });
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [paidOrders]);

    const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const fmtShort = (n) => {
        if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
        if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr';
        if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' k';
        return n.toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Đang tải dữ liệu thống kê...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 space-y-10">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Bảng điều khiển</p>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                        Thống kê <span className="text-blue-400">Doanh thu</span>
                    </h2>
                    <p className="text-zinc-500 font-medium mt-1 text-sm">Tổng quan toàn bộ hoạt động kinh doanh</p>
                </div>
                {/* Chọn năm */}
                <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Năm</label>
                    <select
                        value={filterYear}
                        onChange={e => setFilterYear(parseInt(e.target.value))}
                        className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard
                    color="blue"
                    label="Tổng doanh thu"
                    value={fmtShort(totalRevenue) + 'đ'}
                    sub="Tất cả thời gian (đã thanh toán)"
                    icon={<svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <KpiCard
                    color="purple"
                    label={`Doanh thu ${filterYear}`}
                    value={fmtShort(revenueThisYear) + 'đ'}
                    sub={`${paidThisYear.length} đơn đã thanh toán`}
                    icon={<svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
                />
                <KpiCard
                    color="green"
                    label="Đã giao hàng"
                    value={deliveredCount}
                    sub={`Tỷ lệ: ${totalOrders ? Math.round((deliveredCount / totalOrders) * 100) : 0}%`}
                    icon={<svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                />
                <KpiCard
                    color="yellow"
                    label="Giá trị TB / đơn"
                    value={fmtShort(avgOrderValue) + 'đ'}
                    sub={`${paidOrders.length} đơn hàng đã TT`}
                    icon={<svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                />
            </div>

            {/* ── Biểu đồ doanh thu theo tháng + Trạng thái đơn ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Biểu đồ theo tháng */}
                <div className="xl:col-span-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-7 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight">Doanh thu theo tháng</h3>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">Năm {filterYear} — chỉ tính đơn đã thanh toán</p>
                        </div>
                        <span className="text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                            {fmtShort(revenueThisYear)}đ tổng
                        </span>
                    </div>
                    <BarChart data={monthlyData} maxVal={maxMonthly} />
                </div>

                {/* Phân bổ trạng thái */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-7 shadow-xl">
                    <h3 className="text-base font-black uppercase tracking-tight mb-1">Phân bổ đơn hàng</h3>
                    <p className="text-xs text-zinc-500 font-medium mb-6">Năm {filterYear} — {ordersThisYear.length} đơn</p>
                    <div className="space-y-4">
                        {[
                            { key: 'PREPARING', label: 'Đang chuẩn bị', color: 'bg-blue-500',   text: 'text-blue-400'   },
                            { key: 'SHIPPING',  label: 'Đang giao',      color: 'bg-purple-500', text: 'text-purple-400' },
                            { key: 'DELIVERED', label: 'Đã giao',        color: 'bg-green-500',  text: 'text-green-400'  },
                            { key: 'CANCELLED', label: 'Đã hủy',         color: 'bg-red-500',    text: 'text-red-400'    },
                            { key: 'PENDING',   label: 'Chờ TT',         color: 'bg-yellow-500', text: 'text-yellow-400' },
                        ].map(({ key, label, color, text }) => {
                            const count = statusBreakdown[key] || 0;
                            const pct   = ordersThisYear.length ? Math.round((count / ordersThisYear.length) * 100) : 0;
                            return (
                                <div key={key}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className={`text-xs font-bold ${text}`}>{label}</span>
                                        <span className="text-xs text-zinc-400 font-bold">{count} đơn ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${color} rounded-full transition-all duration-700`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Top 5 sản phẩm doanh thu cao nhất ── */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-7 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-black uppercase tracking-tight">Top sản phẩm</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">5 sản phẩm có doanh thu cao nhất (tất cả thời gian)</p>
                    </div>
                    <span className="text-xs font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                        Theo doanh thu
                    </span>
                </div>

                {topProducts.length === 0 ? (
                    <p className="text-center text-zinc-600 font-bold italic py-8">Chưa có dữ liệu sản phẩm.</p>
                ) : (
                    <div className="space-y-4">
                        {topProducts.map((p, i) => {
                            const maxRev = topProducts[0].revenue;
                            const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            return (
                                <div key={p.name} className="flex items-center gap-5 p-4 bg-zinc-800/40 hover:bg-zinc-800/70 rounded-2xl border border-zinc-700/30 transition">
                                    <span className="text-2xl w-8 text-center flex-shrink-0">{medals[i]}</span>
                                    <img
                                        src={p.img || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=80'}
                                        alt={p.name}
                                        className="w-12 h-12 object-cover rounded-xl border border-zinc-700 flex-shrink-0"
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-zinc-100 text-sm truncate">{p.name}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex-grow h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-bold flex-shrink-0">{p.qty} sp</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-black text-blue-400 text-sm">{fmtShort(p.revenue)}đ</p>
                                        <p className="text-[10px] text-zinc-500 font-bold">{Math.round(pct)}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Bảng đơn hàng gần đây (10 đơn) ── */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl overflow-hidden shadow-xl">
                <div className="px-7 py-5 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black uppercase tracking-tight">Đơn hàng gần đây</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">10 đơn hàng mới nhất (đã thanh toán)</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-zinc-800/40 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
                                <th className="px-6 py-3">Mã đơn</th>
                                <th className="px-6 py-3">Khách hàng</th>
                                <th className="px-6 py-3">Ngày đặt</th>
                                <th className="px-6 py-3">Tổng tiền</th>
                                <th className="px-6 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...paidOrders]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 10)
                                .map(o => {
                                    const statusMap = {
                                        PREPARING: { label: 'Chuẩn bị', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                                        SHIPPING:  { label: 'Đang giao', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                                        DELIVERED: { label: 'Đã giao',   cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
                                    };
                                    const s = statusMap[o.status] || { label: o.status, cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' };
                                    return (
                                        <tr key={o.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition">
                                            <td className="px-6 py-3.5 font-bold text-white">#{o.id}</td>
                                            <td className="px-6 py-3.5">
                                                <p className="font-bold text-zinc-200">{o.username}</p>
                                                <p className="text-[10px] text-zinc-500">{o.phone}</p>
                                            </td>
                                            <td className="px-6 py-3.5 text-zinc-400 text-xs">
                                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td className="px-6 py-3.5 font-black text-blue-400">{fmt(o.totalAmount || 0)}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                            {paidOrders.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-600 font-bold italic">
                                        Chưa có đơn hàng nào được thanh toán.
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

export default RevenueStats;
