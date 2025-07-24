import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { UserContext } from '../context/UserContext';
import QuestionAgent from '../agents/QuestionAgent';
import ProgressAgent from '../agents/ProgressAgent';
import QuestionCard from '../components/QuestionCard';

export default function QuestionScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    try {
      const questionData = await QuestionAgent.getQuestionForCheckpoint(
        user.currentCheckpoint
      );
      setQuestion(questionData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading question:', error);
      Alert.alert('Error', 'Could not load question. Please try again.');
    }
  };

  const handleAnswer = async (selectedAnswer) => {
    const isCorrect = QuestionAgent.checkAnswer(question, selectedAnswer);
    
    if (isCorrect) {
      const newScore = user.score + 10;
      const nextCheckpoint = user.currentCheckpoint + 1;
      
      await ProgressAgent.updateProgress(user.id, {
        currentCheckpoint: nextCheckpoint,
        score: newScore,
      });
      
      setUser({
        ...user,
        currentCheckpoint: nextCheckpoint,
        score: newScore,
      });
      
      Alert.alert(
        'Correct! 🎉',
        `Great job! You earned 10 points.\nTotal Score: ${newScore}`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (nextCheckpoint >= 3) {
                navigation.navigate('Finish');
              } else {
                navigation.navigate('Checkpoint');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Incorrect',
        'That\'s not quite right. Try again!',
        [{ text: 'Try Again' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkpoint {user.currentCheckpoint + 1} Question</Text>
      
      <QuestionCard 
        question={question}
        onAnswer={handleAnswer}
      />
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {user.score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2e7d32',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});