import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import { UserContext } from '../context/UserContext';

export default function HomeScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for this app to work properly.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startHike = () => {
    if (!user) {
      setUser({ id: Date.now(), name: 'Hiker', currentCheckpoint: 0, score: 0 });
    }
    navigation.navigate('Checkpoint');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Hike Quiz!</Text>
      <Text style={styles.description}>
        Follow the hiking trail and answer questions at each checkpoint.
        GPS will guide you to each location.
      </Text>
      <Button title="Start Hike" onPress={startHike} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    color: '#666',
  },
});