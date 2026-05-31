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
            <div className="flex space-x-3 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1877f2] hover:border-[#1877f2] hover:shadow-[0_0_15px_rgba(24,119,242,0.4)] active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent hover:shadow-[0_0_15px_rgba(238,42,123,0.4)] active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#ff0000] hover:border-[#ff0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Cột 2: Danh mục sản phẩm */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Sản phẩm</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/?sport=Bóng đá" className="hover:text-blue-500 transition">Bóng đá</Link></li>
              <li><Link to="/?sport=Bóng rổ" className="hover:text-blue-500 transition">Bóng rổ</Link></li>
              <li><Link to="/?sport=Cầu lông" className="hover:text-blue-500 transition">Cầu lông</Link></li>
              <li><Link to="/?sport=Bóng chuyền" className="hover:text-blue-500 transition">Bóng chuyền</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li className="hover:text-blue-500 cursor-default transition">Chính sách đổi trả</li>
              <li className="hover:text-blue-500 cursor-default transition">Hướng dẫn chọn size</li>
              <li className="hover:text-blue-500 cursor-default transition">Hệ thống cửa hàng</li>
              <li className="hover:text-blue-500 cursor-default transition">Liên hệ</li>
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