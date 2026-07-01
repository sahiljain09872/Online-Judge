import { authService } from './authService';

const API_URL = '/problems/';
const axios = authService.axios;

export const problemService = {
  // Get all problems
  getProblems: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Get single problem by slug
  getProblemBySlug: async (slug) => {
    const response = await axios.get(API_URL + slug);
    return response.data;
  },
  
  // Get non-hidden test cases for a problem
  getTestCases: async (id) => {
    const response = await axios.get(API_URL + id + '/test-cases');
    return response.data;
  }
};
