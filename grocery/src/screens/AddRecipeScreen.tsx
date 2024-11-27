import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { createRecipe } from '../api/api';
import { NavigationProp } from '@react-navigation/native';
import StepsInput from '../components/stepsInput';

interface AddRecipeScreenProps {
  navigation: NavigationProp<any>;
}

// Define the InstructionItem interface, just like in the EditRecipeScreen
interface InstructionItem {
  key: string;
  value: string;
}

const AddRecipeScreen: React.FC<AddRecipeScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState<InstructionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await createRecipe({
        title,
        ingredients: ingredients.split(','),
        instructions: instructions.map((item) => item.value), // Extract value from each instruction item
      });
      navigation.goBack();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingredients (comma separated)"
        value={ingredients}
        onChangeText={setIngredients}
      />
      <View style={styles.stepsContainer}>
        <StepsInput initialSteps={instructions} onStepsChange={setInstructions} />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Submit" onPress={handleSubmit} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepsContainer: {
    flex: 1,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
});

export default AddRecipeScreen;
