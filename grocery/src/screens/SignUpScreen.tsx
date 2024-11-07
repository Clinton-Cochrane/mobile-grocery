import {NavigationProp} from '@react-navigation/native';
import {useState} from 'react';
import {SignUp} from '../api/api';
import {TextInput,Text, View, ActivityIndicator, Button} from 'react-native';
interface SignUpScreenProps {
  navigation: NavigationProp<any>;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<String | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      console.log('Signing up the user...');
      await SignUp(email, password);
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Sign Up Error', error.message);
      setError(error.message || 'Sign UpFailed');
    } finally {
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
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text> {error}</Text> : null}
      {loading ? <ActivityIndicator/> : (
        <>
        <Button title = "Sign Up" onPress={handleSignUp}/>
        <Button title = "Login" onPress={() => navigation.navigate('Login')}/>
        </>
      )}
    </View>
  );
};

export default SignUpScreen;
