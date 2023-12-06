import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const QuizScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrectMessage, setShowCorrectMessage] = useState(false);
  const [score, setScore] = useState(0); // Estado para acompanhar a pontuação

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('https://opentdb.com/api.php?amount=10');
        const translatedQuestions = await translateQuestions(response.data.results);
        setQuestions(translatedQuestions);
      } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
      }
    };

    fetchQuestions();
  }, []);

  const translateQuestions = async (originalQuestions) => {
    try {
      const translations = await Promise.all(
        originalQuestions.map(async (q) => {
          const translationResponse = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q.question)}&langpair=en|pt-BR`
          );

          const translatedText = translationResponse.data.responseData.translatedText;

          const translatedOptions = await Promise.all(
            q.incorrect_answers.map(async (option) => {
              const optionTranslationResponse = await axios.get(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(option)}&langpair=en|pt-BR`
              );
              return optionTranslationResponse.data.responseData.translatedText;
            })
          );

          const translatedCorrectAnswer = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              q.correct_answer
            )}&langpair=en|pt-BR`
          );

          const translatedCorrectText = translatedCorrectAnswer.data.responseData.translatedText;

          return {
            ...q,
            question: translatedText,
            correct_answer: translatedCorrectText,
            incorrect_answers: translatedOptions,
          };
        })
      );

      return translations;
    } catch (error) {
      console.error('Erro ao traduzir perguntas:', error);
      return originalQuestions;
    }
  };

  const handleOptionPress = (selectedOption) => {
    const isCorrect = selectedOption === questions[currentQuestionIndex].correct_answer;
    setShowCorrectMessage(true);

    if (isCorrect) {
      // Exibir uma mensagem de sucesso e aumentar a pontuação
      Alert.alert('Parabéns!', 'Você acertou!');
      setScore(score + 1);
    } else {
      // Exibir uma mensagem de erro
      Alert.alert('Ops!', 'Você errou. Tente novamente!');
    }

    setTimeout(() => {
      setShowCorrectMessage(false);
      setUserAnswer('');
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Exibir a tela de parabéns ou realizar alguma ação
        Alert.alert('Parabéns!', 'Você completou o quiz! Sua pontuação: ' + score);
        // Reiniciar o quiz ou navegar para outra tela
        setScore(0); // Resetar a pontuação para o próximo jogo
      }
    }, 2000);
  };

  const options = questions[currentQuestionIndex]?.incorrect_answers
  ? [...questions[currentQuestionIndex].incorrect_answers, questions[currentQuestionIndex].correct_answer]
  : [];

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Pontuação: {score}</Text> {/* Exibir a pontuação atual */}
      <QuestionCard question={questions[currentQuestionIndex]} />
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            showCorrectMessage && option === questions[currentQuestionIndex]?.correct_answer
              ? styles.correctAnswer
              : null,
          ]}
          onPress={() => handleOptionPress(option)}
          disabled={showCorrectMessage}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const QuestionCard = ({ question }) => {
  if (!question) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question.question}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: 250,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  correctAnswer: {
    backgroundColor: 'green',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default QuizScreen;
