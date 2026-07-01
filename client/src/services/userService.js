import { authService } from './authService';

const API_URL = '/users/';
const axios = authService.axios;

export const userService = {
  getProfile: async (userId) => {
    const response = await axios.get(`${API_URL}${userId}/profile`);
    return response.data;
  }
};
