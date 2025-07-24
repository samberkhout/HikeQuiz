import { authAPI, userAPI } from '../api/api';
import { setAuthToken, clearAuthToken } from '../api/api';

class UserAgent {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      this.currentUser = user;
      this.isAuthenticated = true;
      setAuthToken(token);
      
      return {
        success: true,
        user: user,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      this.currentUser = user;
      this.isAuthenticated = true;
      setAuthToken(token);
      
      return {
        success: true,
        user: user,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async logout() {
    try {
      this.currentUser = null;
      this.isAuthenticated = false;
      clearAuthToken();
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await userAPI.updateProfile(profileData);
      this.currentUser = { ...this.currentUser, ...response.data };
      
      return {
        success: true,
        user: this.currentUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  }

  async getProfile() {
    try {
      const response = await userAPI.getProfile();
      this.currentUser = response.data;
      
      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  createGuestUser() {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      isGuest: true,
      currentCheckpoint: 0,
      score: 0,
      createdAt: new Date().toISOString()
    };
    
    this.currentUser = guestUser;
    this.isAuthenticated = false;
    
    return guestUser;
  }

  async refreshToken() {
    try {
      const response = await authAPI.refreshToken();
      const { token } = response.data;
      
      setAuthToken(token);
      
      return {
        success: true,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      
      this.logout();
      
      return {
        success: false,
        message: 'Token refresh failed, please login again'
      };
    }
  }

  validateUserData(userData) {
    const errors = [];
    
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Please provide a valid email address');
    }
    
    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getUserStats() {
    if (!this.currentUser) return null;
    
    return {
      id: this.currentUser.id,
      name: this.currentUser.name,
      currentCheckpoint: this.currentUser.currentCheckpoint || 0,
      score: this.currentUser.score || 0,
      isGuest: this.currentUser.isGuest || false,
      memberSince: this.currentUser.createdAt || new Date().toISOString()
    };
  }
}

export default new UserAgent();