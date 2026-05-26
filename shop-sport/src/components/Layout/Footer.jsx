import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-black italic text-blue-500">
              SPORT<span className="text-white">SHOP</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nâng tầm trải nghiệm thể thao của bạn với những trang bị hàng đầu từ các thương hiệu danh tiếng thế giới.
            </p>
            <div className="flex space-x-4 pt-2">
              <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition">FB</span>
              <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition">IG</span>
              <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition">YT</span>
            </div>
          </div>

          {/* Cột 2: Danh mục sản phẩm */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Sản phẩm</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/soccer" className="hover:text-white transition">Bóng đá</Link></li>
              <li><Link to="/basketball" className="hover:text-white transition">Bóng rổ</Link></li>
              <li><Link to="/badminton" className="hover:text-white transition">Cầu lông</Link></li>
              <li><Link to="/volleyball" className="hover:text-white transition">Bóng chuyền</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link href="#" className="hover:text-white transition">Chính sách đổi trả</Link></li>
              <li><Link href="#" className="hover:text-white transition">Hướng dẫn chọn size</Link></li>
              <li><Link href="#" className="hover:text-white transition">Hệ thống cửa hàng</Link></li>
              <li><Link href="#" className="hover:text-white transition">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận tin */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Bản tin</h4>
            <p className="text-gray-400 text-xs mb-4">Đăng ký để nhận thông báo về các ưu đãi mới nhất.</p>
            <div className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button className="bg-white text-black py-3 rounded-xl font-bold text-xs uppercase hover:bg-blue-500 hover:text-white transition duration-300">
                Đăng ký ngay
              </button>
            </div>
          </div>

        </div>

        {/* Bản quyền */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 SportShop Microservices. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;