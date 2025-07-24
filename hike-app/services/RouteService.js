import axios from 'axios';
import { calculateDistance, calculateBearing } from '../utils/location.js';
import demoTrail from '../data/demoTrail.json';

class RouteService {
  constructor() {
    this.cache = new Map();
    this.obstacleData = new Map();
    // OpenRouteService API - your API key
    this.orsApiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNiNThlMmEyODc5ZDQ5NWE4OWUzMDdjMzhjMjdmMjQ1IiwiaCI6Im11cm11cjY0In0=";
    this.orsBaseUrl = 'https://api.openrouteservice.org/v2';
  }

  // Main method to get route with OpenRouteService
  async getRoute(origin, destination, mode = 'walking') {
    try {
      // Convert mode to OpenRouteService profile
      const orsMode = mode === 'walking' ? 'foot-walking' : 
                     mode === 'cycling' ? 'cycling-regular' : 'foot-walking';
      
      // Try OpenRouteService first (real walking routes)
      const orsRoute = await this.getOpenRouteServiceRoute(origin, destination, orsMode);
      if (orsRoute) {
        return orsRoute;
      }
    } catch (error) {
      console.warn('OpenRouteService failed:', error.message);
      // Don't throw, continue to fallback
    }

    try {
      // Fallback to enhanced pathfinding
      const enhancedRoute = await this.getEnhancedFallbackRoute(origin, destination, mode);
      if (enhancedRoute) {
        return enhancedRoute;
      }
    } catch (error) {
      console.warn('Enhanced pathfinding failed:', error.message);
      // Don't throw, continue to final fallback
    }

    // Final fallback to simple route - this should never fail
    try {
      return this.createDemoRoute(origin, destination);
    } catch (error) {
      console.error('Demo route creation failed:', error);
      // Return minimal route if all else fails
      return {
        coordinates: [origin, destination],
        distance: calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude),
        duration: 60,
        steps: [],
        source: 'emergency-fallback'
      };
    }
  }

  // Get real walking route using OpenRouteService API
  async getOpenRouteServiceRoute(origin, destination, mode = 'foot-walking') {
    const cacheKey = `${origin.latitude},${origin.longitude}-${destination.latitude},${destination.longitude}-${mode}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const coordinates = [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude]
      ];

      const response = await axios.post(
        `${this.orsBaseUrl}/directions/${mode}`,
        {
          coordinates: coordinates,
          format: 'json',
          instructions: true,
          geometry: true,
          elevation: false
        },
        {
          headers: {
            'Authorization': this.orsApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 8000 // Reduced timeout to 8 seconds
        }
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const routeData = {
          coordinates: this.decodeOpenRouteGeometry(route.geometry),
          distance: route.summary.distance, // in meters
          duration: route.summary.duration, // in seconds
          steps: route.segments[0].steps.map(step => ({
            coordinates: this.decodeOpenRouteGeometry(step.geometry),
            distance: step.distance,
            duration: step.duration,
            instruction: step.instruction,
            maneuver: step.maneuver?.type || 'straight',
            way_points: step.way_points
          })),
          source: 'openrouteservice',
          profile: mode
        };

        // Cache the result
        this.cache.set(cacheKey, routeData);
        return routeData;
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.warn('OpenRouteService timeout after 8 seconds');
      } else if (error.response) {
        console.warn('OpenRouteService API error:', error.response.status, error.response.statusText);
      } else if (error.request) {
        console.warn('OpenRouteService network error - no response received');
      } else {
        console.warn('OpenRouteService API failed:', error.message);
      }
      // Don't throw error, return null to allow fallback
      return null;
    }
  }

  // Create simple demo route between two points
  createDemoRoute(origin, destination) {
    const distance = calculateDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
    
    // Create a simple curved path with a few waypoints
    const coordinates = this.generateSimplePath(origin, destination);
    
    return {
      coordinates: coordinates,
      distance: distance,
      duration: Math.round(distance / 1.4), // 1.4 m/s walking speed
      steps: this.generateSimpleSteps(coordinates),
      source: 'demo-trail'
    };
  }

  // Generate simple curved path between two points
  generateSimplePath(start, end) {
    const path = [start];
    const segments = 5; // 5 segments for smooth curve
    
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      
      // Add slight curve to make path more natural
      const curvature = Math.sin(progress * Math.PI) * 0.0002;
      
      const lat = start.latitude + (end.latitude - start.latitude) * progress + curvature;
      const lng = start.longitude + (end.longitude - start.longitude) * progress + curvature * 0.5;
      
      path.push({ latitude: lat, longitude: lng });
    }
    
    path.push(end);
    return path;
  }

  // Enhanced fallback when OpenRouteService fails
  async getEnhancedFallbackRoute(origin, destination, mode) {
    try {
      const path = this.generateSmartCurvedPath(origin, destination);
      const distance = this.calculatePathDistance(path);
      
      return {
        coordinates: path,
        distance: distance,
        duration: Math.round(distance / 1.4), // 1.4 m/s walking speed
        steps: this.generateSimpleSteps(path),
        source: 'enhanced-fallback'
      };
    } catch (error) {
      console.error('Enhanced fallback failed:', error);
      return null;
    }
  }

  // Generate smart curved path
  generateSmartCurvedPath(start, goal) {
    const segments = 8;
    const path = [start];
    
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      
      // Create natural curves
      const curvature = Math.sin(progress * Math.PI) * 0.0003;
      const randomFactor = (Math.random() - 0.5) * 0.0001;
      
      const lat = start.latitude + (goal.latitude - start.latitude) * progress + curvature + randomFactor;
      const lng = start.longitude + (goal.longitude - start.longitude) * progress + curvature * 0.5 + randomFactor;
      
      path.push({ latitude: lat, longitude: lng });
    }
    
    path.push(goal);
    return path;
  }

  // Calculate total distance of a path
  calculatePathDistance(path) {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += calculateDistance(
        path[i].latitude, path[i].longitude,
        path[i + 1].latitude, path[i + 1].longitude
      );
    }
    return totalDistance;
  }

  // Decode OpenRouteService geometry
  decodeOpenRouteGeometry(geometry) {
    if (!geometry) return [];
    
    // OpenRouteService returns coordinates as [lng, lat] arrays
    if (Array.isArray(geometry) && geometry.length > 0 && Array.isArray(geometry[0])) {
      return geometry.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
    }
    
    // If it's encoded polyline, decode it
    if (typeof geometry === 'string') {
      return this.decodePolyline(geometry);
    }
    
    return [];
  }

  // Decode Google Maps polyline (backup)
  decodePolyline(encoded) {
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }
    
    return coordinates;
  }

  // Generate simple steps for the demo route
  generateSimpleSteps(coordinates) {
    const steps = [];
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      const distance = calculateDistance(
        start.latitude, start.longitude,
        end.latitude, end.longitude
      );
      
      steps.push({
        coordinates: [start, end],
        distance,
        duration: Math.round(distance / 1.4), // 1.4 m/s walking speed
        instruction: i === 0 ? 'Start wandeling' : 
                    i === coordinates.length - 2 ? 'Aankomst bij checkpoint' : 
                    `Loop ${Math.round(distance)}m verder`,
        maneuver: 'straight'
      });
    }
    
    return steps;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new RouteService();