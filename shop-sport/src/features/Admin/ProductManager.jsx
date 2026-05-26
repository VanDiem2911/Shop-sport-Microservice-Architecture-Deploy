import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import toast from 'react-hot-toast';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // States for Quick Stock Adjust Modal
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [adjustMode, setAdjustMode] = useState('add'); // 'add' or 'set'
    const [adjustValue, setAdjustValue] = useState(0);
    const [updatingStock, setUpdatingStock] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await productApi.getAll();
            setProducts(res.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            toast.error("Không thể tải danh sách sản phẩm!");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác!")) {
            try {
                await productApi.remove(id);
                toast.success("Xóa sản phẩm thành công!");
                // Cập nhật lại danh sách sau khi xóa
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
                toast.error("Xóa thất bại! Vui lòng thử lại.");
            }
        }
    };

    const handleOpenStockModal = (product) => {
        setSelectedProduct(product);
        setAdjustMode('add');
        setAdjustValue(0);
        setIsStockModalOpen(true);
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        const currentStock = selectedProduct.stock || 0;
        let newStock = currentStock;

        const val = parseInt(adjustValue) || 0;
        if (adjustMode === 'add') {
            newStock = currentStock + val;
        } else {
            newStock = val;
        }

        if (newStock < 0) {
            toast.error("Số lượng tồn kho không thể âm!");
            return;
        }

        setUpdatingStock(true);
        try {
            await productApi.updateStock(selectedProduct.id, newStock);
            toast.success("Cập nhật số lượng tồn kho thành công!");
            
            // Cập nhật state cục bộ
            setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, stock: newStock } : p));
            setIsStockModalOpen(false);
        } catch (error) {
            console.error("Lỗi cập nhật tồn kho:", error);
            toast.error("Cập nhật thất bại! Vui lòng thử lại.");
        } finally {
            setUpdatingStock(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 font-black italic text-2xl animate-pulse text-blue-600">ĐANG TẢI DỮ LIỆU...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Quản trị <span className="text-black-600">Sản phẩm</span></h2>
                    <p className="text-blue-500 font-black mt-1">Tổng cộng: {products.length} sản phẩm</p>
                </div>
                <Link 
                    to="/admin/products/add" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
                >
                    + THÊM SẢN PHẨM MỚI
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest border-b">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Hình ảnh</th>
                                <th className="px-6 py-4">Tên sản phẩm</th>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4">Giá tiền</th>
                                <th className="px-6 py-4">Tồn kho</th>
                                <th className="px-6 py-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-blue-50/50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-500">#{product.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                                            <img 
                                                src={product.imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=200"} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 line-clamp-2">{product.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600 uppercase">
                                            {product.category?.name || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-blue-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${product.stock > 10 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                            {product.stock || 0} sản phẩm
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-3">
                                            <button 
                                                onClick={() => handleOpenStockModal(product)}
                                                className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                                                title="Nhập hàng / Sửa tồn kho"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-black hover:text-white flex items-center justify-center transition"
                                                title="Sửa"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                                                title="Xóa"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-bold italic">
                                        Chưa có sản phẩm nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal cập nhật tồn kho */}
            {isStockModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 mx-4 animate-scaleUp">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
                                Nhập hàng <span className="text-blue-600">tồn kho</span>
                            </h3>
                            <button 
                                onClick={() => setIsStockModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-black hover:text-white flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                            <img 
                                src={selectedProduct.imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=200"} 
                                alt={selectedProduct.name} 
                                className="w-16 h-16 object-cover rounded-xl bg-white shadow-inner"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{selectedProduct.name}</h4>
                                <p className="text-sm font-medium text-gray-500">Tồn kho hiện tại: <span className="font-bold text-gray-800">{selectedProduct.stock || 0} sp</span></p>
                            </div>
                        </div>

                        <form onSubmit={handleStockSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Phương thức điều chỉnh</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustMode('add')}
                                        className={`py-3 rounded-xl font-bold text-sm transition border-2 ${adjustMode === 'add' ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Nhập thêm (+)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdjustMode('set')}
                                        className={`py-3 rounded-xl font-bold text-sm transition border-2 ${adjustMode === 'set' ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Sửa trực tiếp (=)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Số lượng thay đổi</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={adjustValue}
                                    onChange={(e) => setAdjustValue(Math.max(0, parseInt(e.target.value) || 0))}
                                    required
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition text-center text-lg"
                                    placeholder={adjustMode === 'add' ? "Nhập số lượng thêm..." : "Nhập số lượng mới..."}
                                />
                            </div>

                            {/* Xem trước kết quả */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-500">Dự kiến tồn kho mới:</span>
                                <div className="flex items-center space-x-2 font-black">
                                    <span className="text-gray-400 line-through">{selectedProduct.stock || 0}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-blue-600 text-lg">
                                        {adjustMode === 'add' ? (selectedProduct.stock || 0) + (parseInt(adjustValue) || 0) : (parseInt(adjustValue) || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStockModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
                                >
                                    HỦY
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatingStock}
                                    className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {updatingStock ? 'ĐANG LƯU...' : 'CẬP NHẬT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
