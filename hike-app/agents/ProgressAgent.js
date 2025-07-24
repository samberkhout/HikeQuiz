import { userAPI } from '../api/api';

class ProgressAgent {
  constructor() {
    this.progressData = new Map();
  }

  async updateProgress(userId, progressUpdate) {
    try {
      const currentProgress = this.getProgress(userId) || {
        currentCheckpoint: 0,
        score: 0,
        completedCheckpoints: [],
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const updatedProgress = {
        ...currentProgress,
        ...progressUpdate,
        lastUpdated: new Date().toISOString()
      };

      if (progressUpdate.currentCheckpoint !== undefined) {
        if (!updatedProgress.completedCheckpoints.includes(progressUpdate.currentCheckpoint - 1)) {
          updatedProgress.completedCheckpoints.push(progressUpdate.currentCheckpoint - 1);
        }
      }

      this.progressData.set(userId, updatedProgress);

      try {
        await userAPI.updateProgress(userId, updatedProgress);
      } catch (apiError) {
        console.warn('Failed to sync progress to server:', apiError.message);
      }

      return updatedProgress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  getProgress(userId) {
    return this.progressData.get(userId) || null;
  }

  async syncProgress(userId) {
    try {
      const response = await userAPI.getProfile();
      if (response.data && response.data.progress) {
        this.progressData.set(userId, response.data.progress);
        return response.data.progress;
      }
    } catch (error) {
      console.warn('Failed to sync progress from server:', error.message);
    }
    
    return this.getProgress(userId);
  }

  calculateCompletionPercentage(userId) {
    const progress = this.getProgress(userId);
    if (!progress) return 0;

    const totalCheckpoints = 3; // Based on demo trail
    return Math.round((progress.completedCheckpoints.length / totalCheckpoints) * 100);
  }

  getTimeSpent(userId) {
    const progress = this.getProgress(userId);
    if (!progress || !progress.startTime) return 0;

    const startTime = new Date(progress.startTime);
    const currentTime = new Date();
    return Math.round((currentTime - startTime) / 1000 / 60); // minutes
  }

  isCheckpointCompleted(userId, checkpointIndex) {
    const progress = this.getProgress(userId);
    if (!progress) return false;

    return progress.completedCheckpoints.includes(checkpointIndex);
  }

  getNextCheckpoint(userId) {
    const progress = this.getProgress(userId);
    if (!progress) return 0;

    return progress.currentCheckpoint || 0;
  }

  resetProgress(userId) {
    const resetData = {
      currentCheckpoint: 0,
      score: 0,
      completedCheckpoints: [],
      startTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.progressData.set(userId, resetData);
    return resetData;
  }

  getProgressSummary(userId) {
    const progress = this.getProgress(userId);
    if (!progress) {
      return {
        exists: false,
        message: 'No progress data found'
      };
    }

    const totalCheckpoints = 3;
    const completedCount = progress.completedCheckpoints.length;
    const completionPercentage = this.calculateCompletionPercentage(userId);
    const timeSpent = this.getTimeSpent(userId);

    return {
      exists: true,
      currentCheckpoint: progress.currentCheckpoint,
      score: progress.score,
      completedCheckpoints: completedCount,
      totalCheckpoints: totalCheckpoints,
      completionPercentage: completionPercentage,
      timeSpent: timeSpent,
      isComplete: completedCount >= totalCheckpoints,
      lastUpdated: progress.lastUpdated
    };
  }
}

export default new ProgressAgent();