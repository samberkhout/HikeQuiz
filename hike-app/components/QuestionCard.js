import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function QuestionCard({ question, onAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    onAnswer(answerIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>
      
      <View style={styles.answersContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerButton,
              selectedAnswer === index && styles.selectedAnswer
            ]}
            onPress={() => handleAnswerSelect(index)}
          >
            <Text style={[
              styles.answerText,
              selectedAnswer === index && styles.selectedAnswerText
            ]}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {question.hint && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintLabel}>Hint:</Text>
          <Text style={styles.hintText}>{question.hint}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedAnswer: {
    borderColor: '#2e7d32',
    backgroundColor: '#f1f8e9',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
  },
  selectedAnswerText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  hintContainer: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 5,
  },
  hintText: {
    fontSize: 14,
    color: '#bf360c',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});