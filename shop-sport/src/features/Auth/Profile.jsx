import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    role: '',
  });

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!token || !username) {
      toast.error('Vui lòng đăng nhập để xem thông tin cá nhân!');
      navigate('/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await authApi.getUserInfo(username);
        const data = response.data;
        setUserInfo({
          username: data.username || username,
          email: data.email || (username ? `${username.toLowerCase()}@example.com` : ''),
          phone: data.phone || '',
          address: data.address || '',
          role: data.role || 'ROLE_USER',
        });
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        toast.error('Không thể tải thông tin cá nhân.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [username, token, navigate]);

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authApi.updateUserInfo(username, {
        address: userInfo.address,
        phone: userInfo.phone,
      });
      toast.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const roleLabel = userInfo.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Thành viên';

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-100/50 overflow-hidden transition-all duration-500 hover:shadow-indigo-100/50">
        
        {/* Banner header với gradient đẹp mắt */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex items-end">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-200 to-indigo-900"></div>
          <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-black tracking-widest uppercase shadow-sm">
            {roleLabel}
          </div>
          
          {/* Avatar container chồng lên mép */}
          <div className="relative translate-y-12 translate-x-8 sm:translate-x-12 flex items-end gap-5">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl sm:text-5xl font-black italic tracking-tighter select-none transform hover:rotate-3 transition duration-300">
              {userInfo.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-black italic text-white drop-shadow-md uppercase tracking-tight">
                {userInfo.username}
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm font-bold drop-shadow-sm opacity-90">
                {userInfo.email}
              </p>
            </div>
          </div>
        </div>

        {/* Thân trang thông tin */}
        <div className="pt-20 px-8 sm:px-12 pb-12">
          <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase text-gray-900 tracking-tight flex items-center">
                <span className="w-3.5 h-3.5 bg-blue-600 rounded-full mr-3 animate-pulse"></span>
                Hồ sơ cá nhân
              </h2>
              <p className="text-xs text-gray-400 font-semibold mt-1">Cập nhật số điện thoại và địa chỉ giao nhận hàng của bạn.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Cột 1: Thông tin tài khoản (Chỉ đọc) */}
              <div className="space-y-6 bg-gray-50/50 p-6 sm:p-8 rounded-[2rem] border border-gray-100/80">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">Tài khoản & Email</h3>
                
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Tên đăng nhập</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      value={userInfo.username} 
                      disabled 
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200/50 rounded-2xl text-gray-500 font-bold outline-none cursor-not-allowed select-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Địa chỉ Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
                      </svg>
                    </span>
                    <input 
                      type="email" 
                      value={userInfo.email} 
                      disabled 
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200/50 rounded-2xl text-gray-500 font-bold outline-none cursor-not-allowed select-none text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-2 italic">* Để thay đổi Email hoặc Tên đăng nhập, vui lòng liên hệ CSKH.</p>
                </div>
              </div>

              {/* Cột 2: Thông tin giao hàng (Có thể chỉnh sửa) */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Thông tin liên lạc</h3>

                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">Số điện thoại</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <input 
                      type="tel" 
                      name="phone"
                      value={userInfo.phone} 
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại của bạn"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold text-gray-800 outline-none transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">Địa chỉ nhận hàng</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-6 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <textarea 
                      name="address"
                      value={userInfo.address} 
                      onChange={handleChange}
                      rows="3"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold text-gray-800 outline-none transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-100 resize-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Nút lưu */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-4 border-2 border-gray-200 rounded-2xl font-black text-xs text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all duration-300 uppercase tracking-widest text-center cursor-pointer"
              >
                Về Trang chủ
              </button>
              
              <button 
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>Lưu Thay Đổi</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
