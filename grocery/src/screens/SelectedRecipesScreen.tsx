import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
}

interface SelectedRecipesScreenProps {
    selectedRecipes: Set<string>;
}

const SelectedRecipesScreen: React.FC<SelectedRecipesScreenProps> = ({
    selectedRecipes,
}) => {

    if (selectedRecipes.size === 0) {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>No recipes selected yet.</Text>
          </View>
        );
      }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected Recipes</Text>
      {Array.from(selectedRecipes).map((recipeId, index) => (
        <Text key = {index} style ={styles.recipe}>
            {recipeId}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipe: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default SelectedRecipesScreen;
