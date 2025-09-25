// screens/Profile.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
const {width, height} = Dimensions.get('window')

const Profile = ({ navigation }) => {
  const { logout, user, allCampaigns, baseUrl } = useAuth();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    setCampaigns(allCampaigns.docs.filter(c => c.evolution?.participatingCreators?.some(p => p.creator.email === user.email)))
  }, [allCampaigns])

  return (
    <ScrollView style={styles.container}>

      <View style={[styles.section, { marginHorizontal: 10, alignItems: 'center', }]}>
        <Ionicons name="person-circle" size={64} color="#FF0050" />
        <Text style={styles.title}>{user.username}</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity
            style={{ padding: 10,  backgroundColor: "#ff3333", margin: 20, borderRadius: 10 }}
            onPress={() => { }}>
            <Text style={{ color: "white", textAlign: "center" }}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: "#ff3333", margin: 20, borderRadius: 10 }}
            onPress={() => logout()}>
            <Text style={{ color: "white", textAlign: "center" }}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { marginHorizontal: 10,  }]}>
        <Text style={styles.subtitle}>Solde</Text>
        <Text style={styles.title}>{user.bank?.solde || 0} CFA</Text>

        <ScrollView horizontal style={{ marginVertical: 20 }} >
          {campaigns.map(item => (
            <TouchableOpacity key={item.id} style={styles.campaignContainer} onPress={() => navigation.navigate('CampaignHub', {
              campaignId: item?.id,
              mode: 'stats'
            })}>
              <Image
                source={{
                  uri: `${baseUrl}/api/campaigndocs/${item.id}/${item.campaignInfo.image}`
                }}
                style={styles.campaignImage}
              />
              <Text style={styles.smalltitle}>{item.campaignInfo.title}</Text>
              <Text style={styles.subtitle}>Vidéos: {item.evolution?.participatingCreators?.find(c => c.creator.email === user.email)?.length}</Text>
              <Text style={styles.subtitle}>Solde: {item.evolution?.participatingCreators?.find(c => c.creator.email === user.email).videos?.solde || 0} CFA</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingVertical: 20,
    maxHeight : height
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    color: '#00F2EA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  smalltitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  campaignImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  campaignContainer: {
    width: 200,
    borderColor: "#fff8",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginRight : 10
  }
});

export default Profile;
