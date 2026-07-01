import { authService } from './authService';

const API_URL = '/submissions/';
const axios = authService.axios;

export const submissionService = {
  submitCode: async (problemId, code, language) => {
    const response = await axios.post(API_URL, { problemId, code, language });
    return response.data;
  },

  // Submit code just for sample run
  runCode: async (problemId, code, language, customInput = null) => {
    const payload = { problemId, code, language };
    if (customInput !== null) {
      payload.customInput = customInput;
    }
    const response = await axios.post(`${API_URL}run`, payload);
    return response.data;
  },

  getSubmission: async (submissionId) => {
    const response = await axios.get(API_URL + submissionId);
    return response.data.submission;
  },

  getMySubmissions: async () => {
    const response = await axios.get(API_URL + 'my');
    return response.data;
  },

  getProblemSubmissions: async (problemId) => {
    const response = await axios.get(API_URL + 'problem/' + problemId);
    return response.data;
  }
};

