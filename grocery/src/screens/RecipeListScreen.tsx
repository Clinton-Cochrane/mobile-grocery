import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {getRecipes, deleteRecipe} from '../api/api';
import {NavigationProp} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/ParamList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import debounce from 'lodash/debounce';
import {RouteProp} from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

const screenHeight = Dimensions.get('window').height;
const optimalPageSize = Math.floor(screenHeight / 100) * 10;

type RecipesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Recipes'
>;

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  total_time?: string;
  utensils?: string;
  difficulty?: string;
}

interface RecipeListScreenProps {
  navigation: RecipesScreenNavigationProp;
  selectedRecipes: Set<string>;
  setSelectedRecipes: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({
  navigation,
  selectedRecipes,
  setSelectedRecipes,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null); // Tracks expanded items
  const [multiSelectMode, setMultiSelectMode] = useState(false); // Toggle multi-select mode
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [pageSize] = useState(optimalPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterHeight] = useState(new Animated.Value(0));
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  const fetchRecipes = async (newPage = 1) => {
    if (newPage === 1) setIsInitialLoad(true); // For initial load
    setLoading(true);
    try {
      const {recipes: fetchedRecipes, globalTotalPages} = await getRecipes(
        newPage,
        pageSize,
        searchTerms,
        difficulty,
        ingredient,
      );
      setRecipes(prevRecipes => {
        const updatedRecipes = [...prevRecipes, ...fetchedRecipes];
        return Array.from(
          new Map(updatedRecipes.map(recipe => [recipe._id, recipe])).values(),
        );
      });
      setTotalPages(globalTotalPages);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      alert('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
      if (newPage === 1) setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    setRecipes([]); // Clear existing recipes when filters or search terms change
    fetchRecipes(1);
  }, [searchTerms, difficulty, ingredient]);

  const loadMoreRecipes = async () => {
    if (loading || page >= totalPages) return;
    const nextPage = page + 1;
    await fetchRecipes(nextPage);
    setPage(nextPage);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
      fetchRecipes();
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const getAggregatedIngredients = (
    recipes: Recipe[],
    selectedRecipes: Set<string>,
  ) => {
    const selected = recipes.filter(recipe => selectedRecipes.has(recipe._id));
    const ingredientMap = new Map();

    selected.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        ingredientMap.set(ingredient, (ingredientMap.get(ingredient) || 0) + 1);
      });
    });

    return Array.from(ingredientMap.entries()).map(
      ([ingredient, count]) => `${ingredient} (${count})`,
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prevID => (prevID === id ? null : id));
  };

  const toggleSelectRecipe = (id: string) => {
    setSelectedRecipes(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const removeSearchTerm = (index: number) => {
    setSearchTerms(prev => prev.filter((_, i) => i !== index));
  };

  const RecipeItem = React.memo(
    ({
      item,
      isExpanded,
      toggleExpand,
      handleDelete,
      navigation,
    }: {
      item: Recipe;
      isExpanded: boolean;
      toggleExpand: () => void;
      handleDelete: (id: string) => void;
      navigation: NavigationProp<any>;
    }) => {
      return (
        <View>
          <View style={[styles.item, isExpanded && styles.expandedItem]}>
            <TouchableOpacity onPress={toggleExpand} style={styles.header}>
              <Text
                style={styles.title}
                numberOfLines={isExpanded ? undefined : 1}
                ellipsizeMode="tail">
                {item.title}
              </Text>
              <Icon
                name={isExpanded ? `keyboard-arrow-up` : `keyboard-arrow-down`}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text>Total Time: {item.total_time || 'N/A'}</Text>
                <Text>Utensils: {item.utensils || 'None'}</Text>
                <Text># of Ingredients: {item.ingredients.length}</Text>
                <Text>Difficulty: {item.difficulty || 'Unknown'}</Text>
              </View>
            )}

            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => toggleSelectRecipe(item._id)}>
                <Icon
                  name={
                    selectedRecipes.has(item._id) ? `edit` : `add-shopping-cart`
                  }
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EditRecipe', {id: item._id})
                }>
                <Icon name="edit" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    (prevProps, nextProps) => {
      // Prevent unnecessary re-renders if props are unchanged
      return (
        prevProps.item === nextProps.item &&
        prevProps.isExpanded === nextProps.isExpanded
      );
    },
  );

  const renderRecipeItem = useCallback(
    ({item}: {item: Recipe}) => {
      return (
        <RecipeItem
          item={item}
          isExpanded={expandedId === item._id}
          toggleExpand={() => toggleExpand(item._id)}
          handleDelete={handleDelete}
          navigation={navigation}
        />
      );
    },
    [expandedId, navigation],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => !loading && setFilterVisible(prev => !prev)}>
        <Text style={styles.filterToggle}>
          {filterVisible ? 'Hide Filters' : 'Show Filters'}
        </Text>
      </TouchableOpacity>
      {filterVisible && (
        <Animated.View style={{height: filterHeight}}>
          {/* Search Bar */}
          <View style={styles.chipContainer}>
            {searchTerms.map((term, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{term}</Text>
                <TouchableOpacity onPress={() => removeSearchTerm(index)}>
                  <Icon name="close" size={14} color="fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Filters */}
          <View style={styles.filterInput}>
            <RNPickerSelect
              placeholder={{label: 'Filter by Difficulty', value: null}}
              onValueChange={(value: string) => setDifficulty(value)}
              items={[
                {label: 'Easy', value: 'Easy'},
                {label: 'Medium', value: 'Medium'},
                {label: 'Hard', value: 'Hard'},
              ]}
            />
          </View>
          <TextInput
            placeholder="Filter by Ingredient"
            value={ingredient}
            onChangeText={setIngredient}
            style={styles.filterInput}
          />

          {/* Alphabet Filter */}
        </Animated.View>
      )}

      {/* Recipes List */}
      {isInitialLoad ? (
        <ActivityIndicator size="large" color="#00f"></ActivityIndicator>
      ) : (
        <View style={{flex: 1}}>
          <FlashList
            data={recipes}
            renderItem={renderRecipeItem}
            estimatedItemSize={optimalPageSize}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            extraData={expandedId}
            onEndReached={() => {
              loadMoreRecipes();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? <ActivityIndicator size="small" color="#00f" /> : null
            }
          />
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddRecipe')}>
        <Icon
          name={multiSelectMode ? 'share' : 'add'}
          size={30}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Ensure there's a proper background
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  letterButton: {
    padding: 5,
    margin: 2,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  selectedLetterButton: {
    backgroundColor: '#6200ee',
  },
  item: {
    flexDirection: 'column', // Changed from 'row' to stack title and icons
    alignItems: 'stretch',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#e0f7fa',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 12,
    color: 'gray',
  },
  filterToggle: {
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    backgroundColor: '#6200ee',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 5,
    marginBottom: 5,
  },
  chipText: {
    color: '#fff',
    marginRight: 5,
  },

  filterSection: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200ee',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  clearSelection: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Adjust as needed for alignment
    alignItems: 'center',
    gap: 10, // Add spacing between icons (React Native 0.71+)
  },
  clearText: {
    color: 'white',
    fontWeight: 'bold',
  },
  expandedItem: {
    backgroundColor: '#e0f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedContent: {
    marginTop: 10,
    backgroundColor: '#e8f5e9', // Optional background for clarity
    padding: 5,
    borderRadius: 4,
  },
});

export default RecipeListScreen;
