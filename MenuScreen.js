import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const MenuScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('23'); 
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation(); 

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php')
      .then(response => setCategories(response.data.trivia_categories))
      .catch(error => console.error('Erro ao buscar categorias:', error));
  }, []);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const handleStartQuiz = () => {
    navigation.navigate('Quiz', { selectedCategory }); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Game</Text>
      <Text style={styles.title}>Escolha a Categoria</Text>
      <ScrollView contentContainerStyle={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id.toString() && styles.selectedCategory,
            ]}
            onPress={() => handleCategoryPress(category.id.toString())}
          >
            <Text>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartQuiz}
        disabled={!selectedCategory}
      >
        <Text>Iniciar Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#A5A5A5',
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    margin: 5,
  },
  selectedCategory: {
    backgroundColor: '#64b5f6', 
  },
  startButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default MenuScreen;
