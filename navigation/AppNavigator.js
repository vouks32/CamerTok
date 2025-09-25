// navigation/AppNavigator.js
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import RoleGateway from '../screens/RoleGateway';
import Login from '../screens/Login';
import Dashboard from '../screens/Dashboard';
import CampaignHub from '../screens/CampaignHub';
import Home from '../screens/Home';
import TikTokAuth from '../screens/TikTokAuth';
import BrowseCampaigns from '../screens/BrowseCampaigns';
import Profile from '../screens/Profile';
import NotificationCenter from '../screens/NotificationCenter';
import NotificationScreen from '../screens/Notifications';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const [accessToken, setAccessToken] = useState(null);
  const [openId, setOpenId] = useState(null);

  const handleLogin = (token, id) => {
    setAccessToken(token);
    setOpenId(id);
    console.log('tiktok', token, id)
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      {user ? (
        // Authenticated screens
        <>
          {user.userType === "creator" && (
            <Stack.Screen
              name="TiktokLogin"
              component={TikTokAuth}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
          />
          <Stack.Screen
            name="CampaignHub"
            component={CampaignHub}
            options={({ route }) => ({
              title: route.params.mode === 'create'
                ? 'Créer une campagne'
                : route.params.mode === 'edit'
                  ? 'Modifier une campagne'
                  : route.params.mode === 'stats'
                  ? 'Statistiques de la campagne'
                  : 'Détails de la campagne'
            })}
          />
          <Stack.Screen
            name="BrowseCampaigns"
            component={BrowseCampaigns}
            options={{ title: 'Parcourir les campagnes' }}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ title: 'Profil' }}
          />
          <Stack.Screen
            name="NotificationCenter"
            component={NotificationCenter}
            options={{ title: 'Notifications' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ title: 'Login' }}
          />
          <Stack.Screen
            name="RoleGateway"
            component={RoleGateway}
            options={{ title: 'Create Account' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;