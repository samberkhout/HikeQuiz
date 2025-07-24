import demoTrail from '../data/demoTrail.json';
import { questionAPI } from '../api/api';

class QuestionAgent {
  constructor() {
    this.questions = demoTrail.questions;
  }

  async getQuestionForCheckpoint(checkpointIndex) {
    try {
      if (checkpointIndex >= this.questions.length) {
        throw new Error('No question available for this checkpoint');
      }

      return this.questions[checkpointIndex];
    } catch (error) {
      console.error('Error getting question for checkpoint:', error);
      throw error;
    }
  }

  checkAnswer(question, selectedAnswerIndex) {
    try {
      if (!question || selectedAnswerIndex === null || selectedAnswerIndex === undefined) {
        return false;
      }

      return selectedAnswerIndex === question.correctAnswer;
    } catch (error) {
      console.error('Error checking answer:', error);
      return false;
    }
  }

  getCorrectAnswer(question) {
    try {
      if (!question || question.correctAnswer === undefined) {
        return null;
      }

      return {
        index: question.correctAnswer,
        text: question.options[question.correctAnswer]
      };
    } catch (error) {
      console.error('Error getting correct answer:', error);
      return null;
    }
  }

  async submitAnswer(questionId, selectedAnswer, userId) {
    try {
      const response = await questionAPI.submitAnswer(questionId, selectedAnswer);
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      const question = this.questions.find(q => q.id === questionId);
      if (question) {
        return {
          correct: this.checkAnswer(question, selectedAnswer),
          correctAnswer: this.getCorrectAnswer(question)
        };
      }
      
      throw error;
    }
  }

  getAllQuestions() {
    return this.questions;
  }

  getQuestionById(questionId) {
    return this.questions.find(q => q.id === questionId);
  }

  getHint(question) {
    return question?.hint || null;
  }

  getDifficulty(question) {
    return question?.difficulty || 'medium';
  }

  getPoints(question) {
    const difficulty = this.getDifficulty(question);
    switch (difficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 15;
      default: return 10;
    }
  }
}

export default new QuestionAgent();