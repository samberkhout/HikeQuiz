import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import { UserContext } from '../context/UserContext';
import CheckpointAgent from '../agents/CheckpointAgent';
import MapViewComponent from '../components/MapViewComponent';

export default function CheckpointScreen({ navigation }) {
  const { user, setUser, visitedCheckpoints, markCheckpointVisited } = useContext(UserContext);
  const [userLocation, setUserLocation] = useState(null);
  const [atCheckpoint, setAtCheckpoint] = useState(false);
  const [checkpointData, setCheckpointData] = useState(null);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(user?.currentCheckpoint);

  useEffect(() => {
    if (user?.currentCheckpoint !== currentCheckpointIndex) {
      setAtCheckpoint(false);
      setCheckpointData(null);
      setCurrentCheckpointIndex(user?.currentCheckpoint);
    }
  }, [user?.currentCheckpoint, currentCheckpointIndex]);

  useEffect(() => {
    const watchLocation = async () => {
      try {
        const location = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setUserLocation(location.coords);
            checkIfAtCheckpoint(location.coords);
          }
        );
      } catch (error) {
        console.error('Error watching location:', error);
      }
    };

    watchLocation();
  }, []);

  const checkIfAtCheckpoint = async (coords) => {
    const isAtCheckpoint = await CheckpointAgent.isAtCheckpoint(
      coords,
      user.currentCheckpoint
    );
    
    if (isAtCheckpoint && !atCheckpoint) {
      setAtCheckpoint(true);
      const checkpoint = await CheckpointAgent.getCheckpointData(user.currentCheckpoint);
      setCheckpointData(checkpoint);
      
      if (!visitedCheckpoints.has(user.currentCheckpoint)) {
        markCheckpointVisited(user.currentCheckpoint);
        navigation.navigate('Question');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkpoint {user?.currentCheckpoint + 1}</Text>
      
      <MapViewComponent 
        userLocation={userLocation}
        targetCheckpoint={user?.currentCheckpoint}
        showRoute={!atCheckpoint}
      />
      
      <View style={styles.info}>
        {atCheckpoint ? (
          <>
            <Text style={styles.successText}>Checkpoint Reached! 🎉</Text>
            <Button 
              title="Answer Question" 
              onPress={() => navigation.navigate('Question')}
            />
          </>
        ) : (
          <>
            <Text style={styles.instructionText}>
              Follow the route to reach the next checkpoint
            </Text>
            <Text style={styles.distanceText}>
              {userLocation ? 'GPS tracking active...' : 'Getting location...'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2e7d32',
  },
  info: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  distanceText: {
    fontSize: 14,
    color: '#999',
  },
});