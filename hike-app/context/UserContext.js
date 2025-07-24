import React, { createContext, useContext, useReducer, useEffect } from 'react';
import UserAgent from '../agents/UserAgent';
import ProgressAgent from '../agents/ProgressAgent';

const UserContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  progress: null,
  visitedCheckpoints: new Set(),
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null,
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    
    case 'UPDATE_USER_SCORE':
      return {
        ...state,
        user: {
          ...state.user,
          score: action.payload,
        },
      };
    
    case 'UPDATE_USER_CHECKPOINT':
      return {
        ...state,
        user: {
          ...state.user,
          currentCheckpoint: action.payload,
        },
      };
    
    case 'MARK_CHECKPOINT_VISITED':
      return {
        ...state,
        visitedCheckpoints: new Set([...state.visitedCheckpoints, action.payload]),
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
      };
    
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (UserAgent.isUserAuthenticated()) {
        const profileResult = await UserAgent.getProfile();
        if (profileResult.success) {
          dispatch({ type: 'SET_USER', payload: profileResult.user });
          
          const progress = await ProgressAgent.syncProgress(profileResult.user.id);
          dispatch({ type: 'SET_PROGRESS', payload: progress });
        } else {
          createGuestUser();
        }
      } else {
        createGuestUser();
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      createGuestUser();
    }
  };

  const createGuestUser = () => {
    const guestUser = UserAgent.createGuestUser();
    dispatch({ type: 'SET_USER', payload: guestUser });
  };

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await UserAgent.login(credentials);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        
        const progress = await ProgressAgent.syncProgress(result.user.id);
        dispatch({ type: 'SET_PROGRESS', payload: progress });
        
        return { success: true, message: result.message };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const validation = UserAgent.validateUserData(userData);
      if (!validation.isValid) {
        dispatch({ type: 'SET_ERROR', payload: validation.errors.join(', ') });
        return { success: false, message: validation.errors.join(', ') };
      }

      const result = await UserAgent.register(userData);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        return { success: true, message: result.message };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await UserAgent.logout();
      dispatch({ type: 'LOGOUT' });
      createGuestUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProgress = async (progressUpdate) => {
    if (!state.user) return;
    
    try {
      const updatedProgress = await ProgressAgent.updateProgress(state.user.id, progressUpdate);
      dispatch({ type: 'SET_PROGRESS', payload: updatedProgress });
      
      if (progressUpdate.score !== undefined) {
        dispatch({ type: 'UPDATE_USER_SCORE', payload: progressUpdate.score });
      }
      
      if (progressUpdate.currentCheckpoint !== undefined) {
        dispatch({ type: 'UPDATE_USER_CHECKPOINT', payload: progressUpdate.currentCheckpoint });
      }
      
      return updatedProgress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const setUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const markCheckpointVisited = (checkpointIndex) => {
    dispatch({ type: 'MARK_CHECKPOINT_VISITED', payload: checkpointIndex });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProgress,
    setUser,
    markCheckpointVisited,
    clearError,
    getUserStats: () => UserAgent.getUserStats(),
    getProgressSummary: () => state.user ? ProgressAgent.getProgressSummary(state.user.id) : null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };