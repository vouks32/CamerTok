import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import VideoSubmit from '../components/VideoSubmit';
import CreateCampaign from './CampaignHub/create';
import ViewCampaign from './CampaignHub/view';

const NUM_CAMPAIGN_CREATION_STEPS = 3;

const CampaignHub = ({ route, navigation }) => {

  const { mode, campaignId, campaignScope, selectedCreators } = route.params

  if (mode === 'create') {
    return <CreateCampaign navigation={navigation} scope={campaignScope} selectedCreator={selectedCreators} />
  }

  // Ajout du mode édition
  if (mode === 'edit' && campaignId) {
    return <CreateCampaign navigation={navigation} edit={true} campaignId={campaignId} />
  }

  if (mode === 'apply' && campaignData) {
    return (
      <View>
        <Text style={styles.title}>{campaignData.title}</Text>
        <Text style={styles.reward}>Reward: {campaignData.reward} FCFA</Text>
        <Text style={styles.description}>{campaignData.description}</Text>
        <Text style={styles.requirements}>Requirements: {campaignData.requirements}</Text>

        <VideoSubmit campaignId={campaignData.id} />
      </View>
    );
  }

  if (mode === 'view') {
    return (
      <ViewCampaign navigation={navigation} campaignId={campaignId} />
    );
  }

  return <Text>Loading campaign data...</Text>;

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#121212'
  },
  sectionTitle: {
    color: '#00F2EA',
    fontSize: 20,
    marginTop: 10,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    backgroundColor: '#555',
    color: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15
  },
  label: {
    color: '#aaa',
    marginBottom: 10
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  reward: {
    color: '#25D366',
    fontSize: 18,
    marginBottom: 15
  },
  description: {
    color: '#ddd',
    marginBottom: 15
  },
  requirements: {
    color: '#FFC107',
    marginBottom: 20
  },
  views: {
    color: '#00F2EA',
    fontSize: 18,
    marginBottom: 10
  },
  analytics: {
    color: '#ddd',
    marginBottom: 5
  },
  Button: {
    backgroundColor: '#FF0050',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,

  },
  ButtonText: {
    color: '#fff',
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold"
  },
  dateOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#ddd8",
    alignItems: "center"
  },
  datePickerContainer: {
    position: "absolute",
    width: "80%",
    padding: 10,
    borderRadius: 10,
    top: "20%",
    backgroundColor: "#222"
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#555',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 5
  },
  inputAndroid: {
    backgroundColor: '#555',
    color: 'white',
    padding: 5,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 5

  }
});

export default CampaignHub;