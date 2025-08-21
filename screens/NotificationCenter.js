// screens/NotificationCenter.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationCenter = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="notifications" size={64} color="#FF0050" />
        <Text style={styles.title}>Centre de notifications</Text>
        <Text style={styles.subtitle}>Page en cours de développement</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default NotificationCenter;
