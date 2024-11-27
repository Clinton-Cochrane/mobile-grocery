import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
//typescript boiler plate

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  description?: string;
  total_time?: string;
  prep_time?: string;
  difficulty?: string;
  url?: string;
  saturated_fat?: string;
  fat?: string;
  calories?: string;
  carbohydrate?: string;
  sugar?: string;
  fiber?: string;
  protein?: string;
  cholesterol?: string;
  sodium?: string;
  utensils?: string;
}

export type RootStackParamList = {
  Recipes: { selectedRecipes: Set<string>; setSelectedRecipes: React.Dispatch<React.SetStateAction<Set<string>>> };
  AddRecipe: undefined;          // 'AddRecipe' screen takes no parameters
  EditRecipe: { id: string };    // 'EditRecipe' screen requires the recipe id
  SelectedRecipes: { recipes: Recipe[]; selectedRecipes: string[] };
  Login: undefined;              // 'Login' screen takes no parameters
  SignUp: undefined;             // 'SignUp' screen takes no parameters
  DetailedView: { id: string }  //  'DetailedView' screen requires the recipe id

};


export type EditRecipeScreenRouteProp = RouteProp<RootStackParamList, 'EditRecipe'>;
export type EditRecipeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditRecipe'>;
