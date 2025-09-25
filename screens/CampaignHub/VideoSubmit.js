import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


const VideoSubmit = ({ campaignId, navigation }) => {
  const { fetchTiktokVideos, user, isLoadingVideos, allCampaigns, UpdateCampaign } = useAuth();

  const [videoUrl, setVideoUrl] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [selectedTiktokVideos, setSelectedTiktokVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  
    const FetchVideos = async () => {
      let videos = (await fetchTiktokVideos()) || []
      //console.log(videos)
      setTiktokVideos(videos)
    }
    FetchVideos()
  }, [])

  useEffect(() => {
    if (campaignId && allCampaigns && allCampaigns.docs) {
      const c = allCampaigns.docs.find(_c => _c.id === campaignId);
      setCampaign(c)
      setSelectedTiktokVideos(c.evolution.participatingCreators.find(pc => pc.creator.email === user.email).videos || [])
    }
  }, [campaignId, allCampaigns]);


  const handleSubmit = async () => {
    if (selectedTiktokVideos.length < 0) {
      Alert.alert('Selection invalide', 'Vous devez selectionner qu moins 1 vidéo');
      return;
    }
    Alert.alert(
      'Vous êtes sur le point de soumettre (' + selectedTiktokVideos.length + ') vidéo(s)!',
      'Êtes-vous sur de vouloir soumettre ces vidéos?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            setIsSubmitting(true);
            // API call to submit video
            const Campaign = { ...campaign }
            Campaign.evolution.participatingCreators.find(pc => pc.creator.email === user.email).videos = selectedTiktokVideos
            await UpdateCampaign(Campaign)
            Alert.alert(
              'Submitted!',
              'Your video has been submitted for review. You will be notified when approved.',
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    navigation.navigate('Home');
                  }
                }
              ]
            );
            setIsSubmitting(false);
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
      >
        {isLoadingVideos || isSubmitting ? (
          <View style={{ flex: 1, height: "100%", justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size={"large"} />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Selectionner la/les vidéo à soumettre</Text>
            <View style={styles.videosContainer}>
              {tiktokVideos.map((video, index) => {
                const vidObj = {
                  ...video, 
                  status: "review", 
                  history: [{
                    views: video.view_count,
                    likes: video.like_count,
                    shares: video.share_count,
                    comments: video.comment_count,
                    date: Date.now()
                  }]
                }
                const selected = selectedTiktokVideos?.some(sv => sv.id === video.id)
                const status = selectedTiktokVideos?.find(sv => sv.id === video.id)?.status
                const rejectedReason = selectedTiktokVideos?.find(sv => sv.id === video.id)?.rejectReason
                const postedSince = (Date.now() - (new Date(parseInt(video.create_time) * 1000).valueOf())) / (1000 * 60 * 60 * 24)
                const tooOld = new Date(parseInt(video.create_time) * 1000).valueOf() < Date.now() - 60000 * 60 * 24 * 30
                return (
                  <TouchableOpacity onPress={() => {
                    setSelectedTiktokVideos((oldList) => {
                      if (status === 'active') {
                        Alert.alert('Action impossible', 'Cette vidéo a déjà été validé et ne peut être retiré de la campagne')
                        return oldList
                      } if (status === 'rejected') {
                        Alert.alert('Vidéo rejeté', 'Cette vidéo a été rejété car "' + rejectedReason + '"\n\nVeillez consulter les characteristiques exigé d\'une vidéo pour cette campagne',
                          [{
                            text: 'Consulter',
                            onPress: () => {
                              navigation.navigate('CampaignHub', {
                                mode: 'view',
                                campaignId: campaignId
                              });
                            }
                          }, {
                            text: 'Fermer',
                            style: 'cancel'
                          }], { onDismiss: () => { } })
                        return oldList
                      } else if (tooOld && !oldList?.some(olv => olv.id === video.id)) {
                        Alert.alert('Action impossible', 'Cette vidéo a été posté il y a plus de 14 jours')
                        return oldList
                      }
                      if (oldList?.some(olv => olv.id === video.id)) {
                        return oldList.filter(olv => olv.id !== video.id)
                      } else {
                        const wasSubmittedVideo = campaign.evolution.participatingCreators.find(pc => pc.creator.email === user.email).videos?.find(v => v.status === "active")
                        return oldList.concat(wasSubmittedVideo || vidObj)
                      }
                    })
                  }} key={index}
                    style={[styles.videoContainer, { borderWidth: selected ? 2 : 0, opacity: tooOld || status === 'active' ? 0.4 : 1 }]}
                  >
                    <Image source={{ uri: video.cover_image_url }} style={{ width: "100%", aspectRatio: 4 / 5, borderRadius: 10 }} />
                    {status && <View style={{ position: "absolute", top: 5, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                      <View style={{ backgroundColor: '#ff2222', padding: 10, borderRadius: 10 }}><Text style={{ color: "white", fontSize: 11, justifyContent: "center" }}> {status === 'review' ? "en cours de validation" : status === 'active' ? 'actif' : "rejected"}</Text></View>
                    </View>}


                    <LinearGradient
                      colors={['#ffffff00', '#000000de']}
                      style={{
                        position: "absolute", bottom: -1, left: -1, right: -1, height: 200, borderBottomLeftRadius: 10, borderBottomRightRadius: 10
                      }}
                    />


                    <View style={{ position: "absolute", bottom: 5, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                      <View style={{ flexDirection: "row", alignItems: 'center' }}><Ionicons name='eye' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 11, justifyContent: "center" }}> {video.view_count > 999 ? (video.view_count / 1000).toFixed(1) + "k" : video.view_count}</Text></View>
                      <View style={{ flexDirection: "row", alignItems: 'center' }}><Ionicons name='heart' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 11, justifyContent: "center" }}> {video.like_count > 999 ? (video.like_count / 1000).toFixed(1) + "k" : video.like_count}</Text></View>
                      <View style={{ flexDirection: "row", alignItems: 'center' }}><Ionicons name='arrow-redo' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 11, justifyContent: "center" }}> {video.share_count > 999 ? (video.share_count / 1000).toFixed(1) + "k" : video.share_count}</Text></View>
                    </View>
                    <View style={{ position: "absolute", bottom: 25, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                      <View style={{ flexDirection: "row", alignItems: 'center' }}><Ionicons name='calendar' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 11, justifyContent: "center" }}> il y a {Math.floor(postedSince)} J</Text></View>
                    </View>

                    {status === "rejected" && <LinearGradient
                      colors={['rgba(255, 0, 0, 0.2)', 'rgba(222, 0, 0, 0.2)']}
                      style={{
                        position: "absolute", bottom: -1, left: -1, right: -1, height: "100%", borderBottomLeftRadius: 10, borderBottomRightRadius: 10
                      }}
                    />}
                  </TouchableOpacity>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>
      {
        (selectedTiktokVideos?.length > 0 || campaign?.evolution.participatingCreators.find(pc => pc.creator.email === user.email).videos?.length > 0) && <View style={{ position: 'absolute', bottom: 50, flexDirection: "row", justifyContent: "center", width: "100%" }}>
          <TouchableOpacity onPress={() => handleSubmit()} style={{ paddingHorizontal: 25, paddingVertical: 10, borderRadius: 10, backgroundColor: "#ff2222" }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Soumettre {selectedTiktokVideos?.length}</Text>
          </TouchableOpacity>
        </View>
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    paddingTop: 0,
    backgroundColor: '#121212'
  },
  videosContainer: {
    flexDirection: 'row',
    flexWrap: "wrap"
  },
  sectionTitle: {
    color: '#00F2EA',
    fontSize: 18,
    marginVertical: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  videoContainer: {
    width: "46%",
    marginHorizontal: 5,
    marginBottom: 10,
    borderColor: "#ff2222",
    borderRadius: 10
  }
});

export default VideoSubmit;