import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as Linking from 'expo-linking';

const openInSystemBrowser = async (url) => {
  // Check if the device supports opening the URL
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    // Open the link in default system browser
    await Linking.openURL(url);
  } else {
    console.error(`Don't know how to open this URL: ${url}`);
  }
};


export default function TikTokAuth({ onLogin, navigation }) {
  const { user } = useAuth()
  const REDIRECT_URI = 'https://campay-api.vercel.app/api/auth?email=' //J'utilise vercel pour valider tiktok parceque AWS n'offre pas de https

  const promptAsync = () => {
    openInSystemBrowser(REDIRECT_URI + user.email);
  }
  
  const handleDeepLink = async (event) => {
    // Parse redirect URL
    const url = Linking.parse(event.url);
    
    if (url.path === 'TiktokLogin') {
      const { code, state } = url.queryParams;
      
      if (!code) {
        Alert.alert('Error', 'Authorization failed: No code returned');
        return;
      }

      try {
        // Exchange code for token
        
      } catch (error) {
        console.error('Token exchange error:', error);
        Alert.alert('Error', 'Failed to authenticate');
      }
    }
  };

  useEffect(() => {
    // Add deep link listener
    const sub = Linking.addEventListener('url', handleDeepLink);

    // Clean up listener
    return () => sub.remove()
  }, []);

  return (
    <View>
      <Button
        title="Login with TikTok"
        onPress={() => promptAsync()}
      />
    </View>
  );
}