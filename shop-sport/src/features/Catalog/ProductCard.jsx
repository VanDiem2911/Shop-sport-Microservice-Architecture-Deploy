import React, { useState } from 'react';
import { useCart } from '../Cart/CartContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // Phân loại sản phẩm để hiển thị Size phù hợp
  const isShoe = product.category?.name === 'Giày' || 
                 product.name.toLowerCase().includes('giày');

  const isClothing = product.category?.name === 'Áo' || 
                     product.category?.name === 'Quần' ||
                     product.name.toLowerCase().includes('áo') || 
                     product.name.toLowerCase().includes('quần');

  const requiresSize = isShoe || isClothing;
  
  const sizeOptions = isShoe 
    ? ['38', '39', '40', '41', '42'] 
    : isClothing ? ['S', 'M', 'L', 'XL'] : [];

  const [selectedSize, setSelectedSize] = useState(requiresSize ? sizeOptions[0] : null);

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      toast.error('Vui lòng chọn Size trước khi mua!');
      return;
    }
    addToCart(product, requiresSize ? selectedSize : "Standard");
    
  };

  return (
    <div className="group border border-gray-100 rounded-[2.5rem] p-5 hover:-translate-y-2 hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-300 bg-white flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="bg-gray-50 h-64 rounded-3xl mb-4 overflow-hidden relative block cursor-pointer">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=600"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.sport && (
            <span className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm text-white border border-blue-500">
              {product.sport}
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm text-gray-800 border border-gray-100">
            {product.category?.name || "Khác"}
          </span>
        </div>
      </Link>

      <div className="flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-800 text-lg mb-1 truncate hover:text-blue-600 transition-colors duration-200">{product.name}</h3>
        </Link>
        <div className="flex justify-between items-center mb-4">
          <p className="text-blue-600 font-black text-xl italic">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            Đã bán: {product.soldQuantity || 0}
          </span>
        </div>

        {/* Chọn Size - Chỉ hiện nếu là Giày hoặc Quần áo */}
        {requiresSize && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Chọn Size:</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center border-2 ${selectedSize === size ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105' : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleAddToCart}
        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 active:scale-[0.98] transform mt-auto"
      >
        THÊM VÀO GIỎ
      </button>
    </div>
  );
};

export default ProductCard;