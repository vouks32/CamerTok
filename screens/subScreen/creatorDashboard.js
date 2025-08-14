import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { SubScreenStyles } from './SubScreenStyles';
import { useAuth } from '../../context/AuthContext';


const CreatorDashboard = ({ navigation }) => {
    const { user, logout } = useAuth();
  
  return(<>
  <Text style={{color : "#fff", paddingTop : 100, textAlign : "center", alignSelf : "center"}}>Nothing in here</Text>
  <TouchableOpacity onPress={logout} style={styles.Button}><Text style={styles.ButtonText}>Log OUT !</Text></TouchableOpacity>
  </>)
};

const styles = SubScreenStyles

export default CreatorDashboard;