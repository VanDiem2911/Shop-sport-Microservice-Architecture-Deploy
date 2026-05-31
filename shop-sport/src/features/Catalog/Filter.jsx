import React from 'react';

const Filter = ({ selectedCategory, setSelectedCategory, selectedBrand, setSelectedBrand, selectedPrice, setSelectedPrice }) => {
  const categories = [
    { label: 'Giày', value: 'Giày' },
    { label: 'Áo', value: 'Áo' },
    { label: 'Quần', value: 'Quần' },
    { label: 'Vợt', value: 'Vợt' },
    { label: 'Bóng', value: 'Bóng' },
    { label: 'Phụ kiện', value: 'Phụ kiện' }
  ];

  const brands = ['Nike', 'Adidas', 'Puma', 'Yonex', 'Wilson'];

  const priceRanges = [
    { label: 'Dưới 2 triệu', value: 'under2' },
    { label: '2tr - 4 triệu', value: '2to4' },
    { label: 'Trên 4 triệu', value: 'above4' },
  ];

  return (
    <div className="space-y-10 pr-4">

      {/* 1b. Loại sản phẩm */}
      <div>
        <h3 className="text-sm font-black uppercase mb-5 flex items-center italic">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Loại sản phẩm
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${!selectedCategory ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-blue-600'}`}
          >
            Tất cả loại
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.value}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${selectedCategory === cat.value ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-blue-600'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Thương hiệu */}
      <div>
        <h3 className="text-sm font-black uppercase mb-5 flex items-center italic">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Thương hiệu
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {brands.map((brand) => (
            <button 
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${selectedBrand === brand ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-500 hover:border-blue-600'}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mức giá */}
      <div>
        <h3 className="text-sm font-black uppercase mb-5 flex items-center italic">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Mức giá
        </h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex items-center space-x-3 cursor-pointer group">
              <input type="radio" name="price" className="form-radio text-blue-600" checked={selectedPrice === range.value} onChange={() => setSelectedPrice(range.value)} />
              <span className={`text-sm ${selectedPrice === range.value ? 'text-black font-bold' : 'text-gray-500'}`}>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={() => { setSelectedCategory(null); setSelectedBrand(null); setSelectedPrice(null); }} className="w-full py-3 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-red-500 hover:text-red-500 transition">
        Xóa bộ lọc
      </button>
    </div>
  );
};

export default Filter;