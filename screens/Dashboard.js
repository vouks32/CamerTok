import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CreatorDashboard from './subScreen/creatorDashboard';
import BussinessDashboard from './subScreen/bussinessDashboard';
import { Ionicons } from '@expo/vector-icons';


const Dashboard = ({ route, navigation }) => {
  const { user, logout } = useAuth();


  // Add to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="person-circle" size={24} color="#FF0050" />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      
      {user && user.userType === 'creator'
        ? <CreatorDashboard route={route} navigation={navigation} />
        : <BussinessDashboard route={route} navigation={navigation} />
      }


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    paddingTop: 20
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statsText: {
    color: '#aaa',
    fontSize: 16
  },
  sectionTitle: {
    color: '#FF0050',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  logoutButton: {
    marginRight: 30
  },
  logoutText: {
    color: '#FF0050',
    fontWeight: '500'
  }
});

export default Dashboard;