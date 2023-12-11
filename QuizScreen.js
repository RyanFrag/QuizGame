import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
 
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};



const QuizScreen = ({ route, navigation }) => {
  const { selectedCategory } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrectMessage, setShowCorrectMessage] = useState(false);
  const [score, setScore] = useState(0);
  const [correctOption, setCorrectOption] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [options, setOptions] = useState([]);
  const [translationError, setTranslationError] = useState(false);



  const initializeQuiz = async () => {
    try {
      setLoading(true); 
      setTranslationError(false);

      const response = await axios.get(`https://opentdb.com/api.php?amount=10&category=${selectedCategory}&encode=base64`);
      
      const results = response.data.results.map((question) => {
        const decodedQuestion = {
          ...question,
          question: atob(question.question),
          incorrect_answers: question.incorrect_answers.map((option) => atob(option)),
          correct_answer: atob(question.correct_answer),
        };
        return decodedQuestion;
      });

      const translatedQuestions = await translateQuestions(results);
      setQuestions(translatedQuestions);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      setTranslationError(true);

    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    initializeQuiz();
  }, [selectedCategory]);

  function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }
  
  useEffect(() => {
    const answers = questions[currentQuestionIndex]?.incorrect_answers
      ? [...questions[currentQuestionIndex].incorrect_answers, questions[currentQuestionIndex].correct_answer]
      : [];
  
    const shuffledAnswers = shuffleArray(answers);
    setOptions(shuffledAnswers);
  }, [currentQuestionIndex, questions]);
  
  useEffect(() => {
    console.log(options)
  }, 
  [options]
  );
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
      setTranslationError(true);
      return originalQuestions;
    }
  };

  const handleOptionPress = (selectedOption) => {
    const isCorrect = selectedOption === questions[currentQuestionIndex].correct_answer;
    setShowCorrectMessage(true);
    setSelectedOption(selectedOption);
    setCorrectOption(questions[currentQuestionIndex].correct_answer);

    if (isCorrect) {
      setScore(score + 1);
    }


    
    setTimeout(() => {  
      setShowCorrectMessage(false);
      setUserAnswer('');
      setSelectedOption(null);
      setCorrectOption(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        navigation.navigate('Result', { score });
        setScore(0);
      }
    }, 2000);
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Game</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <React.Fragment>
          {translationError ? (
            <TranslationErrorCard onRetry={() => initializeQuiz()} />
          ) : (
            <React.Fragment>
              <QuestionCard question={questions[currentQuestionIndex]} />
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    showCorrectMessage &&
                      (option === correctOption
                        ? styles.correctAnswer
                        : option === selectedOption
                        ? styles.wrongAnswer
                        : null),
                  ]}
                  onPress={() => handleOptionPress(option)}
                  disabled={showCorrectMessage}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </View>
  );
};


const TranslationErrorCard = ({ onRetry }) => {
  return (
    <View style={styles.card}>
      <Text style={[styles.errorMessage, styles.justifyText]}>
        O limite de quizzes traduzidos de hoje se esgotou. Você poderá encontrar mais ao voltar amanhã.
      </Text>
      <Text style={[styles.errorMessage, styles.justifyText]}>
        Se deseja jogar o quiz na língua inglesa, clique abaixo.
      </Text>
      <TouchableOpacity onPress={onRetry} style={styles.errorButton}>
        <Text style={styles.errorButtonText}>Jogar em Inglês</Text>
      </TouchableOpacity>
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
  justifyText: {
    textAlign: 'justify',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  correctAnswer: {
    backgroundColor: 'green',
  },
  wrongAnswer: {
    backgroundColor: 'red',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: 200,
    marginBottom: 10,
  },
  errorButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  errorButtonText: {
    fontSize: 16,
    color: '#fff', 
    fontWeight: 'bold',
  },
});

export default QuizScreen;
