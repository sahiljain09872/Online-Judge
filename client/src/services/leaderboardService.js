import { authService } from './authService';

const API_URL = '/leaderboard';
const axios = authService.axios;

export const leaderboardService = {
  getLeaderboard: async (page = 1, limit = 50) => {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
    return response.data;
  }
};
