import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import SearchScreen from './src/screens/SearchScreen';
import CameraScreen from './src/screens/CameraScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#E63946',
            tabBarInactiveTintColor: '#bbb',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#f0f0f0',
              paddingBottom: 4,
              height: 60,
            },
            tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
          }}
        >
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text> }}
          />
          <Tab.Screen
            name="Identify"
            component={CameraScreen}
            options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📷</Text> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
