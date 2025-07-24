import { calculateDistance, calculateBearing } from '../utils/location.js';
import demoTrail from '../data/demoTrail.json';

class RouteAgent {
  constructor() {
    this.trail = demoTrail;
    this.checkpoints = demoTrail.checkpoints;
  }

  getRouteToNextCheckpoint(userCoords, currentCheckpointIndex) {
    try {
      const nextCheckpointIndex = currentCheckpointIndex + 1;
      
      if (nextCheckpointIndex >= this.checkpoints.length) {
        return {
          hasNext: false,
          message: 'You have completed all checkpoints!'
        };
      }

      const nextCheckpoint = this.checkpoints[nextCheckpointIndex];
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        nextCheckpoint.latitude,
        nextCheckpoint.longitude
      );

      const bearing = calculateBearing(
        userCoords.latitude,
        userCoords.longitude,
        nextCheckpoint.latitude,
        nextCheckpoint.longitude
      );

      const direction = this.getCardinalDirection(bearing);

      return {
        hasNext: true,
        checkpoint: nextCheckpoint,
        distance: Math.round(distance),
        direction: direction,
        bearing: bearing,
        instructions: this.generateInstructions(distance, direction, nextCheckpoint.name)
      };
    } catch (error) {
      console.error('Error getting route to next checkpoint:', error);
      return {
        hasNext: false,
        error: 'Unable to calculate route'
      };
    }
  }

  getCardinalDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  getDetailedDirection(bearing) {
    if (bearing >= 337.5 || bearing < 22.5) return 'North';
    if (bearing >= 22.5 && bearing < 67.5) return 'Northeast';
    if (bearing >= 67.5 && bearing < 112.5) return 'East';
    if (bearing >= 112.5 && bearing < 157.5) return 'Southeast';
    if (bearing >= 157.5 && bearing < 202.5) return 'South';
    if (bearing >= 202.5 && bearing < 247.5) return 'Southwest';
    if (bearing >= 247.5 && bearing < 292.5) return 'West';
    if (bearing >= 292.5 && bearing < 337.5) return 'Northwest';
    return 'Unknown';
  }

  generateInstructions(distance, direction, checkpointName) {
    const distanceText = distance > 1000 
      ? `${(distance / 1000).toFixed(1)} km` 
      : `${distance} meters`;

    let instructions = `Head ${direction.toLowerCase()} for ${distanceText} to reach ${checkpointName}.`;
    
    if (distance > 500) {
      instructions += ' Follow the main trail path.';
    } else if (distance > 100) {
      instructions += ' You\'re getting close! Look for trail markers.';
    } else {
      instructions += ' You\'re very close! Look around for the checkpoint marker.';
    }

    return instructions;
  }

  getTrailInfo() {
    return {
      name: this.trail.name,
      description: this.trail.description,
      difficulty: this.trail.difficulty,
      totalCheckpoints: this.checkpoints.length,
      estimatedTime: this.trail.estimatedTime
    };
  }

  getProgressInfo(currentCheckpointIndex) {
    const totalCheckpoints = this.checkpoints.length;
    const completedCheckpoints = currentCheckpointIndex;
    const progress = (completedCheckpoints / totalCheckpoints) * 100;

    return {
      completed: completedCheckpoints,
      total: totalCheckpoints,
      percentage: Math.round(progress),
      remaining: totalCheckpoints - completedCheckpoints
    };
  }

  isRouteComplete(currentCheckpointIndex) {
    return currentCheckpointIndex >= this.checkpoints.length;
  }
}

export default new RouteAgent();