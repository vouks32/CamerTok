import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import alert from '../assets/images/alert.png'
import CustomPrompt from './CustomPrompt';
import info from '../assets/images/info.png'
import error from '../assets/images/error.png'
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser'
import { parse1000 } from './mathComponents';

const CampaignCard = ({ campaignID, userType, navigation }) => {
  const [campaign, setCampaign] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [selectedValidateVid, setselectedValidateVid] = useState(false)
  const { baseUrl, DeleteCampaign, allCampaigns, UpdateCampaign, isLoadingCampaigns, allUsers, sendNotification } = useAuth();
  const LimitOfVideo = campaign?.campaignCreatorsAndBudget.limitContentPerCreator.state ? campaign?.campaignCreatorsAndBudget.limitContentPerCreator.max + "" : '∞';
  const participants = campaign?.evolution.participatingCreators
  const getCampaignColor = () => {
    switch (campaign?.status) {
      case 'rejected': return '#FF0050';
      case 'review': return '#FFC107';
      case 'draft': return '#fff';
      case 'paused': return '#333';
      default: return '#00F2EA';
    }
  };

  useEffect(() => {
    setCampaign(allCampaigns?.docs.find(c => c.id === campaignID))
    console.log(allCampaigns?.docs.find(c => c.id === campaignID)?.id, campaignID)
  }, [allCampaigns])


  const validateVideo = async (vidId) => {
    setselectedValidateVid(vidId)
    let c = { ...campaign }
    c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).videos.find(vid => vid.id === vidId).status = "active"
    console.log("new status", c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).videos.find(vid => vid.id === vidId).status)
    await UpdateCampaign(c)

    const resp = await sendNotification(allUsers.docs.filter(u => u.email === c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).creator.email).map(u => ({
      notificationToken: u.notificationToken,
      email: u.email,
      phone: u.phone
    })), null, "🎉 Vidéo Validé", 'Une vidéo proposé pour la campagne "' + campaign.campaignInfo.title + '" a été validé, Cliquez sur "En savoir plus"', { path: 'CampaignHub', params: { mode: 'stats', campaignId: campaign.id } })
    console.log('NOTIFICATION ', resp)
  };

  const RejectVideo = async (vidId, reason) => {
    setselectedValidateVid(vidId)
    let c = { ...campaign }
    c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).videos.find(vid => vid.id === vidId).status = "rejected"
    c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).videos.find(vid => vid.id === vidId).rejectReason = reason
    console.log("new status", c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).videos.find(vid => vid.id === vidId).status)
    await UpdateCampaign(c)

    const resp = await sendNotification(allUsers.docs.filter(u => u.email === c.evolution.participatingCreators.find(p => p.videos.some(vid => vid.id === vidId)).creator.email).map(u => ({
      notificationToken: u.notificationToken,
      email: u.email,
      phone: u.phone
    })), null, "❌ Vidéo rejetée", 'Une vidéo proposé pour la campagne "' + campaign.campaignInfo.title + '" a été rejetée, Cliquez sur "En savoir plus"',
      {
        alert: true,
        params: {
          title: '❌ Vidéo rejetée',
          body: 'Une vidéo proposé pour la campagne "' + campaign.campaignInfo.title + '" a été rejetée pour la raison suivante:',
          list: [reason]
        }
      })
    console.log('NOTIFICATION ', resp)
  }

  const manageParticipation = async (email, validated) => {
    let c = { ...campaign }
    c.evolution.participatingCreators.find(p => p.creator.email === email).participation.status = validated ? "active" : "rejected"
    c.evolution.participatingCreators.find(p => p.creator.email === email).participation.postulationAcceptanceDate = validated ? Date.now() : null
    await UpdateCampaign(c)
    if (validated) {
      const resp = await sendNotification(allUsers.docs.filter(u => u.email === c.evolution.participatingCreators.find(p => p.creator.email === email).creator.email).map(u => ({
        notificationToken: u.notificationToken,
        email: u.email,
        phone: u.phone
      })), null, "🎉 Participation Validé", 'Ta participation à la campagne "' + campaign.campaignInfo.title + '" a été validé, Cliquez sur "En savoir plus"', { path: 'CampaignHub', params: { mode: 'view', campaignId: campaign.id } })
      console.log('NOTIFICATION ', resp)
    } else {
      const resp = await sendNotification(allUsers.docs.filter(u => u.email === c.evolution.participatingCreators.find(p => p.creator.email === email).creator.email).map(u => ({
        notificationToken: u.notificationToken,
        email: u.email,
        phone: u.phone
      })), null, "❌ Vidéo rejetée", 'Une vidéo proposé pour la campagne "' + campaign.campaignInfo.title + '" a été rejetée, Cliquez sur "En savoir plus"',
        {
          alert: true,
          params: {
            title: '❌ Vidéo rejetée',
            body: 'Une vidéo proposé pour la campagne "' + campaign.campaignInfo.title + '" a été rejetée',
          }
        })
      console.log('NOTIFICATION ', resp)
    }
  };

  return (
    <View>
      <View style={[styles.card, { borderLeftColor: getCampaignColor() }]}>
        <View style={{ flexDirection: "row" }}>
          <Image source={{ uri: baseUrl + "/api/campaigndocs/" + campaign?.id + "/" + campaign?.campaignInfo.image }} style={{ width: "25%", aspectRatio: 1, marginRight: 15, borderRadius: 10 }} />
          <View style={{ width: "70%" }}>
            <Text style={styles.title}>{(campaign?.campaignInfo.title.length < 35) ? campaign?.campaignInfo.title : campaign?.campaignInfo.title.slice(0, 35) + '...'}</Text>
            {userType === 'creator' && campaign?.status == "active" ? (
              <Text style={styles.reward}>Reward: {campaign?.reward} FCFA</Text>
            ) : campaign?.status == "active" ? (<>
              <Text style={styles.views}>Participants: {participants.filter(p => p.participation.status === "active").length}/{participants.length}</Text>
              <Text style={styles.views}>Vidéos: {participants.reduce((sum, a) => a.participation.status == "active" ? sum.concat(a.videos) : sum, []).length}</Text>
            </>
            ) : <></>}
            <Text style={styles.status}>
              Status: <Text style={styles.statusHighlight}>{campaign?.status}</Text>
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "", paddingTop: 10 }}>
          <TouchableOpacity
            title=""
            onPress={() => navigation.navigate('CampaignHub', {
              campaignId: campaign?.id,
              mode: 'view'
            })}
            style={[styles.Button]}
          >
            <Ionicons name='eye' color={"#fff"} size={14} />
            <Text
              style={styles.ButtonText}
            > {' Voir'} </Text>
          </TouchableOpacity>
          <TouchableOpacity
            title=""
            onPress={() => navigation.navigate('CampaignHub', { mode: 'create' })}
            style={[styles.Button, { opacity: (campaign?.status != "active" && campaign?.status != "paused") ? 0.5 : 1 }]}
            disabled={campaign?.status != "active" && campaign?.status != "paused"}
          >
            <Ionicons name='bar-chart' color={"#fff"} size={14} />
            <Text
              style={styles.ButtonText}
            > {"Stats"} </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => {
          Alert.alert('Supprimer cette campagne?', "Vous êtes sur le point de supprimer la campagne '" + ((campaign?.campaignInfo.title.length < 20) ? campaign?.campaignInfo.title : campaign?.campaignInfo.title.slice(0, 20) + '...') + "'! Cette action est irréversible", [
            { text: "Annuler", style: "cancel", onPress: () => { } },
            { text: "Supprimer", style: "destructive", isPreferred: true, onPress: () => { DeleteCampaign(campaign?.id) } }
          ])
        }} style={[styles.Button, { position: "absolute", right: -5, top: 0 }]}><Ionicons name='trash' color={"#fff"} /></TouchableOpacity>
      </View>

      <View style={styles.participantsContainer}>
        {participants?.map((p, index) => {
          const userProfil = allUsers.docs.find(u => u.email === p.creator.email)
          return (
            <View key={index}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                <Image source={{ uri: baseUrl + "/api/campaigndocs/" + campaign?.id + "/" + campaign?.campaignInfo.image }} style={{ width: "20%", aspectRatio: 1, marginRight: 15, borderRadius: 100 }} />
                <View>
                  <Text style={styles.title}>{p.creator.username}</Text>
                  <Text style={styles.subTitle}>Abonnées: {parse1000(userProfil?.tiktokUser?.stats?.followerCount)}</Text>
                  <Text style={styles.subTitle}>Likes: {parse1000(userProfil?.tiktokUser?.stats?.heartCount)}</Text>
                </View>

              </View>

              {p.participation.status == "review" &&
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <TouchableOpacity style={styles.Button} onPress={() => {
                    Alert.alert(`Valider la participation de ${p.creator.username}?`, `${p.creator.username} sera désormais capable de créer du contenu pour la campagne "` + ((campaign?.campaignInfo.title.length < 20) ? campaign?.campaignInfo.title : campaign?.campaignInfo.title.slice(0, 20) + '...') + "'!\n\nCette action est irréversible", [
                      { text: "Annuler", style: "cancel", onPress: () => { } },
                      { text: "Valider", style: "destructive", isPreferred: true, onPress: () => { manageParticipation(p.creator.email, true) } }
                    ])
                  }}>
                    <Ionicons name='checkmark-circle' color={'white'} size={20} />
                    <Text style={styles.ButtonText}>  Valider la participation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.Button} onPress={() => {
                    Alert.alert(`Rejeter la participation de ${p.creator.username}?`, `${p.creator.username} ne sera plus jamais capable de créer du contenu pour la campagne "` + ((campaign?.campaignInfo.title.length < 20) ? campaign?.campaignInfo.title : campaign?.campaignInfo.title.slice(0, 20) + '...') + "'!\n\nCette action est irréversible", [
                      { text: "Annuler", style: "cancel", onPress: () => { } },
                      { text: "Rejeter", style: "destructive", isPreferred: true, onPress: () => { manageParticipation(p.creator.email, false) } }
                    ])
                  }}>
                    <Ionicons name='close-circle' color={'white'} size={20} />
                    <Text style={styles.ButtonText}>  Rejeter la participation</Text>
                  </TouchableOpacity>
                </View>}

              {p.participation.status == "active" && (
                <View style={styles.participantsVideosContainer}>
                  {(!p.videos || p.videos.length == 0) && (
                    <View><Text style={{ textAlign: "center", color: "#fff" }}> -- Aucune Vidéo -- </Text></View>
                  )}
                  {p.videos?.map((vid, vidIndex) => (
                    <View key={vidIndex} style={{ marginBottom: 10, flexDirection: 'row', width: "80%" }}>
                      <Image source={{ uri: vid.cover_image_url }} style={{ width: "30%", aspectRatio: 4 / 5, borderRadius: 10 }} />
                      <View style={{ marginHorizontal: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "" }}>
                          <View style={{ flexDirection: "row", alignItems: 'center', marginHorizontal: 5 }}><Ionicons name='eye' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 13, justifyContent: "center" }}> {vid.view_count > 999 ? (vid.view_count / 1000).toFixed(1) + "k" : vid.view_count}</Text></View>
                          <View style={{ flexDirection: "row", alignItems: 'center', marginHorizontal: 5 }}><Ionicons name='heart' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 13, justifyContent: "center" }}> {vid.like_count > 999 ? (vid.like_count / 1000).toFixed(1) + "k" : vid.like_count}</Text></View>
                          <View style={{ flexDirection: "row", alignItems: 'center', marginHorizontal: 5 }}><Ionicons name='arrow-redo' size={14} color={"white"} /><Text style={{ color: "white", fontSize: 13, justifyContent: "center" }}> {vid.share_count > 999 ? (vid.share_count / 1000).toFixed(1) + "k" : vid.share_count}</Text></View>
                        </View>
                        <Text style={{ color: "#bbbbbb", fontSize: 11 }}>{vid.video_description}</Text>

                        {vid.status !== "rejected" ? <View style={{ flexDirection: "row", marginTop: 5 }}>
                          <TouchableOpacity
                            style={[styles.Button, { paddingVertical: 5 }]}
                            onPress={async () => { await WebBrowser.openBrowserAsync(vid.embed_link) }}
                          >
                            <Ionicons name='eye' color={'white'} />
                            <Text style={styles.ButtonText}>  Voir</Text></TouchableOpacity>

                          {vid.status == "review" && <TouchableOpacity
                            style={[styles.Button, { paddingVertical: 5 }]}
                            onPress={async () => { await validateVideo(vid.id) }}
                          >
                            {isLoadingCampaigns && selectedValidateVid === vid.id ? <ActivityIndicator size={'small'} /> :
                              <>
                                <Ionicons name='checkmark-circle' color={'white'} />
                                <Text style={styles.ButtonText}>  Valider</Text>
                              </>
                            }
                          </TouchableOpacity>}

                          {vid.status == "review" && <TouchableOpacity
                            style={[styles.Button, { paddingVertical: 5 }]}
                            onPress={() => { setselectedValidateVid(vid.id); setShowPrompt(true) }}
                          >
                            {isLoadingCampaigns && selectedValidateVid === vid.id ? <ActivityIndicator size={'small'} /> :
                              <>
                                <Ionicons name='close-circle' color={'white'} />
                                <Text style={styles.ButtonText}>  Rejeter</Text>
                              </>
                            }
                          </TouchableOpacity>}
                        </View>
                          :
                          <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <TouchableOpacity
                              style={[styles.Button, { paddingVertical: 5, backgroundColor: "#888888" }]}
                              onPress={async () => { Alert.alert('Vidéo rejétée', 'Vous avez rejété cette vidéo') }}
                            >
                              <Ionicons name='close-circle' color={'white'} />
                              <Text style={styles.ButtonText}>  Rejétée</Text></TouchableOpacity>
                          </View>
                        }
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </View>
          )
        })}
      </View>

      <CustomPrompt
        visible={showPrompt}
        title={'Raison du rejet'}
        message={'Veillez donner la raison pour laquelle cette vidéo n\'est pas éligible'}
        onSubmit={(text) => { RejectVideo(selectedValidateVid, text), setShowPrompt(false) }}
        onCancel={() => setShowPrompt(false)} />

    </View>
  );
};

const HelpBox = ({ Message, style }) => {

  const getColor = () => {
    switch (Message.type) {
      case 'error': return '#FF0050';
      case 'alert': return '#FFC107';
      case 'info': return '#ddd';
      default: return '#00F2EA';
    }
  };

  const getIcon = () => {
    switch (Message.type) {
      case 'error': return error;
      case 'alert': return alert;
      case 'info': return info;
      default: return info;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getColor(), padding: 10, flexDirection: "row", alignItems: "center" }]}>
      <Image source={getIcon()} style={{ width: 35, height: 35, aspectRatio: 1, marginRight: 10 }} />
      <View style={[{ width: "80%" }]}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: getColor() }}>{Message.type}</Text>
        <Text style={{ fontSize: 10, color: "#aaa", marginRight: 0 }}>{Message.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 10,
    borderBottomRightRadius: 0,
    padding: 15,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0050',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subTitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5
  },
  type: {
    color: '#00F2EA',
    marginBottom: 5
  },
  reward: {
    color: '#25D366',
    fontWeight: '600'
  },
  views: {
    color: '#FFC107',
    fontWeight: '600'
  },
  status: {
    color: '#aaa',
    marginTop: 8
  },
  statusHighlight: {
    color: '#FFC107',
    fontWeight: 'bold'
  },
  Button: {
    backgroundColor: '#FF0050',
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5
  },
  ButtonText: {
    color: '#fff',
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold",
    alignItems: "center"
  },

  participantsContainer: {
    backgroundColor: '#222',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 15,
    marginLeft: 10,
    marginTop: 1,
  },
  participantsVideosContainer: {
    borderTopWidth: 1,
    borderColor: "#777777",
    marginVertical: 5,
    paddingTop: 10
  }
});

export default CampaignCard;
export { HelpBox }