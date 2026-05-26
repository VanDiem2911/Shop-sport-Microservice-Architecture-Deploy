import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Filter from './Filter';
import productApi from '../../api/productApi';
import { useSearchParams } from 'react-router-dom';

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]); // Lưu dữ liệu gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Dữ liệu sau khi lọc
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // States dành cho bộ lọc
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || null);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  // States dành cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Đồng bộ URL với state
  useEffect(() => {
    const sport = searchParams.get('sport');
    const cat = searchParams.get('cat');
    setSelectedSport(sport);
    setSelectedCategory(cat);
  }, [searchParams]);

  // Khi state thay đổi, cập nhật URL
  const handleSetCategory = (cat) => {
    if (cat) searchParams.set('cat', cat);
    else searchParams.delete('cat');
    setSearchParams(searchParams);
    setSelectedCategory(cat);
  };

  const handleSetSport = (sport) => {
    if (sport) searchParams.set('sport', sport);
    else searchParams.delete('sport');
    setSearchParams(searchParams);
    setSelectedSport(sport);
  };

  // 1. Fetch data từ Server 1 lần duy nhất
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await productApi.getAll();
        setAllProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  // 2. Logic lọc tổng hợp (Multi-filter)
  useEffect(() => {
    let result = [...allProducts];

    // Lọc theo Môn thể thao (Sport)
    if (selectedSport) {
      result = result.filter(p => p.sport === selectedSport);
    }

    // Lọc theo Loại sản phẩm (Category)
    if (selectedCategory) {
      result = result.filter(p => p.category?.name === selectedCategory);
    }

    // Lọc theo Thương hiệu (Giả sử name sản phẩm có chứa tên brand như 'Nike Mercurial')
    if (selectedBrand) {
      result = result.filter(p => p.name.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    // Lọc theo Giá
    if (selectedPrice) {
      if (selectedPrice === 'under2') result = result.filter(p => p.price < 2000000);
      if (selectedPrice === '2to4') result = result.filter(p => p.price >= 2000000 && p.price <= 4000000);
      if (selectedPrice === 'above4') result = result.filter(p => p.price > 4000000);
    }

    // Sắp xếp sản phẩm theo số lượng đã bán (soldQuantity) giảm dần
    result.sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));

    setFilteredProducts(result);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [selectedSport, selectedCategory, selectedBrand, selectedPrice, allProducts]);

  // Tính toán sản phẩm cho trang hiện tại
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn lên đầu trang danh sách sản phẩm (tùy chọn)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-center py-20 font-black italic text-2xl animate-pulse">LOADING...</div>;

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-1/4">
          <Filter
            selectedSport={selectedSport} setSelectedSport={handleSetSport}
            selectedCategory={selectedCategory} setSelectedCategory={handleSetCategory}
            selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
            selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
          />
        </aside>

        <main className="w-full lg:w-3/4">
          <div className="mb-10 flex justify-between items-end ">
            <div>
              <h2 className="text-3xl font-bold  uppercase italic tracking-tighter text-blue-600">Bộ sưu tập</h2>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">Hiển thị {filteredProducts.length} sản phẩm</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'border-2 border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed">
              <p className="text-gray-400 font-black italic">KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;