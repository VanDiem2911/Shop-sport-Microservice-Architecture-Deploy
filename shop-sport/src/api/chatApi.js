import axiosClient from './axiosClient';

const chatApi = {
  getChatHistory: (username) => {
    return axiosClient.get(`/chats/history?username=${username}`);
  },

  getChatUsers: () => {
    return axiosClient.get('/chats/users');
  }
};

export default chatApi;
