import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { UserContext } from '../context/UserContext';

export default function FinishScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);

  const startNewHike = () => {
    setUser({
      ...user,
      currentCheckpoint: 0,
      score: 0,
    });
    navigation.navigate('Home');
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Congratulations! 🎆</Text>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Hike Complete!</Text>
        <Text style={styles.summaryText}>You successfully completed all checkpoints!</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Final Score:</Text>
          <Text style={styles.scoreValue}>{user?.score || 0} points</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Checkpoints completed: 3/3</Text>
          <Text style={styles.statsText}>Questions answered: 3</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Start New Hike" 
          onPress={startNewHike}
          color="#2e7d32"
        />
        <View style={styles.buttonSpacing} />
        <Button 
          title="Back to Home" 
          onPress={goHome}
          color="#666"
        />
      </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2e7d32',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
  },
  summaryText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonSpacing: {
    height: 15,
  },
});