import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authApi from '../../api/authApi';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login(credentials);
            const { token, role } = response.data;

            if (token) {
                localStorage.setItem('accessToken', token);
                localStorage.setItem('username', credentials.username);
                if (role) {
                    localStorage.setItem('role', role);
                }

                window.dispatchEvent(new Event("storage"));
                toast.success("Đăng nhập thành công!");
                navigate('/');
            }
        } catch (error) {
            toast.error("Tài khoản hoặc mật khẩu không đúng!");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const response = await authApi.googleLogin(idToken);
            const { token, role, username } = response.data;

            if (token) {
                localStorage.setItem('accessToken', token);
                localStorage.setItem('username', username);
                if (role) {
                    localStorage.setItem('role', role);
                }

                window.dispatchEvent(new Event("storage"));
                toast.success("Đăng nhập bằng Google thành công!");
                navigate('/');
            }
        } catch (error) {
            console.error("Lỗi đăng nhập Google:", error.response?.data || error);
            const msg = error.response?.data?.message || "Đăng nhập bằng Google thất bại!";
            toast.error(msg);
        }
    };

    const handleGoogleError = () => {
        toast.error("Đăng nhập bằng Google thất bại!");
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-transparent">
            <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-10 rounded-[2.5rem] shadow-2xl shadow-purple-900/20">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black italic mb-2 uppercase tracking-tighter">HELLO!</h2>
                    <p className="text-gray-400 font-medium">Sẵn sàng để ra sân chưa?</p>
                </div>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <input name="username" type="text" placeholder="Tên đăng nhập" onChange={handleChange}
                        className="w-full p-4 bg-zinc-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 font-medium placeholder:text-zinc-500" />
                    <input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange}
                        className="w-full p-4 bg-zinc-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 font-medium placeholder:text-zinc-500" />
                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition duration-300 transform active:scale-95">
                        ĐĂNG NHẬP
                    </button>
                </form>

                <div className="relative flex py-6 items-center">
                    <div className="flex-grow border-t border-zinc-700"></div>
                    <span className="flex-shrink mx-4 text-zinc-500 text-xs font-black uppercase tracking-wider">Hoặc</span>
                    <div className="flex-grow border-t border-zinc-700"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>

                <div className="mt-8 text-center text-sm">
                    <span className="text-zinc-400 font-medium">Chưa là thành viên? </span>
                    <Link to="/register" className="text-blue-400 font-black underline">Tham gia ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;