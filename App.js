import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const QuizScreen = () => {
  const [questions, setQuestions] = useState([]);

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

          // Traduzindo as opções de resposta
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
      return originalQuestions; // Retorna as perguntas originais em caso de erro na tradução
    }
  };

  return (
    <View>
      {questions.map((question, index) => (
        <QuestionCard key={index} question={question} />
      ))}
    </View>
  );
};

const QuestionCard = ({ question }) => {
  const options = [...question.incorrect_answers, question.correct_answer];

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question.question}</Text>
      {options.map((option, index) => (
        <TouchableOpacity key={index} style={styles.optionButton}>
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
});

export default QuizScreen;
