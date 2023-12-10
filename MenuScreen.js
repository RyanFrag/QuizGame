import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Picker } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const MenuScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('23'); // Default: History
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation(); // Obtenha o objeto de navegação

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php')
      .then(response => setCategories(response.data.trivia_categories))
      .catch(error => console.error('Erro ao buscar categorias:', error));
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleStartQuiz = () => {
    navigation.navigate('Quiz', { selectedCategory }); // Navegue para a tela de Quiz com a categoria escolhida
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha a Categoria</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => handleCategoryChange(itemValue)}
        style={styles.picker}
      >
        {categories.map(category => (
          <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
        ))}
      </Picker>
      <TouchableOpacity
        style={styles.categoryButton}
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
  picker: {
    height: 50,
    width: 200,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default MenuScreen;
