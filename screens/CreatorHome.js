// screens/creator/CreatorHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground, ScrollView, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SubScreenStyles } from './subScreen/SubScreenStyles'
import heroImage from '../assets/images/hero-side.png'

const {width, height} = Dimensions.get('window')

const CreatorHome = ({ navigation }) => {
  const { user, UpdateCampaign, isLoading, allCampaigns, baseUrl } = useAuth();
  const [recommendedCampaigns, setRecommendedCampaigns] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    pendingSubmissions: 0
  });

  // Load creator data and campaigns
  useEffect(() => {
    loadCreatorData();
  }, [allCampaigns, user]);

  const loadCreatorData = () => {
    if (!allCampaigns?.docs || !user) return;

    // Get campaigns where this creator is participating
    const creatorCampaigns = allCampaigns.docs.filter(campaign =>
      campaign.evolution?.participatingCreators?.some(
        creator => creator.creator.email === user.email
      ) && campaign.status === "active"
    );

    // Get recommended campaigns (campaigns not yet participated in)
    const recommended = allCampaigns.docs.filter(campaign =>
      campaign.status === 'active' && (campaign.campaignCreatorsAndBudget?.limitParticipatingCreator?.state ? campaign.campaignCreatorsAndBudget?.limitParticipatingCreator?.creators.some(
        c => c.email === user.email
      ) : true) && !creatorCampaigns.some(c => c.id === campaign.id)
    );

    // Calculate stats
    const totalEarnings = creatorCampaigns.reduce((total, campaign) => {
      const myParticipation = campaign.campaignCreatorsAndBudget?.limitParticipatingCreator?.creators?.find(
        creator => creator.email === user.email
      );
      return total + (myParticipation?.earnings || 0);
    }, 0);

    const activeCampaigns = creatorCampaigns.filter(campaign => campaign.status === 'active' && campaign.evolution.participatingCreators.find(c => c.creator.email === user.email).participation.status === 'active').length;
    const completedCampaigns = creatorCampaigns.filter(campaign => campaign.status === 'completed').length;
    const pendingSubmissions = creatorCampaigns.filter(campaign =>
      campaign.status === 'active' &&
      campaign.evolution.participatingCreators.find(c => c.creator.email === user.email).participation.status === 'review'
    ).length;

    setMyCampaigns(creatorCampaigns);
    setRecommendedCampaigns(recommended.slice(0, 5)); // Show top 5 recommended
    setStats({
      totalEarnings,
      activeCampaigns,
      completedCampaigns,
      pendingSubmissions
    });
    setLoading(false);
  };

  // Get creator display name
  const getCreatorDisplayName = () => {
    if (user?.tiktokUser?.user?.nickname) {
      return user.tiktokUser.user.nickname;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Créateur';
  };

  // Get creator summary
  const getCreatorSummary = () => {
    const followerCount = user?.tiktokUser?.stats?.followerCount || 0;
    const formattedFollowers = followerCount > 1000 ? `${Math.floor(followerCount / 1000)}k` : followerCount;

    return `${formattedFollowers} abonnés • ${stats.activeCampaigns} campagne${stats.activeCampaigns > 1 ? 's' : ''} active${stats.activeCampaigns > 1 ? 's' : ''} • ${stats.totalEarnings} FCFA gagnés`;
  };

  // Apply to campaign
  const applyToCampaign = (campaign) => {
    Alert.alert(
      'Postuler à la campagne',
      `Voulez-vous postuler à la campagne "${campaign.campaignInfo.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Postuler',
          onPress: async () => {
            let appliedCampaign = { ...campaign }
            appliedCampaign.evolution.participatingCreators.push({
              creator: {
                email: user.email,
                username: user.username,
              },
              participation: {
                status: "review",
                postulatedDate: Date.now(),
                postulationAcceptanceDate: null
              },
              videos: []
            })
            await UpdateCampaign(appliedCampaign)
            Alert.alert('Félicitation🎉', 'Vous avez postuler à cette campagne, maintenat veillez patienter la validation de votre candidature')
          }
        }
      ]
    );
  };

  // View campaign details
  const viewCampaign = (campaign) => {
    navigation.navigate('CampaignHub', {
      mode: 'view',
      campaignId: campaign.id
    });
  };

  // View campaign details
  const viewCampaignStats = (campaign) => {
    navigation.navigate('CampaignHub', {
      mode: 'stats',
      campaignId: campaign.id
    });
  };

  // Submit video for campaign
  const submitVideo = (campaign) => {
    navigation.navigate('CampaignHub', {
      mode: 'submit',
      campaignId: campaign.id
    });
  };

  // Render recommended campaign card
  const renderRecommendedCampaign = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendedCard}
      onPress={() => viewCampaign(item)}
    >
      <Image
        source={{
          uri: `${baseUrl}/api/campaigndocs/${item.id}/${item.campaignInfo.image}`
        }}
        style={styles.campaignImage}
      />
      <View style={styles.campaignInfo}>
        <Text style={styles.campaignTitle} numberOfLines={2}>
          {item.campaignInfo.title}
        </Text>
        <Text style={styles.campaignReward}>
          {item.campaignCreatorsAndBudget?.totalBudget} FCFA
        </Text>
        <View style={styles.campaignMeta}>
          <Text style={styles.campaignMetaText}>
            {item.campaignCreatorsAndBudget?.limitParticipatingCreator?.creators?.length || 0} créateurs
          </Text>
          <Text style={styles.campaignMetaText}>
            {new Date(item.campaignInfo.endDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      <View style={{flexDirection  :'row', marginTop : 10}}>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => applyToCampaign(item)}
      >
        <Ionicons name="add-circle" size={24} color="#FF0050" />
        <Text style={{color : '#FF0050',}}>Participer</Text>
      </TouchableOpacity>
      </View>

    </TouchableOpacity>
  );

  // Render my campaign card
  const renderMyCampaign = ({ item }) => {

    const LimitOfVideo = item.campaignCreatorsAndBudget.limitContentPerCreator.state ? item.campaignCreatorsAndBudget.limitContentPerCreator.max + "" : '∞';
    const userParticipation = item.evolution.participatingCreators.find(c => c.creator.email === user.email)
    const submitedVideos = userParticipation.videos || []
    const canSubmit = submitedVideos.filter(sv => sv.status == "active").length < (parseInt(LimitOfVideo) || 999999999999999)

    return (
      <TouchableOpacity
        style={styles.myCampaignCard}
        onPress={() => viewCampaign(item)}
      >
        <Image
          source={{
            uri: `${baseUrl}/api/campaigndocs/${item.id}/${item.campaignInfo.image}`
          }}
          style={styles.campaignImage}
        />
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {item.campaignInfo.title}
          </Text>
          <View style={styles.campaignStatus}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: userParticipation.participation.status === 'active' ? '#00F2EA' : '#d29d01ff' }
            ]}>
              <Text style={styles.statusText}>
                {userParticipation.participation.status === 'active' ? 'Participation Validé' : 'Participation En attente de validation'}
              </Text>
            </View>
            {submitedVideos && submitedVideos.find(sv => sv.status == "active") && (
              <View style={[styles.statusBadge, { backgroundColor: '#25D366' }]}>
                <Text style={styles.statusText}>Vidéo validé ({submitedVideos.filter(sv => sv.status == "active").length})</Text>
              </View>
            )}
            {submitedVideos && submitedVideos.find(sv => sv.status == "review") && (
              <View style={[styles.statusBadge, { backgroundColor: '#d29d01ff' }]}>
                <Text style={styles.statusText}>Video en cour de validation ({submitedVideos.filter(sv => sv.status == "review").length})</Text>
              </View>
            )}
          </View>
          <Text style={styles.campaignReward}>
            {item.campaignCreatorsAndBudget?.totalBudget} FCFA
          </Text>
        </View>
        <View style={[styles.campaignActions]}>
          {item.status === 'active' && (
            <TouchableOpacity
              style={[styles.submitButton, userParticipation.participation.status !== 'active' || !canSubmit ? { opacity: 0.3 } : {}]}
              onPress={() => !canSubmit ? Alert.alert('Limit atteint', 'vous avez atteint la limite du nombre de vidéo pouvant être soumis') : userParticipation.participation.status === 'active' ? submitVideo(item) : Alert.alert('Veillez patienter', 'Votre participation à cette campagne est en cours d\'examen')}
            >
              <Ionicons name="videocam" size={20} color="#FF0050" />
              <Text style={styles.submitButtonText}>Soumettre {submitedVideos && submitedVideos.length > 0 && ("(" + submitedVideos.length + "/" + LimitOfVideo + ")")} </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => viewCampaignStats(item)}
          >
            <Ionicons name="bar-chart" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => viewCampaign(item)}
          >
            <Ionicons name="eye" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render stats card
  const renderStatsCard = (icon, title, value, color) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.loadingText}>Chargement de votre espace créateur...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <View style={styles.actionGrid}>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="person-circle" size={24} color="#FF0050" />
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('BrowseCampaigns')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="search" size={24} color="#FF0050" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('NotificationCenter')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="notifications" size={24} color="#FF0050" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Enhanced Header */}
      <View style={[styles.header, { overflow: "hidden" }]}>
        <View style={{ padding: 20, paddingVertical: 0 }}>
          <Text style={styles.subHeader}>
            Bonjour,
            <Text style={styles.welcomeText}>
              {" " + getCreatorDisplayName().toUpperCase()}
            </Text>
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom : 20 }}>
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {renderStatsCard('wallet', 'Gains totaux', `${stats.totalEarnings} FCFA`, '#25D366')}
            {renderStatsCard('trending-up', 'Campagnes actives', stats.activeCampaigns, '#00F2EA')}
            {renderStatsCard('time', 'En attente', stats.pendingSubmissions, '#FF0050')}
          </View>
        </View>

        {/* My Campaigns */}
        <View style={styles.myCampaignsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes campagnes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {myCampaigns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>
                Vous n'avez pas encore participé à des campagnes
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('BrowseCampaigns')}
              >
                <Text style={styles.browseButtonText}>Parcourir les campagnes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={myCampaigns.sort((c1, c2) => c1.evolution.participatingCreators.find(c => c.creator.email === user.email).participation.status === 'active' && c2.evolution.participatingCreators.find(c => c.creator.email === user.email).participation.status !== 'active' ? -1 : 1)}
              keyExtractor={(item) => item.id}
              renderItem={renderMyCampaign}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.campaignList}
            />
          )}
        </View>

        {/* Recommended Campaigns */}
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campagnes recommandées</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseCampaigns')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {recommendedCampaigns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>
                Aucune campagne recommandée pour le moment
              </Text>
            </View>
          ) : (
            <FlatList
              data={recommendedCampaigns}
              keyExtractor={(item) => item.id}
              renderItem={renderRecommendedCampaign}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.campaignList}
            />
          )}
        </View>
      </View>
      <Modal
        visible={isLoading}
        transparent
        style={{ flex: 1, justifyContent: 'center', alignContent: "center" }}
      >
        <ActivityIndicator size={'large'} />

      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ...SubScreenStyles,
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 0,
    maxHeight : height
  },
  header: {
    marginBottom: 10,
    paddingTop: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  creatorSummary: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF0050',
  },
  logoutText: {
    color: '#FF0050',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#aaa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  statsSection: {
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statsCard: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '32%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsTitle: {
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 15
  },
  actionCard: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtext: {
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
  },
  myCampaignsSection: {
    marginBottom: 25,
  },
  recommendedSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF0050',
    fontSize: 14,
    fontWeight: '600',
  },
  campaignList: {
    paddingRight: 20,
  },
  recommendedCard: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 280,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  myCampaignCard: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 280,
    borderWidth: 1,
    borderColor: '#333',
  },
  campaignImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 20,
  },
  campaignReward: {
    color: '#25D366',
    fontSize: 18,
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
  campaignStatus: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 10,
    borderColor: '#FF0050',
  },
  submitButtonText: {
    color: '#FF0050',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 10
  },
  applyButton: {
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FF0050',
    flexDirection : 'row',
    alignItems : "center"
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginTop: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    lineHeight: 22,
  },
  browseButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF0050',
    borderRadius: 20,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#00F2EA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
  },
});

export default CreatorHome;
