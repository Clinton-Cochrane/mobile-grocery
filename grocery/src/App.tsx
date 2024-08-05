import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import RecipeListScreen from './screens/RecipeListScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import EditRecipeScreen from './screens/EditRecipeScreen';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { RootStackParamList } from './navigation/ParamList';


const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Recipes" : "Login"}>
        {user ? (
          <>
            <Stack.Screen name="Recipes" component={RecipeListScreen} />
            <Stack.Screen name="AddRecipe" component={AddRecipeScreen} />
            <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
