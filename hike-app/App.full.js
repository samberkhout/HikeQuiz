import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import CheckpointScreen from './screens/CheckpointScreen';
import QuestionScreen from './screens/QuestionScreen';
import FinishScreen from './screens/FinishScreen';
import { UserProvider } from './context/UserContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Hike Quiz' }}
          />
          <Stack.Screen 
            name="Checkpoint" 
            component={CheckpointScreen}
            options={{ title: 'Checkpoint' }}
          />
          <Stack.Screen 
            name="Question" 
            component={QuestionScreen}
            options={{ title: 'Question' }}
          />
          <Stack.Screen 
            name="Finish" 
            component={FinishScreen}
            options={{ title: 'Congratulations!' }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserProvider>
  );
}
