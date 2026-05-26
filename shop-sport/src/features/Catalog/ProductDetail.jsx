import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../Cart/CartContext';
import productApi from '../../api/productApi';
import toast from 'react-hot-toast';
import reviewApi from '../../api/reviewApi';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await productApi.getById(id);
            setProduct(res.data);
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Không tìm thấy sản phẩm!");
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await reviewApi.getReviewsByProduct(id);
            setReviews(response.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá:", error);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 animate-pulse">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded-3xl"></div>
                    <div className="w-full md:w-1/2 space-y-6 pt-6">
                        <div className="h-10 bg-gray-200 rounded-xl w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded-xl w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded-xl w-full mt-10"></div>
                        <div className="h-4 bg-gray-200 rounded-xl w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const isShoe = product.category?.name === 'Giày' || product.name.toLowerCase().includes('giày');
    const isClothing = product.category?.name === 'Áo' || product.category?.name === 'Quần' || 
                       product.name.toLowerCase().includes('áo') || product.name.toLowerCase().includes('quần');
    const requiresSize = isShoe || isClothing;
    
    const sizeOptions = isShoe 
        ? ['38', '39', '40', '41', '42'] 
        : isClothing ? ['S', 'M', 'L', 'XL'] : [];

    const handleAddToCart = () => {
        if (requiresSize && !selectedSize) {
            toast.error("Vui lòng chọn Size trước khi mua!");
            return;
        }
        addToCart(product, requiresSize ? selectedSize : "Standard");
        toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    };

    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 5.0;

    return (
        <div className="container mx-auto px-6 py-12">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center text-sm font-bold text-gray-500 hover:text-black transition">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                QUAY LẠI
            </button>

            <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
                {/* Cột Trái: Ảnh (Đã thu nhỏ lại) */}
                <div className="w-full md:w-5/12 lg:w-4/12">
                    <div className="bg-white p-4 rounded-[3rem] shadow-xl border border-gray-100 relative group overflow-hidden">
                        <img 
                            src={product.imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800"} 
                            alt={product.name} 
                            className="w-full h-auto object-cover rounded-[2.5rem] group-hover:scale-105 transition duration-700"
                        />
                        <div className="absolute top-8 left-8 flex flex-col gap-2">
                            {product.sport && (
                                <span className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase shadow-lg text-white border border-blue-500">
                                {product.sport}
                                </span>
                            )}
                            <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase shadow-lg text-gray-800 border border-gray-100">
                                {product.category?.name || "Khác"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cột Phải: Thông tin chi tiết (Đã mở rộng ra) */}
                <div className="w-full md:w-7/12 lg:w-8/12 pt-4">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
                        {product.name}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-5 h-5 fill-current ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <span className="text-sm font-bold text-gray-400 border-l pl-4 border-gray-200">{reviews.length} Đánh giá</span>
                        <span className="text-sm font-bold text-gray-400 border-l pl-4 border-gray-200">Đã bán: {product.soldQuantity || 0}</span>
                        <span className="text-sm font-bold text-gray-400 border-l pl-4 border-gray-200">Tồn kho: {product.stock || 0}</span>
                    </div>

                    <p className="text-4xl font-black text-blue-600 mb-8 italic">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>

                    <p className="text-gray-500 leading-relaxed mb-10 text-lg">
                        {product.description || "Đây là sản phẩm thể thao cao cấp được phân phối chính hãng bởi SportShop. Thiết kế hiện đại, chất liệu bền bỉ mang lại hiệu suất tối đa cho người sử dụng."}
                    </p>

                    {requiresSize && (
                        <div className="mb-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center">
                                Chọn Size Của Bạn
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {sizeOptions.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-2xl text-lg font-black transition-all flex items-center justify-center border-2 
                                        ${selectedSize === size 
                                            ? 'bg-black text-white border-black shadow-xl scale-110' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <button 
                            onClick={handleAddToCart}
                            className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all duration-300 shadow-xl shadow-blue-200 hover:shadow-gray-200 active:scale-95 flex items-center justify-center"
                        >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            THÊM VÀO GIỎ HÀNG
                        </button>
                    </div>

                    {/* Features list */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-8">
                        <div className="flex items-center text-gray-500 font-medium">
                            <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Chính hãng 100%
                        </div>
                        <div className="flex items-center text-gray-500 font-medium">
                            <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Giao hàng siêu tốc 2H
                        </div>
                    </div>
                </div>
            </div>

            {/* Phần Bình luận & Đánh giá */}
            <div className="mt-24 border-t border-gray-100 pt-16">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Đánh giá khách hàng</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Từ những người đã trải nghiệm thực tế</p>
                    </div>
                    <div className="flex items-center gap-4 bg-blue-50 px-6 py-3 rounded-2xl">
                        <span className="text-3xl font-black text-blue-600">{avgRating}</span>
                        <div className="flex flex-col">
                            <div className="flex text-blue-600">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 fill-current ${i < Math.round(avgRating) ? 'text-blue-600' : 'text-blue-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Dựa trên {reviews.length} đánh giá</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviews.length > 0 ? reviews.map((review, i) => (
                        <div key={review.id || i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black text-white">{review.username?.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{review.username}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-500 mb-4 italic">"{review.content}"</p>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-12 bg-gray-50 rounded-3xl">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
