export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
};

export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
};

export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusInMeters) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusInMeters;
};

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorMessage = 'Unknown location error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

export const watchPosition = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported by this browser'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      let errorMessage = 'Unknown location error';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }
      errorCallback(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }
  );

  return watchId;
};

export const clearWatch = (watchId) => {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
};

export const getDistanceText = (distanceInMeters) => {
  if (distanceInMeters < 50) {
    return 'Very close';
  } else if (distanceInMeters < 100) {
    return 'Close';
  } else if (distanceInMeters < 500) {
    return 'Nearby';
  } else if (distanceInMeters < 1000) {
    return 'A short walk';
  } else {
    return 'Some distance away';
  }
};

export const getCompassDirection = (bearing) => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
};

export const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  return {
    isValid: !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180,
    latitude: lat,
    longitude: lon
  };
};

export const calculateRouteDistance = (waypoints) => {
  if (!waypoints || waypoints.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const point1 = waypoints[i];
    const point2 = waypoints[i + 1];
    totalDistance += calculateDistance(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude
    );
  }
  
  return totalDistance;
};

export const findNearestPointOnRoute = (userLocation, waypoints) => {
  if (!waypoints || waypoints.length === 0) return null;
  
  let nearestPoint = waypoints[0];
  let shortestDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    nearestPoint.latitude,
    nearestPoint.longitude
  );
  
  waypoints.forEach(point => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      point.latitude,
      point.longitude
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestPoint = point;
    }
  });
  
  return {
    point: nearestPoint,
    distance: shortestDistance
  };
};