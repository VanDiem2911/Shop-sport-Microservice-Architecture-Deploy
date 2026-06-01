import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const Register = () => {
  const navigate = useNavigate();
  
  // 1. Khởi tạo State khớp với Entity Backend
  const [formData, setFormData] = useState({
    ho: '',
    ten: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_USER' // Mặc định role
  });

  // 2. Hàm xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Hàm gửi dữ liệu đi
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      // Gọi API register từ file authApi.js đã viết ở trên
      const response = await authApi.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role
      });

      console.log("Đăng ký thành công:", response.data);
      alert("Chào mừng thành viên mới! Hãy đăng nhập nhé.");
      navigate('/login');
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert(error.response?.data?.message || "Đăng ký thất bại, vui lòng kiểm tra lại!");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 bg-transparent py-12">
      <div className="max-w-xl w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-10 rounded-[2.5rem] shadow-2xl shadow-purple-900/20">
        
        {/* Tiêu đề */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Gia nhập đội ngũ</h2>
          <p className="text-gray-400 font-medium">Đăng ký thành viên để nhận ưu đãi và quản lý đơn hàng.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Group: Họ và Tên */}

          {/* Email */}
          <input 
            name="email"
            type="email" 
            placeholder="Địa chỉ Email" 
            onChange={handleChange}
            className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none font-medium"
          />

          {/* Tên đăng nhập */}
          <input 
            name="username"
            type="text" 
            placeholder="Tên đăng nhập" 
            onChange={handleChange}
            className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none font-medium"
          />

          {/* Mật khẩu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              name="password"
              type="password" 
              placeholder="Mật khẩu" 
              onChange={handleChange}
              className="w-full p-4 bg-zinc-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 font-medium placeholder:text-zinc-500"
            />
            <input 
              name="confirmPassword"
              type="password" 
              placeholder="Xác nhận mật khẩu" 
              onChange={handleChange}
              className="w-full p-4 bg-zinc-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 font-medium placeholder:text-zinc-500"
            />
          </div>

          {/* Điều khoản */}
          <div className="flex items-start space-x-3 py-2 px-1">
            <input required type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Tôi đồng ý với các <span className="text-blue-600 font-bold underline cursor-pointer">Điều khoản dịch vụ</span> và <span className="text-blue-600 font-bold underline cursor-pointer">Chính sách bảo mật</span> của SportShop.
            </p>
          </div>

          {/* Nút Đăng ký */}
          <button 
            type="submit"
            className="w-full bg-black text-white py-5 rounded-2xl font-black shadow-lg hover:bg-blue-600 transition duration-300 transform active:scale-95 uppercase tracking-widest text-sm"
          >
            Tạo tài khoản ngay
          </button>
        </form>

        {/* Chuyển hướng sang Login */}
        <div className="mt-10 pt-8 border-t border-zinc-700 text-center text-sm">
          <span className="text-zinc-400 font-medium">Bạn đã có tài khoản rồi? </span>
          <Link to="/login" className="text-blue-600 font-black underline hover:text-blue-700 transition">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;