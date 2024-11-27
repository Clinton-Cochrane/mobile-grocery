import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';
import EditRecipeScreen from './src/screens/EditRecipeScreen';
import SelectedRecipesScreen from './src/screens/SelectedRecipesScreen';
import {RootStackParamList} from './src/navigation/ParamList';
import {ActivityIndicator, View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TopTabNavigator = ({
  selectedRecipes,
  setSelectedRecipes,
}: {
  selectedRecipes: Set<string>;
  setSelectedRecipes: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => (
  <Tab.Navigator
  screenOptions={{
    tabBarStyle: { backgroundColor: '#6200ee' },
    tabBarLabelStyle: { fontWeight: 'bold', color: '#fff' },
    tabBarIndicatorStyle: { backgroundColor: '#fff' },
  }}
>
  <Tab.Screen
    name="All Recipes"
    options={{ tabBarIcon: ({ color, focused }) => (
      <Icon name="menu-book" size={24} color={focused ? '#6200ee' : color} />
    ), }}
    children={(props: any) => (
      <RecipeListScreen
        {...props}
        selectedRecipes={selectedRecipes}
        setSelectedRecipes={setSelectedRecipes}
      />
    )}
  />
  <Tab.Screen
    name="Selected Recipes"
    options={{  tabBarIcon: ({ color, focused }) => (
      <Icon name="shopping-cart" size={24} color={focused ? '#6200ee' : color} />
    ),}}
    children={(props: any) => (
      <SelectedRecipesScreen
        {...props}
        selectedRecipes={selectedRecipes}
      />
    )}
  />
</Tab.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set(),
  );
  const [user, setUser] = useState(true);

  // Handle user state changes
  useEffect(() => {
    if (initializing) setInitializing(false);
  });

  if (initializing) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Recipes' : 'Login'}>
        {user ? (
          <>
            <Stack.Screen name="Recipes" options={{headerShown: false}}>
              {(props: any) => (
                <TopTabNavigator
                  {...props}
                  selectedRecipes={selectedRecipes}
                  setSelectedRecipes={setSelectedRecipes}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AddRecipe" component={AddRecipeScreen} />
            <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{headerShown: false}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
