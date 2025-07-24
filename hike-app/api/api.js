// Simple mock API service for demo purposes
import demoTrail from '../data/demoTrail.json';

// Mock delay for realistic API feel
const mockDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// Simple token management for demo
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
};

// Mock API implementations for demo
export const authAPI = {
  login: async (credentials) => {
    await mockDelay();
    const mockUser = {
      id: Date.now(),
      name: credentials.username || 'Demo User',
      email: credentials.email || 'demo@example.com'
    };
    const token = `mock_token_${mockUser.id}`;
    setAuthToken(token);
    return { data: { user: mockUser, token } };
  },
  
  register: async (userData) => {
    await mockDelay();
    const mockUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email
    };
    const token = `mock_token_${mockUser.id}`;
    setAuthToken(token);
    return { data: { user: mockUser, token } };
  },
  
  refreshToken: async () => {
    await mockDelay();
    return { data: { token: authToken } };
  }
};

export const userAPI = {
  getProfile: async () => {
    await mockDelay();
    return {
      data: {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        currentCheckpoint: 0,
        score: 0
      }
    };
  },
  
  updateProfile: async (data) => {
    await mockDelay();
    return { data };
  },
  
  updateProgress: async (userId, progress) => {
    await mockDelay();
    return { data: progress };
  }
};

export const checkpointAPI = {
  getAll: async () => {
    await mockDelay();
    return { data: demoTrail.checkpoints };
  },
  
  getById: async (id) => {
    await mockDelay();
    return { data: demoTrail.checkpoints[id] };
  },
  
  checkProximity: async (coords, checkpointId) => {
    await mockDelay();
    // Simple proximity check
    return { data: { withinRange: true } };
  }
};

export const questionAPI = {
  getByCheckpoint: async (checkpointId) => {
    await mockDelay();
    const question = demoTrail.questions.find(q => q.checkpointId === checkpointId);
    return { data: question };
  },
  
  submitAnswer: async (questionId, answer) => {
    await mockDelay();
    const question = demoTrail.questions.find(q => q.id === questionId);
    const correct = question ? answer === question.correctAnswer : false;
    return { data: { correct, points: correct ? 10 : 0 } };
  }
};

export const scoreAPI = {
  getLeaderboard: async () => {
    await mockDelay();
    return { data: [] };
  },
  
  getUserScores: async (userId) => {
    await mockDelay();
    return { data: { totalScore: 0, completedCheckpoints: 0 } };
  },
  
  submitScore: async (scoreData) => {
    await mockDelay();
    return { data: scoreData };
  }
};

// Simple mock API object for compatibility
const api = {
  get: async (url) => ({ data: {} }),
  post: async (url, data) => ({ data }),
  put: async (url, data) => ({ data }),
  delete: async (url) => ({ data: {} })
};

export default api;