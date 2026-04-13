import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-url-polyfill/auto';

// Context
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Screens
import { AuthScreen } from './src/screens/AuthScreen';
import { ClientHomeScreen } from './src/screens/ClientHomeScreen';
import { ProfessionalHomeScreen } from './src/screens/ProfessionalHomeScreen';
import { ProfessionalProfileSetup } from './src/screens/ProfessionalProfileSetup';
import { StylistProfileScreen } from './src/screens/StylistProfileScreen';
import { ClientAppointmentsScreen } from './src/screens/ClientAppointmentsScreen';

// Theme
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // user.prefs.role will be 'user' or 'professional' based on registration
  const isProfessional = user?.prefs?.role === 'professional';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          isProfessional ? (
            <>
              <Stack.Screen name="ProfessionalHome" component={ProfessionalHomeScreen} />
              <Stack.Screen name="ProfessionalSetup" component={ProfessionalProfileSetup} />
            </>
          ) : (
            <>
              <Stack.Screen name="ClientHome" component={ClientHomeScreen} />
              <Stack.Screen name="StylistProfile" component={StylistProfileScreen} />
              <Stack.Screen name="ClientAppointments" component={ClientAppointmentsScreen} />
            </>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}