import axiosClient from "./axiosClient";

const authApi = {
    login(data) {
        return axiosClient.post('/auth/login', data);
    },
    googleLogin(idToken) {
        return axiosClient.post('/auth/google', { idToken });
    },
    register(data) {
        return axiosClient.post('/auth/register', data);
    },
    getUserInfo(username) {
        return axiosClient.get(`/auth/user/${username}`);
    },
    updateUserInfo(username, data) {
        return axiosClient.put(`/auth/user/${username}`, data);
    }
};

export default authApi;