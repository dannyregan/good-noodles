import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ResetPasswordScreen from './app/auth/ResetPasswordScreen';
import Auth from './app/auth';

const Stack = createStackNavigator();

const linking = {
  prefixes: [Linking.createURL('/'), 'exp://', 'goodnoodles://'],
  config: {
    screens: {
      Auth: '',
      ResetPassword: 'reset-password', // This will match /reset-password and /--/reset-password
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}