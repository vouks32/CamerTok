import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import VideoSubmit from '../../components/VideoSubmit';
import jsxRuntime from 'react/jsx-runtime';
import { HelpBox } from '../../components/CampaignCard';
import CheckBox from '../../components/CheckBox';
import { useAuth } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '../../components/DateTimePicker';
import * as Progress from 'react-native-progress';

const NUM_CAMPAIGN_CREATION_STEPS = 3;

const ViewCampaign = ({ navigation, campaignId }) => {
    const { allCampaigns, baseUrl } = useAuth();


    const [campaignData, setCampaignData] = useState(allCampaigns.docs.filter(_c => _c.id == campaignId)[0]);
    const [campaignError, setCampaignError] = useState(null);

    //console.log(allCampaigns.docs.filter(_c => _c.id == campaignId)[0])




    const renderContent = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", padding: 10 }}>
                    <Image source={{ uri: baseUrl + "/api/campaigndocs/" + campaignData.id + "/" + campaignData.campaignInfo.image }} style={{ width: "25%", aspectRatio: 1, marginRight: 15, borderRadius: 10 }} />
                    <View style={{ width: "70%" }}>
                        <Text style={styles.title}>{campaignData.campaignInfo.title}</Text>
                        {campaignData.status == "active" ? (
                            <Text style={styles.reward}>Reward: {campaignData.reward} FCFA</Text>
                        ) : campaignData.status == "active" ? (
                            <Text style={styles.views}>Participants: {campaignData.evolution.participantsVideos.length}</Text>
                        ) : <></>}
                        <Text style={styles.reward}>
                            Status: <Text style={styles.statusHighlight}>{campaignData.status}</Text>
                        </Text>
                    </View>
                </View>

                <ScrollView>
                    <View style={{ padding: 10 }}>
                        <Text style={styles.sectionTitle}>Description:</Text>
                        <Text style={styles.description}>{campaignData.campaignInfo.description}</Text>
                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={styles.sectionTitle}>Period:</Text>
                        <View style={{ flexDirection: 'row', justifyContent: "space-around", alignItems: 'center' }}>
                            <View style={[styles.Button, { paddingHorizontal: 30, margin: 0, backgroundColor: "#777" }]}>
                                <Text style={{ color: "#fff" }}>{(new Date(campaignData.campaignInfo.startDate)).toLocaleDateString('fr-FR', { day: "2-digit", month: "short", year: "numeric" })}</Text>
                            </View>
                            <Text style={{ color: "#fff" }}> - </Text>
                            <View style={[styles.Button, { paddingHorizontal: 30, margin: 0, backgroundColor: "#777" }]}>
                                <Text style={{ color: "#fff" }}>{(new Date(campaignData.campaignInfo.endDate)).toLocaleDateString('fr-FR', { day: "2-digit", month: "short", year: "numeric" })}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={styles.sectionTitle}>Budget:</Text>
                        <Text style={[styles.title, { marginBottom: 0 }]}>{campaignData.campaignCreatorsAndBudget.totalBudget} CFA</Text>
                        <Text style={[styles.analytics, { paddingHorizontal: 0 }]}>Limit Budget Per Creator : <Text style={{ fontWeight: "bold", color: "#fff" }}> {campaignData.campaignCreatorsAndBudget.limitBudgetPerCreator.state ? campaignData.campaignCreatorsAndBudget.limitBudgetPerCreator.max + " CFA" : "No limit"}</Text></Text>
                    </View>

                    <View style={{ padding: 10 }}>
                        <Text style={styles.sectionTitle}>Creators:</Text>
                        <Text style={[styles.analytics, { paddingHorizontal: 0 }]}>Limit Contents Per Creators: <Text style={{ fontWeight: "bold", color: "#fff" }}> {
                            campaignData.campaignCreatorsAndBudget.limitContentPerCreator.state ?
                                campaignData.campaignCreatorsAndBudget.limitContentPerCreator.min + " to " + campaignData.campaignCreatorsAndBudget.limitContentPerCreator.max :
                                "No limit"}
                        </Text></Text>
                        <Text style={[styles.analytics, { paddingHorizontal: 0 }]}>Limit Creators Participating: <Text style={{ fontWeight: "bold", color: "#fff" }}> {campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.state ? "" : "No limit"}</Text></Text>
                        {
                            campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.state && <FlatList
                                data={campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.creators}
                                keyExtractor={item => item.id}
                                horizontal
                                renderItem={({ item }) => {
                                    const selectedCCIndex = -1;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => { }}
                                            style={{ flexDirection: "row", alignItems: "center", margin: 5, padding: 10, borderRadius: 10, backgroundColor: selectedCCIndex !== -1 ? "#00F2EA" : "#EEE" }}>
                                            <Image src={item.tiktokUser.user.avatarThumb} style={{ width: 35, aspectRatio: 1, borderRadius: 50, marginHorizontal: 10 }} />
                                            <View>
                                                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.tiktokUser.user.nickname}</Text>
                                                <Text style={{ fontSize: 11 }}> {item.tiktokUser.user.username}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}

                            />
                        }
                    </View>



                    <View style={{ padding: 10 }}>
                        <Text style={styles.sectionTitle}>Campaign Type:</Text>
                        {campaignData.campaignType.captionCampaign.state && <View style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#333", color: "#fff" }}>
                            <Text style={[styles.title, { marginBottom: 0 }]}>Caption Campaign</Text>
                            <Text style={{ color: "#ccc", marginTop: 10 }}>
                                Caption:
                            </Text>
                            <Text style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#777", color: "#fff" }}>{campaignData.campaignType.captionCampaign.caption} </Text>
                        </View>
                        }

                        {campaignData.campaignType.textInContentCampaign.state && <View style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#333", color: "#fff" }}>
                            <Text style={[styles.title, { marginBottom: 5 }]}>Text in Content Campaign</Text>
                            <Text style={{ color: "#ccc", marginTop: 10 }}>
                                Text:
                            </Text>
                            <Text style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#777", color: "#fff" }}>{campaignData.campaignType.textInContentCampaign.text} </Text>
                        </View>
                        }

                        {campaignData.campaignType.VideoInContentCampaign.state &&
                            <View style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#333", color: "#fff" }}>
                                <Text style={[styles.title, { marginBottom: 5 }]}>Video in Content</Text>
                                <Text style={{ color: "#ccc" }}>
                                    • Video To Put in Content  <Text style={{ color: "#fff", fontWeight: 'bold' }}>({(campaignData.campaignType.VideoInContentCampaign.video.size / (1000 * 1000)).toFixed(2)}Mb)</Text>
                                </Text>
                                <Text style={{ color: "#ccc" }}>
                                    • Video Position  <Text style={{ color: "#fff", fontWeight: 'bold' }}>({campaignData.campaignType.VideoInContentCampaign.videoPosition.replaceAll('-', ' ')})</Text>
                                </Text>
                                <Text style={{ color: "#ccc" }}>
                                    • Should Creator Speak Over Video  <Text style={{ color: "#fff", fontWeight: 'bold' }}>({campaignData.campaignType.VideoInContentCampaign.shouldSpeakOver ? "yes" : "no"})</Text>
                                </Text>
                                 <Text style={{ color: "#ccc", marginTop: 10 }}>
                                    Speak Over Script:
                                </Text>
                                {campaignData.campaignType.VideoInContentCampaign.shouldSpeakOver &&
                                    <Text style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#777", color: "#fff" }}>{campaignData.campaignType.VideoInContentCampaign.speakOverScript} </Text>}
                            </View>
                        }

                        {campaignData.campaignType.fullPresentationCampaign.state &&
                            <View style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#333", color: "#fff" }}>
                                <Text style={[styles.title, { marginBottom: 5 }]}>Full Presentation Campaign</Text>
                                <Text style={{ color: "#ccc" }}>
                                    Ressources:
                                </Text>
                                {campaignData.campaignType.fullPresentationCampaign.documents.map((doc, i) => {
                                    const l = doc.name.split('.').length - 1
                                    const docType = doc.mimeType?.split('/')[0]
                                    return (
                                        <Text key={i} style={{ color: "#fff", fontWeight: 'bold' }}> • {docType} document ({((doc.size || 0) / 1000000).toFixed(2)} Mb)</Text>
                                    )
                                })}
                                <Text style={{ color: "#ccc", marginTop: 10 }}>
                                    Instructions:
                                </Text>
                                <Text style={{ padding: 10, margin: 10, borderRadius: 10, backgroundColor: "#777", color: "#fff" }}>{campaignData.campaignType.fullPresentationCampaign.description} </Text>
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={styles.container}>
            {renderContent()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        paddingTop: 0,
        backgroundColor: '#121212'
    },
    sectionTitle: {
        color: '#00F2EA',
        fontSize: 14,
        marginTop: 0,
        fontWeight: 'bold',
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
        padding: 10,
        borderRadius: 10,

    },
    ButtonText: {
        color: '#fff',
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold"
    }
});

export default ViewCampaign;