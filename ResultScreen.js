// ResultScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ResultScreen = ({ route, navigation }) => {
  const { score } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado do Quiz</Text>
      <Text style={styles.scoreText}>Pontuação: {score + 1}</Text>
      <TouchableOpacity
        style={styles.playAgainButton}
        onPress={() => navigation.navigate('Menu')} 
      >
        <Text style={styles.buttonText}>Jogar Novamente</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
