import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import alert from '../assets/images/alert.png'
import info from '../assets/images/info.png'
import error from '../assets/images/error.png'
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const CampaignCard = ({ campaign, userType, navigation }) => {
  const { baseUrl, DeleteCampaign } = useAuth();

  const getCampaignColor = () => {
    switch (campaign.status) {
      case 'rejected': return '#FF0050';
      case 'review': return '#FFC107';
      case 'draft': return '#fff';
      case 'paused': return '#333';
      default: return '#00F2EA';
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getCampaignColor() }]}>
      <View style={{ flexDirection: "row" }}>
        <Image source={{ uri: baseUrl + "/api/campaigndocs/" + campaign.id + "/" + campaign.campaignInfo.image }} style={{ width: "25%", aspectRatio: 1, marginRight: 15, borderRadius: 10 }} />
        <View style={{ width: "70%" }}>
          <Text style={styles.title}>{(campaign.campaignInfo.title.length < 35) ? campaign.campaignInfo.title : campaign.campaignInfo.title.slice(0, 35) + '...'}</Text>
          {userType === 'creator' && campaign.status == "active" ? (
            <Text style={styles.reward}>Reward: {campaign.reward} FCFA</Text>
          ) : campaign.status == "active" ? (
            <Text style={styles.views}>Participants: {campaign.evolution.participantsVideos.length}</Text>
          ) : <></>}
          <Text style={styles.status}>
            Status: <Text style={styles.statusHighlight}>{campaign.status}</Text>
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 10 }}>
        <TouchableOpacity
          title=""
          onPress={() => navigation.navigate('CampaignHub', {
            campaignId: campaign.id,
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
          onPress={() => navigation.navigate('CampaignHub', { mode: 'edit', campaignId: campaign.id })}
          style={[styles.Button]}
          disabled={campaign.status != "active" && campaign.status != "paused" && campaign.status != "review"}
        >
          <Ionicons name='pencil' color={"#fff"} size={14} />
          <Text
            style={styles.ButtonText}
          > {' Modifier'} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          title=""
          onPress={() => navigation.navigate('CampaignHub', { mode: 'create' })}
          style={[styles.Button, { opacity: (campaign.status != "active" && campaign.status != "paused") ? 0.5 : 1 }]}
          disabled={campaign.status != "active" && campaign.status != "paused"}
        >
          <Ionicons name='bar-chart' color={"#fff"} size={14} />
          <Text
            style={styles.ButtonText}
          > {"Stats"} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          title=""
          onPress={() => navigation.navigate('CampaignHub', { mode: 'create' })}
          style={[styles.Button, { opacity: (campaign.status != "active" && campaign.status != "paused") ? 0.5 : 1 }]}
          disabled={campaign.status != "active" && campaign.status != "paused"}
        >
          <Text
            style={styles.ButtonText}
          > {campaign.status == "active" ? "désactiver" : "activer"} </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => {
        Alert.alert('Supprimer cette campagne?', "Vous êtes sur le point de supprimer la campagne '" + ((campaign.campaignInfo.title.length < 20) ? campaign.campaignInfo.title : campaign.campaignInfo.title.slice(0, 20) + '...') + "'! Cette action est irréversible", [
          { text: "Annuler", style: "cancel", onPress: () => { } },
          { text: "Supprimer", style: "destructive", isPreferred: true, onPress: () => { DeleteCampaign(campaign.id) } }
        ])
      }} style={[styles.Button, { position: "absolute", right: 0, top: 0 }]}><Ionicons name='trash' color={"#fff"} /></TouchableOpacity>
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
    <View style={[styles.card, { borderLeftColor: getColor(), padding: 10, flexDirection: "row", marginLeft: 20, alignItems: "center" }, style]}>
      <Image source={getIcon()} style={{ width: 35, aspectRatio: 1, marginRight: 10 }} />
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
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0050',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    alignItems: "center"
  },
  ButtonText: {
    color: '#fff',
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold"
  },
});

export default CampaignCard;
export { HelpBox }