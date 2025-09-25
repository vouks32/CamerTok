import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, FlatList, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import VideoSubmit from './VideoSubmit';
import jsxRuntime from 'react/jsx-runtime';
import { HelpBox } from '../../components/CampaignCard';
import CheckBox from '../../components/CheckBox';
import { useAuth } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '../../components/DateTimePicker';
import * as Progress from 'react-native-progress';

const NUM_CAMPAIGN_CREATION_STEPS = 3;
const { width } = Dimensions.get('window');

const ViewCampaign = ({ navigation, campaignId }) => {
    const { allCampaigns, baseUrl, user } = useAuth();
    const [campaignData, setCampaignData] = useState(allCampaigns.docs.filter(_c => _c.id == campaignId)[0]);
    const [campaignError, setCampaignError] = useState(null);

    const LimitOfVideo = campaignData.campaignCreatorsAndBudget.limitContentPerCreator.state ? campaignData.campaignCreatorsAndBudget.limitContentPerCreator.max + "" : '∞';
    const userParticipation = campaignData.evolution?.participatingCreators?.find(c => c.creator.email === user.email)
    const submitedVideos = userParticipation?.videos || []
    const canSubmit = submitedVideos.filter(sv => sv.status == "active").length < (parseInt(LimitOfVideo) || 999999999999999)

    // Submit video for campaign
    const submitVideo = (campaign) => {
        navigation.navigate('CampaignHub', {
            mode: 'submit',
            campaignId: campaign.id
        });
    };

    const StatusBadge = ({ status, count, label }) => {
        let bgColor, icon;
        
        switch(status) {
            case 'active':
                bgColor = '#00c1baff';
                icon = 'checkmark-circle';
                break;
            case 'rejected':
                bgColor = '#ff0030';
                icon = 'close-circle';
                break;
            case 'review':
                bgColor = '#d29d01ff';
                icon = 'time';
                break;
            default:
                bgColor = '#555';
                icon = 'help-circle';
        }
        
        return (
            <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={14} color="white" />
                <Text style={styles.statusText}> {label}{count !== undefined ? ` (${count})` : ''}</Text>
            </View>
        );
    };

    const InfoCard = ({ title, children, style }) => (
        <View style={[styles.infoCard, style]}>
            <Text style={styles.infoCardTitle}>{title}</Text>
            {children}
        </View>
    );

    const renderContent = () => {
        return (
            <View style={{ flex: 1 }}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image 
                        source={{ uri: baseUrl + "/api/campaigndocs/" + campaignData.id + "/" + campaignData.campaignInfo.image }} 
                        style={styles.campaignImage} 
                    />
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{campaignData.campaignInfo.title}</Text>
                        {campaignData.status == "active" ? (
                            <Text style={styles.reward}>Reward: {campaignData.reward} FCFA</Text>
                        ) : campaignData.status == "active" ? (
                            <Text style={styles.views}>Participants: {campaignData.evolution.participantsVideos.length}</Text>
                        ) : <></>}
                        
                        <View style={styles.statusRow}>
                            {campaignData.status === 'active' && (
                                <View style={[styles.statusPill, { backgroundColor: '#25D366' }]}>
                                    <Text style={styles.statusPillText}>Active</Text>
                                </View>
                            )}
                            {campaignData.status === 'upcoming' && (
                                <View style={[styles.statusPill, { backgroundColor: '#FFC107' }]}>
                                    <Text style={[styles.statusPillText, { color: '#333' }]}>Upcoming</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Creator Status Section */}
                {user.userType === 'creator' && (
                    <View style={styles.creatorStatusSection}>
                        <Text style={styles.sectionTitle}>Your Participation</Text>
                        <View style={styles.campaignStatus}>
                            <StatusBadge 
                                status={userParticipation?.participation.status || 'pending'} 
                                label={userParticipation?.participation.status === 'active' ? 'Validé' : 'En attente'} 
                            />
                            
                            {submitedVideos.some(sv => sv.status == "active") && (
                                <StatusBadge 
                                    status="active" 
                                    count={submitedVideos.filter(sv => sv.status == "active").length} 
                                    label="Vidéo validé" 
                                />
                            )}
                            
                            {submitedVideos.some(sv => sv.status == "review") && (
                                <StatusBadge 
                                    status="review" 
                                    count={submitedVideos.filter(sv => sv.status == "review").length} 
                                    label="Video en attente" 
                                />
                            )}
                            
                            {submitedVideos.some(sv => sv.status == "rejected") && (
                                <StatusBadge 
                                    status="rejected" 
                                    count={submitedVideos.filter(sv => sv.status == "rejected").length} 
                                    label="Video rejété" 
                                />
                            )}
                        </View>
                    </View>
                )}

                {/* Action Buttons for Creators */}
                {user.userType === "creator" && (
                    <View style={styles.actionButtons}>
                        {campaignData.status === 'active' && (
                            <TouchableOpacity
                                style={[styles.submitButton, userParticipation?.participation.status !== 'active' || !canSubmit ? { opacity: 0.5 } : {}]}
                                onPress={() => !canSubmit ? Alert.alert('Limit atteint', 'vous avez atteint la limite du nombre de vidéo pouvant être soumis') : userParticipation?.participation.status === 'active' ? submitVideo(campaignData) : Alert.alert('Veillez patienter', 'Votre participation à cette campagne est en cours d\'examen')}
                            >
                                <Ionicons name="videocam" size={20} color="#FF0050" />
                                <Text style={styles.submitButtonText}>
                                    Soumettre {submitedVideos.filter(sv => sv.status !== "rejected").length > 0 && 
                                        `(${submitedVideos.filter(sv => sv.status !== "rejected").length}/${LimitOfVideo} vidéos)`} 
                                </Text>
                            </TouchableOpacity>
                        )}
                        
                        {campaignData.status === 'active' && (
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => navigation.navigate('CampaignHub', {
                                    mode: 'stats',
                                    campaignId: campaignData.id
                                })}
                            >
                                <Ionicons name="bar-chart" size={20} color="#aaa" />
                                <Text style={styles.viewButtonText}>Stats (0 FCFA)</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Campaign Details */}
                <ScrollView style={styles.detailsContainer}>
                    <InfoCard title="Description">
                        <Text style={styles.description}>{campaignData.campaignInfo.description}</Text>
                    </InfoCard>

                    <InfoCard title="Period">
                        <View style={styles.periodContainer}>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateLabel}>Start Date</Text>
                                <Text style={styles.dateValue}>
                                    {(new Date(campaignData.campaignInfo.startDate)).toLocaleDateString('fr-FR', { day: "2-digit", month: "short", year: "numeric" })}
                                </Text>
                            </View>
                            
                            <View style={styles.dateSeparator}>
                                <Ionicons name="arrow-forward" size={16} color="#00F2EA" />
                            </View>
                            
                            <View style={styles.dateBox}>
                                <Text style={styles.dateLabel}>End Date</Text>
                                <Text style={styles.dateValue}>
                                    {(new Date(campaignData.campaignInfo.endDate)).toLocaleDateString('fr-FR', { day: "2-digit", month: "short", year: "numeric" })}
                                </Text>
                            </View>
                        </View>
                    </InfoCard>

                    <InfoCard title="Budget">
                        <View style={styles.budgetContainer}>
                            <View style={styles.budgetItem}>
                                <Text style={styles.budgetLabel}>Total Budget</Text>
                                <Text style={styles.budgetValue}>{campaignData.campaignCreatorsAndBudget.totalBudget} CFA</Text>
                            </View>
                            
                            <View style={styles.budgetItem}>
                                <Text style={styles.budgetLabel}>Per Creator Limit</Text>
                                <Text style={styles.budgetValue}>
                                    {campaignData.campaignCreatorsAndBudget.limitBudgetPerCreator.state ? 
                                        `${campaignData.campaignCreatorsAndBudget.limitBudgetPerCreator.max} CFA` : 
                                        "No limit"}
                                </Text>
                            </View>
                        </View>
                    </InfoCard>

                    <InfoCard title="Creators Requirements">
                        <View style={styles.requirementsList}>
                            <View style={styles.requirementItem}>
                                <Ionicons name="videocam-outline" size={16} color="#00F2EA" />
                                <Text style={styles.requirementText}>
                                    Content Limit: {
                                        campaignData.campaignCreatorsAndBudget.limitContentPerCreator.state ?
                                            `${campaignData.campaignCreatorsAndBudget.limitContentPerCreator.min} to ${campaignData.campaignCreatorsAndBudget.limitContentPerCreator.max}` :
                                            "No limit"
                                    }
                                </Text>
                            </View>
                            
                            <View style={styles.requirementItem}>
                                <Ionicons name="people-outline" size={16} color="#00F2EA" />
                                <Text style={styles.requirementText}>
                                    Creator Limit: {
                                        campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.state ? 
                                            `${campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.creators.length} creators` : 
                                            "No limit"
                                    }
                                </Text>
                            </View>
                        </View>
                        
                        {campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.state && (
                            <View style={styles.creatorsList}>
                                <Text style={styles.creatorsTitle}>Selected Creators:</Text>
                                <FlatList
                                    data={campaignData.campaignCreatorsAndBudget.limitParticipatingCreator.creators}
                                    keyExtractor={item => item.id}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <View style={styles.creatorCard}>
                                            <Image 
                                                source={{ uri: item.tiktokUser.user.avatarThumb }} 
                                                style={styles.creatorAvatar} 
                                            />
                                            <View style={styles.creatorInfo}>
                                                <Text style={styles.creatorName} numberOfLines={1}>
                                                    {item.tiktokUser.user.nickname}
                                                </Text>
                                                <Text style={styles.creatorUsername} numberOfLines={1}>
                                                    @{item.tiktokUser.user.username}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>
                        )}
                    </InfoCard>

                    <InfoCard title="Campaign Type">
                        {campaignData.campaignType.captionCampaign.state && (
                            <View style={styles.campaignTypeCard}>
                                <View style={styles.campaignTypeHeader}>
                                    <Ionicons name="text-outline" size={20} color="#00F2EA" />
                                    <Text style={styles.campaignTypeTitle}>Caption Campaign</Text>
                                </View>
                                <Text style={styles.campaignTypeDesc}>Required Caption:</Text>
                                <View style={styles.captionBox}>
                                    <Text style={styles.captionText}>{campaignData.campaignType.captionCampaign.caption}</Text>
                                </View>
                            </View>
                        )}

                        {campaignData.campaignType.textInContentCampaign.state && (
                            <View style={styles.campaignTypeCard}>
                                <View style={styles.campaignTypeHeader}>
                                    <Ionicons name="document-text-outline" size={20} color="#00F2EA" />
                                    <Text style={styles.campaignTypeTitle}>Text in Content</Text>
                                </View>
                                <Text style={styles.campaignTypeDesc}>Required Text:</Text>
                                <View style={styles.captionBox}>
                                    <Text style={styles.captionText}>{campaignData.campaignType.textInContentCampaign.text}</Text>
                                </View>
                            </View>
                        )}

                        {campaignData.campaignType.VideoInContentCampaign.state && (
                            <View style={styles.campaignTypeCard}>
                                <View style={styles.campaignTypeHeader}>
                                    <Ionicons name="play-circle-outline" size={20} color="#00F2EA" />
                                    <Text style={styles.campaignTypeTitle}>Video in Content</Text>
                                </View>
                                
                                <View style={styles.videoRequirements}>
                                    <View style={styles.requirementRow}>
                                        <Ionicons name="film-outline" size={16} color="#aaa" />
                                        <Text style={styles.requirementDetail}>
                                            Video to include ({(campaignData.campaignType.VideoInContentCampaign.video.size / (1000 * 1000)).toFixed(2)}Mb)
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.requirementRow}>
                                        <Ionicons name="location-outline" size={16} color="#aaa" />
                                        <Text style={styles.requirementDetail}>
                                            Position: {campaignData.campaignType.VideoInContentCampaign.videoPosition.replaceAll('-', ' ')}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.requirementRow}>
                                        <Ionicons name="mic-outline" size={16} color="#aaa" />
                                        <Text style={styles.requirementDetail}>
                                            Speak over: {campaignData.campaignType.VideoInContentCampaign.shouldSpeakOver ? "Yes" : "No"}
                                        </Text>
                                    </View>
                                </View>
                                
                                {campaignData.campaignType.VideoInContentCampaign.shouldSpeakOver && (
                                    <>
                                        <Text style={styles.campaignTypeDesc}>Speak Over Script:</Text>
                                        <View style={styles.captionBox}>
                                            <Text style={styles.captionText}>
                                                {campaignData.campaignType.VideoInContentCampaign.speakOverScript}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}

                        {campaignData.campaignType.fullPresentationCampaign.state && (
                            <View style={styles.campaignTypeCard}>
                                <View style={styles.campaignTypeHeader}>
                                    <Ionicons name="briefcase-outline" size={20} color="#00F2EA" />
                                    <Text style={styles.campaignTypeTitle}>Full Presentation</Text>
                                </View>
                                
                                <Text style={styles.campaignTypeDesc}>Resources:</Text>
                                <View style={styles.resourcesList}>
                                    {campaignData.campaignType.fullPresentationCampaign.documents.map((doc, i) => {
                                        const docType = doc.mimeType?.split('/')[0] || 'document';
                                        return (
                                            <View key={i} style={styles.resourceItem}>
                                                <Ionicons 
                                                    name={docType === 'image' ? 'image-outline' : 
                                                          docType === 'video' ? 'videocam-outline' : 'document-outline'} 
                                                    size={16} 
                                                    color="#00F2EA" 
                                                />
                                                <Text style={styles.resourceText}>
                                                    {docType} document ({(doc.size / 1000000).toFixed(2)} Mb)
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                
                                <Text style={styles.campaignTypeDesc}>Instructions:</Text>
                                <View style={styles.captionBox}>
                                    <Text style={styles.captionText}>
                                        {campaignData.campaignType.fullPresentationCampaign.description}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </InfoCard>
                    
                    <View style={styles.spacer} />
                </ScrollView>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior="height" style={styles.container}>
            {renderContent()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    header: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    campaignImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 16
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 6
    },
    reward: {
        color: '#25D366',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8
    },
    views: {
        color: '#00F2EA',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8
    },
    statusRow: {
        flexDirection: 'row',
        marginTop: 4
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    statusPillText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    },
    creatorStatusSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    campaignStatus: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 80, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF0050',
        marginRight: 12
    },
    submitButtonText: {
        color: '#FF0050',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20
    },
    viewButtonText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6
    },
    detailsContainer: {
        flex: 1,
        padding: 16
    },
    infoCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
    },
    infoCardTitle: {
        color: '#00F2EA',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12
    },
    description: {
        color: '#ddd',
        lineHeight: 20
    },
    periodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dateBox: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1
    },
    dateLabel: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 4
    },
    dateValue: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600'
    },
    dateSeparator: {
        paddingHorizontal: 8
    },
    budgetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    budgetItem: {
        alignItems: 'center',
        flex: 1
    },
    budgetLabel: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 4
    },
    budgetValue: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    requirementsList: {
        marginBottom: 12
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    requirementText: {
        color: '#ddd',
        marginLeft: 8,
        fontSize: 14
    },
    creatorsList: {
        marginTop: 12
    },
    creatorsTitle: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 8
    },
    creatorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 8,
        marginRight: 8,
        width: width * 0.6
    },
    creatorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8
    },
    creatorInfo: {
        flex: 1
    },
    creatorName: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600'
    },
    creatorUsername: {
        color: '#aaa',
        fontSize: 12
    },
    campaignTypeCard: {
        backgroundColor: '#252525',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
    },
    campaignTypeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    campaignTypeTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8
    },
    campaignTypeDesc: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 8,
        marginBottom: 4
    },
    captionBox: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        marginTop: 4
    },
    captionText: {
        color: 'white',
        lineHeight: 20
    },
    videoRequirements: {
        marginVertical: 8
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    requirementDetail: {
        color: '#ddd',
        marginLeft: 8,
        fontSize: 14
    },
    resourcesList: {
        marginVertical: 8
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    resourceText: {
        color: '#ddd',
        marginLeft: 8,
        fontSize: 14
    },
    spacer: {
        height: 20
    },
    sectionTitle: {
        color: '#00F2EA',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8
    }
});

export default ViewCampaign;