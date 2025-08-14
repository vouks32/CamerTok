// screens/LoadingScreen.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TikTok Campaign Platform</Text>
      <ActivityIndicator size="large" color="#FF0050" />
      <Text style={styles.text}>Checking session...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30
  },
  text: {
    color: '#aaa',
    marginTop: 20
  }
});

export default LoadingScreen;