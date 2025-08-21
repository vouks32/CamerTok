// screens/business/BusinessHomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, ImageBackground, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SubScreenStyles } from './subScreen/SubScreenStyles'
import heroImage from '../assets/images/hero-side.png'
import { ScrollView } from 'react-native-gesture-handler';

const BusinessHome = ({ navigation }) => {
  const { user, allUsers, allCampaigns, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    followers: 'all',
    engagement: 'all',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced creator filtering with multiple criteria
  useEffect(() => {
    if (allUsers?.docs) {
      let creators = allUsers.docs.filter(_user => _user.userType === 'creator');

      // Text search filter
      if (searchQuery.trim()) {
        creators = creators.filter(_user =>
          _user.tiktokUser?.user?.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          _user.tiktokUser?.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          _user.tiktokUser?.user?.signature?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Follower count filter
      if (activeFilters.followers !== 'all') {
        const followerCount = _user.tiktokUser?.stats?.followerCount || 0;
        switch (activeFilters.followers) {
          case 'micro':
            creators = creators.filter(_user => followerCount < 10000);
            break;
          case 'small':
            creators = creators.filter(_user => followerCount >= 10000 && followerCount < 50000);
            break;
          case 'medium':
            creators = creators.filter(_user => followerCount >= 50000 && followerCount < 100000);
            break;
          case 'large':
            creators = creators.filter(_user => followerCount >= 100000);
            break;
        }
      }

      // Engagement rate filter
      if (activeFilters.engagement !== 'all') {
        const engagementRate = _user.tiktokUser?.stats?.engagementRate || 0;
        switch (activeFilters.engagement) {
          case 'low':
            creators = creators.filter(_user => engagementRate < 2);
            break;
          case 'medium':
            creators = creators.filter(_user => engagementRate >= 2 && engagementRate < 5);
            break;
          case 'high':
            creators = creators.filter(_user => engagementRate >= 5);
            break;
        }
      }

      setFilteredCreators(creators);
      setLoadingCreators(false);
    }
  }, [searchQuery, allUsers, activeFilters]);

  // Toggle creator selection
  const toggleCreatorSelection = (creator) => {
    setSelectedCreators(prev =>
      prev.some(c => c.id === creator.id)
        ? prev.filter(c => c.id !== creator.id)
        : [...prev, creator]
    );
  };

  // Launch campaign with enhanced scope handling
  const launchCampaign = (scope) => {
    if (scope === 'single' && selectedCreators.length !== 1) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner exactement un créateur pour cette campagne.');
      return;
    }
    if (scope === 'multiple' && selectedCreators.length < 2) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner au moins deux créateurs pour cette campagne.');
      return;
    }

    navigation.navigate('CampaignHub', {
      mode: 'create',
      campaignScope: scope,
      selectedCreators: scope === 'all' ? null : selectedCreators
    });
  };

  // Get company display name
  const getCompanyDisplayName = () => {
    if (user?.companyName) {
      return user.companyName;
    }
    if (user?.email) {
      return user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Entreprise';
  };

  // Get company summary
  const getCompanySummary = () => {
    const activeCampaigns = allCampaigns?.docs?.filter(_c => _c.campaignOwner === user?.email && _c.status === "active").length || 0;
    const pendingCampaigns = allCampaigns?.docs?.filter(_c => _c.campaignOwner === user?.email && _c.status === "review").length || 0;
    const totalCampaigns = allCampaigns?.docs?.filter(_c => _c.campaignOwner === user?.email).length || 0;
    
    if (totalCampaigns === 0) {
      return "Prêt à lancer votre première campagne ? Découvrez nos créateurs talentueux et commencez votre collaboration dès aujourd'hui.";
    }
    
    return `${activeCampaigns} campagne${activeCampaigns > 1 ? 's' : ''} active${activeCampaigns > 1 ? 's' : ''}, ${pendingCampaigns} en attente • Solde: ${user?.bank?.solde || 0} FCFA`;
  };

  // Filter component
  const FilterButton = ({ label, value, options, onFilterChange }) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterOptions}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterOption,
              activeFilters[value] === option.value && styles.filterOptionActive
            ]}
            onPress={() => setActiveFilters(prev => ({ ...prev, [value]: option.value }))}
          >
            <Text style={[
              styles.filterOptionText,
              activeFilters[value] === option.value && styles.filterOptionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View style={[styles.header, { borderBottomLeftRadius: 35, borderBottomRightRadius: 35, overflow: "hidden" }]}>
          <ImageBackground source={heroImage} style={{ padding: 20, paddingVertical: 60 }}>
            <View style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <Text style={styles.subHeader}>
                  Bienvenue,
                </Text>
                <Text style={styles.welcomeText}>
                  {getCompanyDisplayName()}
                </Text>
                <Text style={styles.companySummary}>
                  {getCompanySummary()}
                </Text>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={logout} 
                  style={styles.logoutButton}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FF0050" />
                  <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Enhanced Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="megaphone" size={24} color="#FF0050" />
                </View>
                <Text style={styles.actionText}>Mes Campagnes</Text>
                <Text style={styles.actionSubtext}>
                  {allCampaigns?.docs?.filter(_c => _c.campaignOwner === user?.email && _c.status === "active").length || 0} active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="person-circle" size={24} color="#FF0050" />
                </View>
                <Text style={styles.actionText}>Mon Profil</Text>
                <Text style={styles.actionSubtext}>
                  {user?.bank?.solde || 0} FCFA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('NotificationCenter')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="notifications" size={24} color="#FF0050" />
                </View>
                <Text style={styles.actionText}>Notifications</Text>
                <Text style={styles.actionSubtext}>Voir les alertes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowFilters(!showFilters)}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="filter" size={24} color="#FF0050" />
                </View>
                <Text style={styles.actionText}>Filtres</Text>
                <Text style={styles.actionSubtext}>
                  {Object.values(activeFilters).filter(f => f !== 'all').length} actifs
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campaign Launch Options */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Lancer une campagne</Text>
            <View style={styles.campaignOptions}>
              <TouchableOpacity
                style={[
                  styles.campaignCard,
                  { opacity: selectedCreators.length !== 1 ? 0.5 : 1 }
                ]}
                onPress={() => launchCampaign('single')}
                disabled={selectedCreators.length !== 1}
              >
                <Ionicons name="person" size={28} color="#FF0050" />
                <Text style={styles.campaignText}>Créateur unique</Text>
                <Text style={styles.campaignSubtext}>
                  {selectedCreators.length === 1 ? 'Prêt à lancer' : 'Sélectionnez 1 créateur'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.campaignCard,
                  { opacity: selectedCreators.length < 2 ? 0.5 : 1 }
                ]}
                onPress={() => launchCampaign('multiple')}
                disabled={selectedCreators.length < 2}
              >
                <Ionicons name="people" size={28} color="#FF0050" />
                <Text style={styles.campaignText}>
                  {selectedCreators.length > 0 ? `${selectedCreators.length} sélectionnés` : 'Sélection multiple'}
                </Text>
                <Text style={styles.campaignSubtext}>
                  {selectedCreators.length >= 2 ? 'Prêt à lancer' : 'Sélectionnez 2+ créateurs'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.campaignCard}
                onPress={() => launchCampaign('all')}
              >
                <Ionicons name="globe" size={28} color="#FF0050" />
                <Text style={styles.campaignText}>Tous les créateurs</Text>
                <Text style={styles.campaignSubtext}>
                  {filteredCreators.length} disponibles
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Advanced Search and Filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.sectionTitle}>Trouver des créateurs</Text>
              <Text style={styles.resultCount}>
                {filteredCreators.length} résultat{filteredCreators.length > 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#aaa" />
              <TextInput
                placeholder="Rechercher par nom, pseudo ou bio..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor="#aaa"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#aaa" />
                </TouchableOpacity>
              )}
            </View>

            {/* Advanced Filters */}
            {showFilters && (
              <View style={styles.filtersContainer}>
                <FilterButton
                  label="Nombre d'abonnés"
                  value="followers"
                  options={[
                    { value: 'all', label: 'Tous' },
                    { value: 'micro', label: '< 10k' },
                    { value: 'small', label: '10k-50k' },
                    { value: 'medium', label: '50k-100k' },
                    { value: 'large', label: '> 100k' }
                  ]}
                />
                
                <FilterButton
                  label="Taux d'engagement"
                  value="engagement"
                  options={[
                    { value: 'all', label: 'Tous' },
                    { value: 'low', label: '< 2%' },
                    { value: 'medium', label: '2-5%' },
                    { value: 'high', label: '> 5%' }
                  ]}
                />
              </View>
            )}
          </View>

          {/* Enhanced Creator List */}
          <View style={styles.creatorListContainer}>
            {loadingCreators ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF0050" />
                <Text style={styles.loadingText}>Chargement des créateurs...</Text>
              </View>
            ) : filteredCreators.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>
                  {searchQuery || Object.values(activeFilters).some(f => f !== 'all') 
                    ? 'Aucun créateur ne correspond à vos critères'
                    : 'Aucun créateur disponible pour le moment'
                  }
                </Text>
                {(searchQuery || Object.values(activeFilters).some(f => f !== 'all')) && (
                  <TouchableOpacity 
                    style={styles.clearFiltersButton}
                    onPress={() => {
                      setSearchQuery('');
                      setActiveFilters({ followers: 'all', engagement: 'all', category: 'all' });
                    }}
                  >
                    <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredCreators}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.creatorCard,
                      selectedCreators.some(c => c.id === item.id) && styles.selectedCreator
                    ]}
                    onPress={() => toggleCreatorSelection(item)}
                  >
                    <Image
                      source={{ 
                        uri: item.tiktokUser?.user?.avatarThumb || 'https://via.placeholder.com/60' 
                      }}
                      style={styles.creatorAvatar}
                    />
                    <View style={styles.creatorInfo}>
                      <Text style={styles.creatorName}>
                        {item.tiktokUser?.user?.nickname || 'Créateur inconnu'}
                      </Text>
                      <Text style={styles.creatorUsername}>
                        @{item.tiktokUser?.user?.username || 'non disponible'}
                      </Text>
                      <View style={styles.creatorStats}>
                        <Text style={styles.creatorStatsText}>
                          {item.tiktokUser?.stats?.followerCount
                            ? `${Math.floor(item.tiktokUser.stats.followerCount / 1000)}k abonnés`
                            : 'Abonnés non disponibles'}
                        </Text>
                        {item.tiktokUser?.stats?.engagementRate && (
                          <Text style={styles.engagementText}>
                            • {item.tiktokUser.stats.engagementRate}% engagement
                          </Text>
                        )}
                      </View>
                      {item.tiktokUser?.user?.signature && (
                        <Text style={styles.creatorBio} numberOfLines={2}>
                          {item.tiktokUser.user.signature}
                        </Text>
                      )}
                    </View>

                    <View style={styles.creatorActions}>
                      <Ionicons
                        name={selectedCreators.some(c => c.id === item.id) ? "checkbox" : "square-outline"}
                        size={24}
                        color="#FF0050"
                      />
                      <TouchableOpacity 
                        style={styles.viewProfileButton}
                        onPress={() => {
                          // Navigate to creator profile view
                          Alert.alert('Profil créateur', `Voir le profil de ${item.tiktokUser?.user?.nickname}`);
                        }}
                      >
                        <Ionicons name="eye-outline" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.creatorList}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  companySummary: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    maxWidth: '80%',
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
    marginBottom: 4,
  },
  quickActions: {
    marginBottom: 25,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionCard: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  campaignOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  campaignCard: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '31%',
    borderWidth: 1,
    borderColor: '#333',
  },
  campaignText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  campaignSubtext: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCount: {
    color: '#999',
    fontSize: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  filtersContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  filterOptionActive: {
    backgroundColor: '#FF0050',
    borderColor: '#FF0050',
  },
  filterOptionText: {
    color: '#ccc',
    fontSize: 12,
  },
  filterOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  creatorListContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    lineHeight: 22,
  },
  clearFiltersButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF0050',
    borderRadius: 20,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  creatorList: {
    paddingBottom: 20,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
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
    marginBottom: 2,
  },
  creatorUsername: {
    color: '#FF0050',
    fontSize: 14,
    marginBottom: 4,
  },
  creatorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorStatsText: {
    color: '#aaa',
    fontSize: 12,
  },
  engagementText: {
    color: '#00F2EA',
    fontSize: 12,
    fontWeight: '600',
  },
  creatorBio: {
    color: '#999',
    fontSize: 12,
    lineHeight: 16,
  },
  creatorActions: {
    alignItems: 'center',
  },
  viewProfileButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  sectionTitle: {
    color: '#00F2EA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
  },
});

export default BusinessHome;