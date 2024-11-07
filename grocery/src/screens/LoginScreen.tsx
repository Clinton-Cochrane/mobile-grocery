import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
//import { SignIn } from "../api/api";
import { TextInput } from "react-native-gesture-handler";
import { ActivityIndicator, Button, View,Text } from "react-native";

interface LoginScreenProps {
  navigation: NavigationProp<any>
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null > (null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

   try {
    //await SignIn(email,password);
    console.log('User has signed in!')
    navigation.navigate('Recipes')
   } catch (error:any) {
    setError(error.message || 'Login Failed?');
   }finally{
    setLoading(false);
   }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none" 
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value = {password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text>{error}</Text> : null}
      {loading ? <ActivityIndicator/>:(
        <>
          <Button title = "Login" onPress = {handleLogin}/>
          <Button title = "Sign Up" onPress = {() => navigation.navigate('SignUp')}/>
        </>
      )}
    </View>
  );
};

export default LoginScreen;