// screens/creator/CampaignStatsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';

const CampaignStatsScreen = ({ route, navigation, campaignId }) => {

  const { baseUrl, allCampaigns } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (allCampaigns?.docs) {
      const foundCampaign = allCampaigns.docs.find(c => c.id === campaignId);
      if (foundCampaign) {
        setCampaign(foundCampaign);
        if (foundCampaign.evolution?.participatingCreators?.length > 0) {
          setSelectedCreator(foundCampaign.evolution.participatingCreators[0]);
          if (foundCampaign.evolution.participatingCreators[0].videos?.length > 0) {
            setSelectedVideo(foundCampaign.evolution.participatingCreators[0].videos[0]);
          }
        }
      }
      setLoading(false);
    }
  }, [allCampaigns, campaignId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF0050" />
        <Text style={styles.errorText}>Campagne non trouvée</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate total metrics across all videos
  const calculateTotalMetrics = () => {
    let totalViews = 0;
    let totalLikes = 0;
    let totalShares = 0;
    let totalComments = 0;

    campaign.evolution.participatingCreators.forEach(creator => {
      creator.videos?.forEach(video => {
        if (video.status === 'active') {
          totalViews += video.view_count || 0;
          totalLikes += video.like_count || 0;
          totalShares += video.share_count || 0;
          totalComments += video.comment_count || 0;
        }
      });
    });

    return { totalViews, totalLikes, totalShares, totalComments };
  };

  const { totalViews, totalLikes, totalShares, totalComments } = calculateTotalMetrics();

  // Prepare data for charts
  const prepareChartData = (video) => {
    if (!video || !video.history || video.history.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [0] }]
      };
    }

    // Use the last 7 data points for better visualization
    const recentData = video.history.slice(-7);
    const labels = recentData.map((_, index) => `J${index + 1}`);

    const viewsData = recentData.map(data => data.views);
    const likesData = recentData.map(data => data.likes);
    const sharesData = recentData.map(data => data.shares);
    const commentsData = recentData.map(data => data.comments);

    return {
      labels,
      viewsData,
      likesData,
      sharesData,
      commentsData
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 0, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FF0050',
    },
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const renderMetricSelector = () => (
    <View style={styles.metricSelector}>
      <Text style={styles.selectorLabel}>Métrique:</Text>
      <TouchableOpacity
        style={[styles.metricButton, selectedMetric === 'views' && styles.metricButtonActive]}
        onPress={() => setSelectedMetric('views')}
      >
        <Text style={[styles.metricButtonText, selectedMetric === 'views' && styles.metricButtonTextActive]}>
          Vues
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.metricButton, selectedMetric === 'likes' && styles.metricButtonActive]}
        onPress={() => setSelectedMetric('likes')}
      >
        <Text style={[styles.metricButtonText, selectedMetric === 'likes' && styles.metricButtonTextActive]}>
          Likes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.metricButton, selectedMetric === 'shares' && styles.metricButtonActive]}
        onPress={() => setSelectedMetric('shares')}
      >
        <Text style={[styles.metricButtonText, selectedMetric === 'shares' && styles.metricButtonTextActive]}>
          Partages
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.metricButton, selectedMetric === 'comments' && styles.metricButtonActive]}
        onPress={() => setSelectedMetric('comments')}
      >
        <Text style={[styles.metricButtonText, selectedMetric === 'comments' && styles.metricButtonTextActive]}>
          Commentaires
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreatorSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.creatorSelector}>
      {campaign.evolution.participatingCreators.map(creator => (
        <TouchableOpacity
          key={creator.creator.email}
          style={[
            styles.creatorButton,
            selectedCreator?.creator.email === creator.creator.email && styles.creatorButtonActive
          ]}
          onPress={() => {
            setSelectedCreator(creator);
            if (creator && creator.videos && creator.videos?.length > 0) {
              setSelectedVideo(creator.videos[0]);
            } else {
              setSelectedVideo(null);
            }
          }}
        >
          <Text style={[
            styles.creatorButtonText,
            selectedCreator?.creator.email === creator.creator.email && styles.creatorButtonTextActive
          ]}>
            {creator.creator.username}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVideoSelector = () => {
    if (!selectedCreator || !selectedCreator.videos || selectedCreator.videos.length === 0) {
      return (
        <View style={styles.noVideosContainer}>
          <Ionicons name="videocam-off" size={32} color="#666" />
          <Text style={styles.noVideosText}>Aucune vidéo soumise</Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoSelector}>
        {selectedCreator.videos.map(video => (
          <TouchableOpacity
            key={video.id}
            style={[
              styles.videoButton,
              selectedVideo?.id === video.id && styles.videoButtonActive
            ]}
            onPress={() => setSelectedVideo(video)}
          >
            <Text style={[
              styles.videoButtonText,
              selectedVideo?.id === video.id && styles.videoButtonTextActive
            ]}>
              {video.title?.substring(0, 15)}...
            </Text>
            <View style={[
              styles.videoStatus,
              video.status === 'active' ? styles.statusActive :
                video.status === 'review' ? styles.statusReview : styles.statusRejected
            ]}>
              <Text style={styles.videoStatusText}>
                {video.status === 'active' ? 'Validé' :
                  video.status === 'review' ? 'En revue' : 'Rejeté'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderVideoChart = () => {
    if (!selectedVideo) return null;

    const chartData = prepareChartData(selectedVideo);
    const metricData = {
      'views': chartData.viewsData,
      'likes': chartData.likesData,
      'shares': chartData.sharesData,
      'comments': chartData.commentsData
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Évolution des {selectedMetric}</Text>
        <LineChart
          data={{
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [
              {
                data: [
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100
                ]
              }
            ]
          }}
          width={screenWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix="k"
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderVideoDetails = () => {
    if (!selectedVideo) return null;

    return (
      <View style={styles.videoDetails}>
        <Text style={styles.detailsTitle}>Détails de la vidéo</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vues</Text>
            <Text style={styles.detailValue}>{selectedVideo.view_count?.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Likes</Text>
            <Text style={styles.detailValue}>{selectedVideo.like_count?.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Partages</Text>
            <Text style={styles.detailValue}>{selectedVideo.share_count?.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Commentaires</Text>
            <Text style={styles.detailValue}>{selectedVideo.comment_count?.toLocaleString() || 0}</Text>
          </View>
        </View>

        {selectedVideo.status === 'rejected' && selectedVideo.rejectReason && (
          <View style={styles.rejectionContainer}>
            <Ionicons name="alert-circle" size={20} color="#FF0050" />
            <Text style={styles.rejectionText}>Raison du rejet: {selectedVideo.rejectReason}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTotalMetrics = () => (
    <View style={styles.totalMetrics}>
      <Text style={styles.totalTitle}>Performances globales de la campagne</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="eye" size={24} color="#00F2EA" />
          <Text style={styles.metricValue}>{totalViews.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Vues totales</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="heart" size={24} color="#FF0050" />
          <Text style={styles.metricValue}>{totalLikes.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Likes totaux</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="share-social" size={24} color="#25D366" />
          <Text style={styles.metricValue}>{totalShares.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Partages totaux</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="chatbubbles" size={24} color="#FFD700" />
          <Text style={styles.metricValue}>{totalComments.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Commentaires totaux</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {renderTotalMetrics()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performances par créateur</Text>
          {renderCreatorSelector()}
        </View>

        {selectedCreator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vidéos de {selectedCreator.creator.username}</Text>
            {renderVideoSelector()}
          </View>
        )}

        {selectedVideo && (
          <>
            <View style={styles.section}>
              {renderMetricSelector()}
              {renderVideoChart()}
            </View>

            <View style={styles.section}>
              {renderVideoDetails()}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 15,
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
  totalMetrics: {
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  totalTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  metricLabel: {
    color: '#999',
    fontSize: 12,
  },
  creatorSelector: {
    marginBottom: 10,
  },
  creatorButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#222',
    borderRadius: 20,
    marginRight: 10,
  },
  creatorButtonActive: {
    backgroundColor: '#FF0050',
  },
  creatorButtonText: {
    color: 'white',
  },
  creatorButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  videoSelector: {
    marginBottom: 15,
  },
  videoButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#222',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  videoButtonActive: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#FF0050',
  },
  videoButtonText: {
    color: 'white',
    marginBottom: 5,
  },
  videoButtonTextActive: {
    color: '#FF0050',
    fontWeight: 'bold',
  },
  videoStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#25D366',
  },
  statusReview: {
    backgroundColor: '#FFD700',
  },
  statusRejected: {
    backgroundColor: '#FF0050',
  },
  videoStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noVideosContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noVideosText: {
    color: '#999',
    marginTop: 10,
  },
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  selectorLabel: {
    color: 'white',
    marginRight: 10,
    alignSelf: 'center',
  },
  metricButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#222',
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  metricButtonActive: {
    backgroundColor: '#FF0050',
  },
  metricButtonText: {
    color: 'white',
    fontSize: 12,
  },
  metricButtonTextActive: {
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 10,
  },
  chartTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  videoDetails: {
    marginTop: 10,
  },
  detailsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  detailLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  rejectionText: {
    color: '#FF0050',
    marginLeft: 8,
    flex: 1,
  },
});

export default CampaignStatsScreen;