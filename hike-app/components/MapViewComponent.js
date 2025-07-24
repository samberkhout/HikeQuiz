import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { calculateDistance, calculateRouteDistance, findNearestPointOnRoute } from '../utils/location.js';
import demoTrail from '../data/demoTrail.json';
import MapLegend from './MapLegend';
import RouteService from '../services/RouteService';

const { width, height } = Dimensions.get('window');

export default function MapViewComponent({ userLocation, targetCheckpoint, showRoute }) {
  const [dynamicRoute, setDynamicRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Calculate dynamic route when user location or target changes
  useEffect(() => {
    if (userLocation && targetCheckpoint !== undefined && showRoute) {
      calculateDynamicRoute();
    }
  }, [userLocation, targetCheckpoint, showRoute]);

  const calculateDynamicRoute = async () => {
    if (!userLocation || targetCheckpoint === undefined) return;
    
    const checkpoint = demoTrail.checkpoints[targetCheckpoint];
    if (!checkpoint) return;

    setRouteLoading(true);
    
    try {
      const route = await RouteService.getRoute(
        userLocation,
        { latitude: checkpoint.latitude, longitude: checkpoint.longitude },
        'walking'
      );
      
      setDynamicRoute(route);
    } catch (error) {
      console.error('Route calculation failed:', error);
      setDynamicRoute(null);
    } finally {
      setRouteLoading(false);
    }
  };

  if (!userLocation || targetCheckpoint === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const checkpoint = demoTrail.checkpoints[targetCheckpoint];
  if (!checkpoint) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Checkpoint not found</Text>
      </View>
    );
  }

  // Simple route to next checkpoint (no complex waypoints)
  const getRouteToNextCheckpoint = () => {
    // For demo trail, we just use the simple dynamic route
    return [];
  };

  // Calculate both direct distance and route distance
  const directDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    checkpoint.latitude,
    checkpoint.longitude
  );
  
  // Use dynamic route if available, fallback to waypoints
  const nextRoute = dynamicRoute ? dynamicRoute.coordinates : getRouteToNextCheckpoint();
  const nearestPoint = findNearestPointOnRoute(userLocation, nextRoute);
  const routeDistance = dynamicRoute ? dynamicRoute.distance : 
                       (nextRoute.length > 0 ? calculateRouteDistance(nextRoute) : directDistance);

  // Simple trail overview (connecting all checkpoints)
  const getFullTrailRoute = () => {
    const coords = [demoTrail.startingPoint];
    coords.push(...demoTrail.checkpoints);
    return coords;
  };

  // Simple completed route (direct lines to completed checkpoints)
  const getCompletedRoute = () => {
    const coords = [demoTrail.startingPoint];
    for (let i = 0; i < targetCheckpoint; i++) {
      coords.push(demoTrail.checkpoints[i]);
    }
    return coords;
  };

  // Calculate dynamic map region with better responsiveness
  const getMapRegion = () => {
    const routeToNext = getRouteToNextCheckpoint();
    const allRoutePoints = routeToNext.length > 0 ? routeToNext : [userLocation, checkpoint];
    
    const lats = allRoutePoints.map(p => p.latitude);
    const lngs = allRoutePoints.map(p => p.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Adaptive zoom based on route length
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const padding = Math.max(latSpan, lngSpan) * 0.3; // 30% padding
    
    const latDelta = Math.max(latSpan + padding, 0.005); // Minimum zoom level
    const lngDelta = Math.max(lngSpan + padding, 0.005);
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const fullTrailRoute = getFullTrailRoute();
  const completedRouteCoordinates = getCompletedRoute();
  const nextCheckpointRoute = getRouteToNextCheckpoint();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={getMapRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsPointsOfInterest={false}
        showsBuildings={false}
        mapType="hybrid"
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        toolbarEnabled={true}
        moveOnMarkerPress={false}
        onMapReady={() => console.log('Map ready')}
        loadingEnabled={true}
        loadingIndicatorColor="#2e7d32"
        loadingBackgroundColor="#f5f5f5"
      >
        {/* Full trail route (in light gray, dashed) */}
        {fullTrailRoute.length > 0 && (
          <Polyline
            coordinates={fullTrailRoute}
            strokeColor="rgba(128, 128, 128, 0.6)"
            strokeWidth={2}
            lineDashPattern={[8, 4]}
            lineJoin="round"
            lineCap="round"
          />
        )}
        
        {/* Completed route (in green, solid) */}
        {completedRouteCoordinates.length > 0 && (
          <Polyline
            coordinates={completedRouteCoordinates}
            strokeColor="#4CAF50"
            strokeWidth={5}
            lineJoin="round"
            lineCap="round"
          />
        )}
        
        {/* Dynamic calculated route with different colors for different sources */}
        {showRoute && dynamicRoute && dynamicRoute.coordinates.length > 0 && (
          <Polyline
            coordinates={dynamicRoute.coordinates}
            strokeColor={
              dynamicRoute.source === 'openrouteservice' ? "#4CAF50" : // Green for real routes
              dynamicRoute.source === 'enhanced-fallback' ? "#1976D2" : // Dark blue for smart fallback
              "#2196F3" // Light blue for simple routes
            }
            strokeWidth={dynamicRoute.source === 'openrouteservice' ? 6 : 4}
            lineJoin="round"
            lineCap="round"
          />
        )}
        
        {/* Fallback: waypoint route if dynamic route not available */}
        {showRoute && !dynamicRoute && nextCheckpointRoute.length > 0 && (
          <Polyline
            coordinates={nextCheckpointRoute}
            strokeColor="#2196F3"
            strokeWidth={4}
            lineJoin="round"
            lineCap="round"
          />
        )}
        
        {/* Final fallback: direct line */}
        {showRoute && !dynamicRoute && nextCheckpointRoute.length === 0 && (
          <Polyline
            coordinates={[
              { latitude: userLocation.latitude, longitude: userLocation.longitude },
              { latitude: checkpoint.latitude, longitude: checkpoint.longitude }
            ]}
            strokeColor="#FF9800"
            strokeWidth={3}
            lineDashPattern={[6, 3]}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* Starting point marker */}
        <Marker
          coordinate={{
            latitude: demoTrail.startingPoint.latitude,
            longitude: demoTrail.startingPoint.longitude,
          }}
          title="Trail Start"
          description={demoTrail.startingPoint.name}
          pinColor="green"
        />

        {/* All checkpoint markers with enhanced info */}
        {demoTrail.checkpoints.map((cp, index) => {
          const isCompleted = index < targetCheckpoint;
          const isCurrent = index === targetCheckpoint;
          const distanceFromUser = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            cp.latitude,
            cp.longitude
          );
          
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: cp.latitude,
                longitude: cp.longitude,
              }}
              title={`Checkpoint ${index + 1}: ${cp.name}`}
              description={`${cp.description}\nAfstand: ${distanceFromUser.toFixed(0)}m`}
              pinColor={isCompleted ? "green" : isCurrent ? "blue" : "red"}
              opacity={isCompleted ? 0.7 : 1.0}
            />
          );
        })}

        {/* User location marker with enhanced info */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Jouw Locatie"
          description={`Coördinaten: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`}
          pinColor="purple"
          anchor={{ x: 0.5, y: 0.5 }}
        />
      </MapView>
      
      {/* Route info overlay */}
      <View style={styles.infoOverlay}>
        <Text style={styles.checkpointText}>
          {checkpoint.name}
        </Text>
        
        {routeLoading && (
          <Text style={styles.loadingRouteText}>🔄 Berekenen route...</Text>
        )}
        
        {dynamicRoute && (
          <>
            <Text style={styles.distanceText}>
              🚶‍♂️ {Math.round(routeDistance)}m via {
                dynamicRoute.source === 'openrouteservice' ? 'echte wandelroute' :
                dynamicRoute.source === 'enhanced-fallback' ? 'slimme route' : 
                'eenvoudige route'
              }
            </Text>
            <Text style={styles.directDistanceText}>
              ⏱️ {Math.round(dynamicRoute.duration / 60)} min wandeltijd
            </Text>
            {dynamicRoute.source === 'openrouteservice' && (
              <Text style={styles.apiSourceText}>
                🗺️ OpenRouteService - echte wandelpaden
              </Text>
            )}
          </>
        )}
        
        {!dynamicRoute && !routeLoading && (
          <>
            <Text style={styles.distanceText}>
              🚶‍♂️ {Math.round(routeDistance)}m via route
            </Text>
            <Text style={styles.directDistanceText}>
              ✈️ {Math.round(directDistance)}m direct
            </Text>
          </>
        )}
        
        {directDistance <= 30 && (
          <Text style={styles.nearText}>
            🎯 Je bent bij de checkpoint!
          </Text>
        )}
        
        {nearestPoint && nearestPoint.distance > 50 && (
          <Text style={styles.offRouteText}>
            ⚠️ {Math.round(nearestPoint.distance)}m van de route
          </Text>
        )}
      </View>
      
      {/* Map legend */}
      <MapLegend isVisible={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    minHeight: 300,
  },
  infoOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkpointText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
    textAlign: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 2,
  },
  directDistanceText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  nearText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  offRouteText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingRouteText: {
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: '#9c27b0',
    marginBottom: 2,
  },
  apiSourceText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
    marginBottom: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
});