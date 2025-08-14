// screens/business/BusinessHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, ImageBackground, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SubScreenStyles } from './subScreen/SubScreenStyles'
import heroImage from '../assets/images/hero-side.png'
import { ScrollView } from 'react-native-gesture-handler';

const BusinessHome = ({ navigation }) => {
  const { user, allUsers, allCampaigns } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  // Filtrer les créateurs basé sur la recherche
  useEffect(() => {
    if (allUsers?.docs) {

      const creators = allUsers.docs.filter(user =>
        user.userType === 'creator' &&
        (user.tiktokUser?.user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.tiktokUser?.user.username?.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      setFilteredCreators(creators);
      setLoadingCreators(false);
    }
  }, [searchQuery, allUsers]);

  // Toggle la sélection d'un créateur
  const toggleCreatorSelection = (creator) => {
    setSelectedCreators(prev =>
      prev.some(c => c.id === creator.id)
        ? prev.filter(c => c.id !== creator.id)
        : [...prev, creator]
    );
  };

  // Lancer une campagne
  const launchCampaign = (scope) => {
    navigation.navigate('CampaignHub', {
      mode: 'create',
      campaignScope: scope,
      selectedCreators: scope === 'all' ? null : selectedCreators
    });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={[styles.header, { borderBottomLeftRadius: 35, borderBottomRightRadius: 35, overflow: "hidden" }]}>
          <ImageBackground source={heroImage} style={{ padding: 20, paddingVertical: 60 }}>
            <Text style={[styles.subHeader]}>
              Bienvenue,
            </Text>
            <Text style={styles.welcomeText}>
              {user.companyName || user.email}
            </Text>
            <Text style={[styles.subHeader, { width: '50%', fontSize: 12 }]}>
              Gérez vos collaborations avec les créateurs de contenu
            </Text>
          </ImageBackground>

        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {allCampaigns?.docs?.some(_c => _c.campaignOwner === user.email) ?
            <View style={styles.quickActions}>
              <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Collaboration équitable avec Kolabo</Text>
              <View style={[styles.actionRow, { justifyContent: "space-evenly" }]}>
                <TouchableOpacity
                  style={[styles.actionCard, { width: "45%" }]}
                  onPress={() => navigation.navigate('Dashboard')}
                >
                  <Ionicons name="megaphone" size={24} color="#FF0050" />
                  <Text style={styles.actionText}>{'Mes Campagnes'}</Text>
                  <Text style={[styles.actionText, { color: "#999" }]}>{allCampaigns.docs.filter(_c => _c.campaignOwner === user.email && _c.status === "active").length} en cours • {allCampaigns.docs.filter(_c => _c.campaignOwner === user.email && _c.status === "review").length} en attente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionCard, { width: "45%" }]}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Ionicons name="person-circle" size={24} color="#FF0050" />
                  <Text style={styles.actionText}>Mon profil</Text>
                  <Text style={[styles.actionText, { color: "#999" }]}>solde : {user.bank?.solde || 0} FCFA</Text>

                </TouchableOpacity>
              </View>
            </View>
            :
            <View style={styles.quickActions}>
              <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Collaboration équitable avec Kolabo</Text>
              <Text style={[styles.subHeader, { textAlign: 'center', fontSize: 14 }]}>Laissez des influenceurs faire votre publicité, faite croitre votre activité en lanceant des campagnes, et payez uniquement pour les vues obtenues</Text>
            </View>
          }


          {/* Options de campagne rapide */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Lancer une campagne</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionCard, { opacity: (selectedCreators.length !== 1) ? 0.3 : 1 }]}
                onPress={() => launchCampaign('single')}
                disabled={selectedCreators.length !== 1}
              >
                <Ionicons name="person" size={24} color="#FF0050" />
                <Text style={styles.actionText}>Pour un seul Créateur</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { opacity: (selectedCreators.length < 2) ? 0.3 : 1 }]}
                onPress={() => launchCampaign('multiple')}
                disabled={selectedCreators.length < 2}
              >
                <Ionicons name="people" size={24} color="#FF0050" />
                <Text style={styles.actionText}>
                  {selectedCreators.length > 0
                    ? `${selectedCreators.length} sélectionnés`
                    : 'Sélection multiple'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => launchCampaign('all')}
              >
                <Ionicons name="globe" size={24} color="#FF0050" />
                <Text style={styles.actionText}>Tous les créateurs</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recherche de créateurs */}
          <View style={styles.searchContainer}>
            <Text style={styles.sectionTitle}>Trouver des créateurs</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#aaa" />
              <TextInput
                placeholder="Rechercher par nom ou pseudo"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          {/* Liste des créateurs */}

          <ScrollView style={styles.creatorList}>
            {filteredCreators.length === 0 && !loadingCreators && (
              <Text style={styles.emptyText}>
                Aucun créateur trouvé
              </Text>
            )}
            {
              loadingCreators ? (
                <ActivityIndicator size="small" color="#FF0050" />
              ) : (
                filteredCreators.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.creatorCard,
                      selectedCreators.some(c => c.id === item.id) && styles.selectedCreator
                    ]}
                    onPress={() => toggleCreatorSelection(item)}
                  >
                    <Image
                      source={{ uri: item.tiktokUser?.user.avatarThumb || 'https://via.placeholder.com/60' }}
                      style={styles.creatorAvatar}
                    />
                    <View style={styles.creatorInfo}>
                      <Text style={styles.creatorName}>
                        {item.tiktokUser?.user.nickname || 'Créateur inconnu'}
                      </Text>
                      <Text style={styles.creatorUsername}>
                        @{item.tiktokUser?.user.username || 'non disponible'}
                      </Text>
                      <Text style={styles.creatorStats}>
                        {item.tiktokUser?.stats?.followerCount
                          ? `${Math.floor(item.tiktokUser.stats.followerCount / 1000)}k abonnés • `
                          : ''}
                        {item.tiktokUser?.stats?.engagementRate
                          ? `${item.tiktokUser.stats.engagementRate}% engagement`
                          : ''}
                      </Text>
                    </View>

                    <Ionicons
                      name={selectedCreators.some(c => c.id === item.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color="#FF0050"
                    />
                  </TouchableOpacity>
                ))
              )}
          </ScrollView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView >
  );
};

const styles = StyleSheet.create({
  ...SubScreenStyles,
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 0,
  },
  header: {
    marginBottom: 20,
    paddingTop: 0,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: '#aaa',
  },
  quickActions: {
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    justifyContent: 'center' // Center content
  },
  actionText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    marginLeft: 10,
  },
  creatorList: {
    paddingBottom: 20,
    maxHeight: 300
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 15,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCreator: {
    borderColor: '#FF0050',
    backgroundColor: '#2a1a1f',
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  creatorUsername: {
    color: '#FF0050',
    fontSize: 14,
    marginBottom: 4,
  },
  creatorStats: {
    color: '#aaa',
    fontSize: 12,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    color: '#00F2EA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
  },
});

export default BusinessHome;