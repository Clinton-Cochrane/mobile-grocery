import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NavigationProp } from '@react-navigation/native';

interface LoginScreenProps {
  navigation: NavigationProp<any>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in!');
      // Navigate to the main application screen after successful login
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
