import { calculateDistance } from '../utils/location.js';
import demoTrail from '../data/demoTrail.json';
import { checkpointAPI } from '../api/api';

class CheckpointAgent {
  constructor() {
    this.checkpoints = demoTrail.checkpoints;
    this.proximityThreshold = 30; // 30 meters
  }

  async isAtCheckpoint(userCoords, checkpointIndex) {
    try {
      if (checkpointIndex >= this.checkpoints.length) {
        return false;
      }

      const checkpoint = this.checkpoints[checkpointIndex];
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        checkpoint.latitude,
        checkpoint.longitude
      );

      return distance <= this.proximityThreshold;
    } catch (error) {
      console.error('Error checking checkpoint proximity:', error);
      return false;
    }
  }

  async getCheckpointData(checkpointIndex) {
    try {
      if (checkpointIndex >= this.checkpoints.length) {
        throw new Error('Checkpoint not found');
      }

      return this.checkpoints[checkpointIndex];
    } catch (error) {
      console.error('Error getting checkpoint data:', error);
      throw error;
    }
  }

  async getAllCheckpoints() {
    try {
      return this.checkpoints;
    } catch (error) {
      console.error('Error getting all checkpoints:', error);
      return [];
    }
  }

  getDistanceToCheckpoint(userCoords, checkpointIndex) {
    try {
      if (checkpointIndex >= this.checkpoints.length) {
        return null;
      }

      const checkpoint = this.checkpoints[checkpointIndex];
      return calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        checkpoint.latitude,
        checkpoint.longitude
      );
    } catch (error) {
      console.error('Error calculating distance to checkpoint:', error);
      return null;
    }
  }

  getNextCheckpoint(currentCheckpointIndex) {
    const nextIndex = currentCheckpointIndex + 1;
    if (nextIndex >= this.checkpoints.length) {
      return null;
    }
    return {
      index: nextIndex,
      data: this.checkpoints[nextIndex]
    };
  }

  getTotalCheckpoints() {
    return this.checkpoints.length;
  }
}

export default new CheckpointAgent();