import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateRecipe, getRecipeById } from '../api/api';
import {
  EditRecipeScreenRouteProp,
  EditRecipeScreenNavigationProp,
} from '../navigation/ParamList';

interface EditRecipeScreenProps {
  navigation: EditRecipeScreenNavigationProp;
  route: EditRecipeScreenRouteProp;
}

interface InstructionItem {
  key: string;
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
}

const EditRecipeScreen: React.FC<EditRecipeScreenProps> = ({
  navigation,
  route,
}) => {
  const { id } = route.params;
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState<InstructionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipe = await getRecipeById(id);
        setTitle(recipe.title);
        setIngredients(recipe.ingredients.join(','));
        const updatedInstructions = Array.isArray(recipe.instructions)
          ? recipe.instructions.map((instruction: any, index: number) => ({
              key: `step-${index}`,
              value: instruction,
              placeholder: `Step ${index + 1}`,
              onChange: (text: string) => handleChangeStep(text, index),
            }))
          : [];
        setInstructions(updatedInstructions);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const instructionsArray = instructions.map(item => item.value);
      await updateRecipe(id, {
        title,
        ingredients: ingredients.split(','),
        instructions: instructionsArray,
      });
      navigation.goBack();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  const addStep = () => {
    const newStep = {
      key: `step-${instructions.length}`,
      value: '',
      placeholder: `Step ${instructions.length + 1}`,
      onChange: (text: string) => handleChangeStep(text, instructions.length),
    };
    const updatedSteps = [...instructions, newStep];
    setInstructions(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = instructions.filter((_, i) => i !== index);
    setInstructions(updatedSteps);
  };

  const handleChangeStep = (text: string, index: number) => {
    const updatedSteps = [...instructions];
    updatedSteps[index] = { ...updatedSteps[index], value: text };
    setInstructions(updatedSteps);
  };

  const sections = [
    {
      title: 'Recipe Information',
      data: [
        { key: 'title', value: title, placeholder: 'Title', onChange: setTitle },
        {
          key: 'ingredients',
          value: ingredients,
          placeholder: 'Ingredients (comma separated)',
          onChange: setIngredients,
        },
      ],
    },
    {
      title: 'Instructions',
      data: instructions,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.key}
        renderItem={({ item, section, index }) => {
          if (section.title === 'Recipe Information') {
            return (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={item.value}
                  placeholder={item.placeholder}
                  onChangeText={item.onChange}
                />
              </View>
            );
          } else if (section.title === 'Instructions') {
            return (
              <View style={styles.stepContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={item.placeholder}
                  value={item.value}
                  onChangeText={text => handleChangeStep(text, index)}
                />
                <TouchableOpacity onPress={() => removeStep(index)}>
                  <Icon name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            );
          }
          return null;
        }}
        ListFooterComponent={() => (
          <View>
            <Button title="Add Step" onPress={addStep} />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        )}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
});

export default EditRecipeScreen;
