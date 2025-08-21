import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CreatorHome from './CreatorHome';
import BusinessHome from './BusinessHome';


const Home = ({ route, navigation }) => {
  const { user, logout, allCampaigns } = useAuth();
  const [campaigns, setCampaigns] = useState([]);


  // Add to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  useEffect(() => {
    // Replace with API call to fetch campaigns
    setCampaigns(allCampaigns);
  }, []);


  return (
    <View style={styles.container}>
      
      {user && user.userType === 'creator'
        ? <CreatorHome navigation={navigation} />
        : <BusinessHome navigation={navigation} />
      }

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#121212',
    paddingTop: 0
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
    marginRight: 15
  },
  logoutText: {
    color: '#FF0050',
    fontWeight: '500'
  }
});

export default Home;