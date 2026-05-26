import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../features/Cart/CartContext'; // 1. Import hook useCart
import productApi from '../../api/productApi';
import { removeDiacritics } from '../../utils/stringHelper';

const Header = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Lazily initialize states from LocalStorage to avoid set-state-in-effect errors on mount
    const [username, setUsername] = useState(() => {
        const token = localStorage.getItem('accessToken');
        return token ? localStorage.getItem('username') : null;
    });
    const [email, setEmail] = useState(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        const storedUser = localStorage.getItem('username');
        return localStorage.getItem('email') || (storedUser ? `${storedUser.toLowerCase()}@example.com` : null);
    });
    const [role, setRole] = useState(() => {
        const token = localStorage.getItem('accessToken');
        return token ? localStorage.getItem('role') : null;
    });
    
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [products, setProducts] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load products on focus for search autocomplete suggestions
    const handleFocus = async () => {
        setShowSuggestions(true);
        if (products.length === 0) {
            try {
                const res = await productApi.getAll();
                setProducts(res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm gợi ý:", err);
            }
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 250);
    };

    // Filter suggestions by accent-insensitive search query using derived state (useMemo)
    const suggestions = useMemo(() => {
        if (!searchTerm.trim()) return [];

        const normalizedQuery = removeDiacritics(searchTerm);
        return products
            .filter(p => removeDiacritics(p.name).includes(normalizedQuery))
            .slice(0, 6);
    }, [searchTerm, products]);
    
    const { cartItems } = useCart();
    const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email') || (storedUser ? `${storedUser.toLowerCase()}@example.com` : null);
        const storedRole = localStorage.getItem('role');
        
        if (token && storedUser) {
            setUsername(storedUser);
            setEmail(storedEmail);
            setRole(storedRole);
        } else {
            setUsername(null);
            setEmail(null);
            setRole(null);
        }
    };

    useEffect(() => {
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    useEffect(() => {
        const query = searchParams.get('search') || "";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchTerm(query);
    }, [searchParams]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.dispatchEvent(new Event("storage"));
        setShowUserMenu(false);
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-8">
                    
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 group">
                        <div className="text-2xl font-black italic tracking-tighter flex items-center">
                            <span className="text-blue-600 group-hover:scale-110 transition duration-300">SPORT</span>
                            <span className="text-black ml-1">SHOP</span>
                        </div>
                    </Link>

                    {/* Search Bar - Center */}
                    <div className="hidden lg:flex flex-grow max-w-xl">
                        <form onSubmit={handleSearch} className="relative w-full group">
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Tìm kiếm giày bóng đá, vợt cầu lông..."
                                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 rounded-2xl py-3 px-12 text-sm font-medium transition-all duration-300"
                                autoComplete="off"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl hover:bg-blue-700 transition">
                                TÌM
                            </button>

                            {/* Autocomplete Search Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                    <div className="py-2 divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
                                        {suggestions.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => {
                                                    setShowSuggestions(false);
                                                    navigate(`/product/${product.id}`);
                                                }}
                                                className="flex items-center px-6 py-3.5 hover:bg-blue-50/50 cursor-pointer transition duration-200 group"
                                            >
                                                <img 
                                                    src={product.imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=300"} 
                                                    alt={product.name} 
                                                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                                                />
                                                <div className="flex-grow min-w-0 ml-4">
                                                    <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                        {product.sport || "Khác"} • {product.category?.name || "Sản phẩm"}
                                                    </p>
                                                </div>
                                                <div className="ml-4 text-right">
                                                    <p className="text-blue-600 font-black text-sm italic">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
                                        <button
                                            type="submit"
                                            className="text-xs font-black text-blue-600 hover:text-blue-700 tracking-wider uppercase inline-block"
                                        >
                                            Xem tất cả kết quả cho "{searchTerm}"
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Section: Navigation & Profile */}
                    <div className="flex items-center gap-2 lg:gap-6">
                        
                        {/* Nav Links */}
                        <nav className="hidden xl:flex items-center gap-6 mr-4 border-r border-gray-100 pr-6">
                            <Link to="/?sport=Bóng đá" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition">Bóng đá</Link>
                            <Link to="/?sport=Cầu lông" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition">Cầu lông</Link>
                            {username && (
                                <Link to="/orders" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition relative">
                                    Đơn hàng
                                    <span className="absolute -top-1 -right-1 w-1 h-1 bg-red-500 rounded-full animate-ping"></span>
                                </Link>
                            )}
                        </nav>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-xl transition group">
                            <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalQuantity > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center border-2 border-white">
                                    {totalQuantity}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        <div className="relative ml-2">
                            {username ? (
                                <>
                                    <button 
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 p-1 pl-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-transparent hover:border-gray-200 transition duration-300"
                                    >
                                        <div className="hidden md:block text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Thành viên</p>
                                            <p className="text-xs font-black text-gray-800 leading-none">{username}</p>
                                        </div>
                                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-6 py-4 border-b border-gray-50 mb-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Xin chào!</p>
                                                <p className="font-black text-gray-900 truncate">{username}</p>
                                                <p className="text-[10px] text-blue-600 font-bold truncate opacity-70">{email}</p>
                                            </div>
                                            
                                            <div className="px-2 space-y-1">
                                                <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-3 hover:bg-blue-50 text-gray-700 text-sm font-bold rounded-2xl transition">
                                                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    Thông tin cá nhân
                                                </Link>

                                                <Link to="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-3 hover:bg-blue-50 text-gray-700 text-sm font-bold rounded-2xl transition">
                                                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                                    Đơn mua của tôi
                                                </Link>

                                                {role === 'ROLE_ADMIN' && (
                                                    <div className="pt-2 mt-2 border-t border-gray-50">
                                                        <p className="px-4 py-1 text-[9px] font-black text-red-400 uppercase tracking-widest">Quản trị viên</p>
                                                        <Link to="/admin/products" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-3 hover:bg-red-50 text-red-600 text-sm font-bold rounded-2xl transition">
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                                                            Quản lý Sản phẩm
                                                        </Link>
                                                        <Link to="/admin/orders" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-3 hover:bg-blue-50 text-blue-600 text-sm font-bold rounded-2xl transition">
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                                            Quản lý Đơn hàng
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-6 py-4 mt-2 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition border-t border-gray-50"
                                            >
                                                Đăng xuất tài khoản
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link to="/login" className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition duration-300">
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;