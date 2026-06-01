import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productApi from '../../api/productApi';
import ProductCard from './ProductCard';
import { removeDiacritics } from '../../utils/stringHelper';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // 1. Tải tất cả sản phẩm về để thực hiện tìm kiếm
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.getAll();
        setProducts(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // 2. Lọc sản phẩm theo từ khóa (Không phân biệt chữ hoa/thường, không phân biệt dấu tiếng Việt)
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    
    const normalizedQuery = removeDiacritics(query.toLowerCase().trim());
    return products.filter(p => {
      const nameMatch = removeDiacritics(p.name.toLowerCase()).includes(normalizedQuery);
      const categoryMatch = p.category?.name && removeDiacritics(p.category.name.toLowerCase()).includes(normalizedQuery);
      const sportMatch = p.sport && removeDiacritics(p.sport.toLowerCase()).includes(normalizedQuery);
      return nameMatch || categoryMatch || sportMatch;
    });
  }, [query, products]);

  // 3. Sản phẩm gợi ý (Hiển thị ngẫu nhiên một số sản phẩm khi không tìm thấy kết quả nào)
  const suggestedProducts = useMemo(() => {
    if (filteredProducts.length > 0) return [];
    // Lấy tối đa 3 sản phẩm bán chạy hoặc ngẫu nhiên
    return [...products]
      .sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0))
      .slice(0, 3);
  }, [filteredProducts, products]);

  // Phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold italic text-blue-600 animate-pulse uppercase tracking-widest">Đang tìm kiếm sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 lg:px-8 py-16">
      
      {/* Tiêu đề kết quả */}
      <div className="mb-12 border-b border-zinc-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-blue-400 tracking-widest mb-2">Trang tìm kiếm</p>
          <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase">
            Kết quả cho: <span className="text-blue-400">"{query}"</span>
          </h2>
        </div>
        <p className="text-sm font-bold text-zinc-400 bg-zinc-800/60 px-4 py-2 rounded-2xl border border-zinc-700 flex-shrink-0">
          Tìm thấy <span className="text-blue-400 font-black">{filteredProducts.length}</span> sản phẩm phù hợp
        </p>
      </div>

      {/* Hiển thị kết quả */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-2.5 border border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Trước
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-11 h-11 rounded-2xl font-bold text-sm flex items-center justify-center transition-all duration-300 ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                      : 'border border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 border border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        /* Giao diện khi không tìm thấy sản phẩm */
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16 px-8 bg-zinc-900/60 rounded-[3rem] border border-dashed border-zinc-700 mb-16 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-900/40 text-blue-400 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-wide">Không tìm thấy sản phẩm nào</h3>
            <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-6">
              Chúng tôi không tìm thấy kết quả phù hợp cho từ khóa <span className="font-bold text-white">"{query}"</span>. Bạn hãy thử tìm kiếm bằng các từ khóa khác hoặc tham khảo các gợi ý dưới đây.
            </p>
            
            {/* Gợi ý tìm kiếm */}
            <div className="text-left bg-zinc-800/60 p-6 rounded-2xl border border-zinc-700 max-w-sm w-full">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-3">Mẹo tìm kiếm:</p>
              <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                <li>Kiểm tra xem bạn viết đúng chính tả chưa.</li>
                <li>Sử dụng các từ khóa đơn giản, thông dụng (ví dụ: "giày", "vợt", "áo").</li>
                <li>Thử tìm kiếm theo tên môn thể thao (ví dụ: "Bóng đá", "Cầu lông").</li>
              </ul>
            </div>
          </div>

          {/* Phần gợi ý sản phẩm bán chạy */}
          {suggestedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h4 className="text-lg font-black uppercase text-gray-900 tracking-wide">Sản phẩm gợi ý cho bạn</h4>
                <Link to="/" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider">Xem tất cả</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {suggestedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
