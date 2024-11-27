import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/ParamList';
import {StackNavigationProp} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import {getRecipeById} from '../api/api';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';

type DetailedViewScreenRouteProp = RouteProp<
  RootStackParamList,
  'DetailedView'
>;
type DetailedViewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DetailedView'
>;

interface DetailedViewScreenProps {
  route: DetailedViewScreenRouteProp;
  navigation: DetailedViewScreenNavigationProp;
}

const DetailedViewScreen: React.FC<DetailedViewScreenProps> = ({
  route,
  navigation,
}) => {
  const {id} = route.params;
  const [recipe, setRecipe] = useState<{
    title: string;
    ingredients: string[];
    instructions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await getRecipeById(id);
        setRecipe(recipeData);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#551166"
        style={styles.loadingIndicator}
      />
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ruh Roh 404 Recipe not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      <ScrollView>
        {recipe.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.text}>
            {ingredient}
          </Text>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Instructions:</Text>
      <ScrollView>
        {recipe.instructions.map((instruction, index) => (
          <Text key={index} style={styles.instructionItem}>
            {index + 1}. {instruction}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  instructionItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default DetailedViewScreen;
