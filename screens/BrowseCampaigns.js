// screens/BrowseCampaigns.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const BrowseCampaigns = ({ navigation }) => {
  const { user, allCampaigns } = useAuth();
  const [availableCampaigns, setAvailableCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableCampaigns();
  }, [allCampaigns]);

  const loadAvailableCampaigns = () => {
    if (!allCampaigns?.docs || !user) return;

    // Get campaigns where this creator is not yet participating
    const available = allCampaigns.docs.filter(campaign => 
      campaign.status === 'active' && 
      !campaign.evolution?.participatingCreators?.find(c => c.creator.email === user.email)
    );

    setAvailableCampaigns(available);
    setLoading(false);
  };

  const applyToCampaign = (campaign) => {
    Alert.alert(
      'Postuler à la campagne',
      `Voulez-vous postuler à la campagne "${campaign.campaignInfo.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Postuler', 
          onPress: () => {
            navigation.navigate('CampaignHub', {
              mode: 'apply',
              campaignId: campaign.id
            });
          }
        }
      ]
    );
  };

  const renderCampaign = ({ item }) => (
    <TouchableOpacity
      style={styles.campaignCard}
      onPress={() => applyToCampaign(item)}
    >
      <Image
        source={{ 
          uri: `http://192.168.1.139:3001/api/campaigndocs/${item.id}/${item.campaignInfo.image}` 
        }}
        style={styles.campaignImage}
      />
      <View style={styles.campaignInfo}>
        <Text style={styles.campaignTitle} numberOfLines={2}>
          {item.campaignInfo.title}
        </Text>
        <Text style={styles.campaignDescription} numberOfLines={3}>
          {item.campaignInfo.description}
        </Text>
        <Text style={styles.campaignReward}>
          {item.campaignCreatorsAndBudget?.totalBudget} FCFA
        </Text>
        <View style={styles.campaignMeta}>
          <Text style={styles.campaignMetaText}>
            {item.campaignCreatorsAndBudget?.limitParticipatingCreator?.creators?.length || 0} créateurs
          </Text>
          <Text style={styles.campaignMetaText}>
            Expire le {new Date(item.campaignInfo.endDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => applyToCampaign(item)}
      >
        <Ionicons name="add-circle" size={24} color="#FF0050" />
        <Text style={styles.applyButtonText}>Postuler</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement des campagnes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parcourir les campagnes</Text>
        <Text style={styles.headerSubtitle}>
          {availableCampaigns.length} campagne{availableCampaigns.length > 1 ? 's' : ''} disponible{availableCampaigns.length > 1 ? 's' : ''}
        </Text>
      </View>

      {availableCampaigns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>Aucune campagne disponible</Text>
          <Text style={styles.emptyText}>
            Il n'y a actuellement aucune campagne ouverte aux candidatures.
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableCampaigns}
          keyExtractor={(item) => item.id}
          renderItem={renderCampaign}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.campaignList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  campaignList: {
    padding: 20,
  },
  campaignCard: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  campaignImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 12,
  },
  campaignInfo: {
    marginBottom: 12,
  },
  campaignTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  campaignDescription: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  campaignReward: {
    color: '#25D366',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  campaignMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campaignMetaText: {
    color: '#999',
    fontSize: 12,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF0050',
  },
  applyButtonText: {
    color: '#FF0050',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BrowseCampaigns;
