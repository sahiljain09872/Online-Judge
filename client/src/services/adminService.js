import { authService } from './authService';

const API_URL = '/problems/';
const axios = authService.axios;

export const adminService = {
  // Create a new problem
  createProblem: async (problemData) => {
    const response = await axios.post(API_URL, problemData);
    return response.data;
  },

  // Update an existing problem
  updateProblem: async (problemId, problemData) => {
    const response = await axios.put(`${API_URL}${problemId}`, problemData);
    return response.data;
  },

  // Delete a problem
  deleteProblem: async (problemId) => {
    const response = await axios.delete(`${API_URL}${problemId}`);
    return response.data;
  },

  // Add a test case to a problem
  addTestCase: async (problemId, testCaseData) => {
    const response = await axios.post(`${API_URL}${problemId}/test-cases`, testCaseData);
    return response.data;
  },
  
  // Get all test cases for a problem (including hidden)
  getTestCases: async (problemId) => {
    const response = await axios.get(`${API_URL}${problemId}/test-cases`);
    return response.data.data;
  }
};
