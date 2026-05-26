import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import productApi from '../../api/productApi';
import toast from 'react-hot-toast';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        imageUrl: '',
        sport: 'Bóng đá', // Mặc định
        category: { id: 1, name: 'Giày' }, // Mặc định
        stock: 0,
        description: ''
    });

    const sports = ['Bóng đá', 'Bóng rổ', 'Cầu lông', 'Chạy bộ', 'Tennis'];

    const categories = [
        { id: 1, name: 'Giày' },
        { id: 2, name: 'Áo' },
        { id: 3, name: 'Quần' },
        { id: 4, name: 'Vợt' },
        { id: 5, name: 'Bóng' },
        { id: 6, name: 'Phụ kiện' }
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId) => {
        try {
            const res = await productApi.getById(productId);
            const data = res.data;
            
            if (data) {
                setFormData({
                    name: data.name || '',
                    price: data.price || '',
                    imageUrl: data.imageUrl || '',
                    sport: data.sport || 'Bóng đá',
                    category: data.category || { id: 1, name: 'Giày' },
                    stock: data.stock !== undefined && data.stock !== null ? data.stock : 0,
                    description: data.description || ''
                });
            }
        } catch (error) {
            console.error("Lỗi tải thông tin sản phẩm:", error);
            toast.error("Không thể tải dữ liệu sản phẩm!");
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'categoryId') {
            const selectedCat = categories.find(c => c.id === parseInt(value));
            setFormData({ ...formData, category: selectedCat });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0
            };

            if (isEditMode) {
                await productApi.update(id, payload);
                toast.success("Cập nhật thành công!");
            } else {
                await productApi.create(payload);
                toast.success("Thêm mới thành công!");
            }
            navigate('/admin/products');
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-black italic text-2xl text-blue-600 animate-pulse">ĐANG TẢI...</div>;

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center mb-8">
                    <Link to="/admin/products" className="mr-4 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                            {isEditMode ? 'Sửa' : 'Thêm'} <span className="text-blue-600">Sản Phẩm</span>
                        </h2>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên sản phẩm</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition"
                                placeholder="Ví dụ: Giày bóng đá Nike..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Giá tiền (VNĐ)</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    required
                                    min="0"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition"
                                    placeholder="Ví dụ: 1500000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Số lượng tồn kho</label>
                                <input 
                                    type="number" 
                                    name="stock" 
                                    value={formData.stock} 
                                    onChange={handleChange} 
                                    required
                                    min="0"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition"
                                    placeholder="Ví dụ: 10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Link Ảnh (URL)</label>
                            <input 
                                type="url" 
                                name="imageUrl" 
                                value={formData.imageUrl} 
                                onChange={handleChange} 
                                required
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mô tả sản phẩm</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition resize-none"
                                placeholder="Nhập mô tả sản phẩm..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Môn thể thao</label>
                                <select 
                                    name="sport" 
                                    value={formData.sport} 
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition cursor-pointer appearance-none"
                                >
                                    {sports.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Loại sản phẩm</label>
                                <select 
                                    name="categoryId" 
                                    value={formData.category.id} 
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl px-4 py-3 font-bold text-gray-800 outline-none transition cursor-pointer appearance-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.imageUrl && (
                            <div className="mt-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Xem trước ảnh</p>
                                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'ĐANG LƯU...' : 'LƯU SẢN PHẨM'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
