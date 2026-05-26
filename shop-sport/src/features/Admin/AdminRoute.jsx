import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('accessToken');

    if (!token) {
        // Chưa đăng nhập -> Về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    if (role !== 'ROLE_ADMIN') {
        // Có đăng nhập nhưng không phải admin -> Về trang chủ
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
