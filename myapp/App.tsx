import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import EventScreen from './screens/EventScreen';
import PaymentScreen from './screens/PaymentScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import ProfileScreen from './screens/ProfileScreen';

type ScreenName =
  | 'Login'
  | 'Register'
  | 'Home'
  | 'Event'
  | 'Payment'
  | 'Confirmation'
  | 'Profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Login');
  const [params, setParams] = useState<Record<string, any>>({});

  const navigation = {
    navigate: (screen: ScreenName, newParams: Record<string, any> = {}) => {
      setParams(newParams);
      setCurrentScreen(screen);
    },
    replace: (screen: ScreenName, newParams: Record<string, any> = {}) => {
      setParams(newParams);
      setCurrentScreen(screen);
    },
    goBack: () => {
      const prev = params._prev as ScreenName | undefined;
      setCurrentScreen(prev || 'Login');
    },
  };

  const route = { params };

  const screenProps = { navigation, route };

  return (
    <View style={styles.container}>
      {currentScreen === 'Login'        && <LoginScreen        {...screenProps} />}
      {currentScreen === 'Register'     && <RegisterScreen     {...screenProps} />}
      {currentScreen === 'Home'         && <HomeScreen         {...screenProps} />}
      {currentScreen === 'Event'        && <EventScreen        {...screenProps} />}
      {currentScreen === 'Payment'      && <PaymentScreen      {...screenProps} />}
      {currentScreen === 'Confirmation' && <ConfirmationScreen {...screenProps} />}
      {currentScreen === 'Profile'      && <ProfileScreen      {...screenProps} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
});