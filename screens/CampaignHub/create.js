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

const CreateCampaign = ({ navigation, edit = false, campaignId = null, scope = 'all', selectedCreator = null }) => {
    const { uploadProgress, uploading, allUsers, user, CreateCampaign, loadCampaigns, setTabSelection, allCampaigns, baseUrl } = useAuth();

    const [datePickerFunction, setDatePickerFunction] = useState(() => { })
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [campaignTitle, setCampaignTitle] = useState('');
    const [campaignImage, setCampaignImage] = useState(null);
    const [campaignDescription, setCampaignDescription] = useState('');
    const [campaignStartDate, setCampaignStartDate] = useState({});
    const [campaignEndDate, setCampaignEndDate] = useState({});

    const [campaignAllCreators, setCampaignAllCreators] = useState(true);
    const [campaignSelectedCreatorInput, setCampaignSelectedCreatorInput] = useState('');
    const [campaignSelectedContentCreator, setCampaignSelectedContentCreator] = useState([]);

    const [campaignBudget, setCampaignBudget] = useState('');
    const [campaignShouldLimitBudget, setCampaignShouldLimitBudget] = useState(false);
    const [campaignLimitBudget, setCampaignLimitBudget] = useState('');
    const [campaignLimitNumberOfVideos, setCampaignLimitNumberOfVideos] = useState(false);
    const [campaignMinVideos, setCampaignMinVideos] = useState(1);
    const [campaignMaxVideos, setCampaignMaxVideos] = useState(5);

    const [campaignCaptionType, setCampaignCaptionType] = useState(false);
    const [campaignCaptionText, setCampaignCaptionText] = useState('');

    const [campaignInTextAdType, setCampaignInTextAdType] = useState(false);
    const [campaignVideoText, setCampaignVideoText] = useState('');

    const [campaignInVideoAdType, setCampaignInVideoAdType] = useState(false);
    const [video, setVideo] = useState(null);
    const [campaignInVideoPosition, setCampaignInVideoPosition] = useState('creator-choice');
    const [campaignInVideoCanSpeakOver, setCampaignInVideoCanSpeakOver] = useState(false);
    const [campaignInVideoSpeakOverScript, setCampaignInVideoSpeakOverScript] = useState("");

    const [campaignFullVideoAdType, setCampaignFullVideoAdType] = useState(false);
    const [campaignFullVideoAdDescription, setCampaignFullVideoAdDescription] = useState("");
    const [campaignFullVideoAdDocuments, setCampaignFullVideoAdDocuments] = useState(null);

    const [campaignFormStep, setCampaignFormStep] = useState(1);
    const [campaignError, setCampaignError] = useState(null);

    // Pré-remplissage si mode édition
    useEffect(() => {
        if (edit && campaignId && allCampaigns && allCampaigns.docs) {
            const campaign = allCampaigns.docs.find(_c => _c.id === campaignId);
            if (campaign) {
                setCampaignTitle(campaign.campaignInfo.title || '');
                setCampaignImage({ uri: baseUrl + "/api/campaigndocs/" + campaign.id + "/" + campaign.campaignInfo.image, serverName: campaign.campaignInfo.image });
                setCampaignDescription(campaign.campaignInfo.description || '');
                setCampaignStartDate({ timeStamp: campaign.campaignInfo.startDate, ...convertTimestampToDateObj(campaign.campaignInfo.startDate) });
                setCampaignEndDate({ timeStamp: campaign.campaignInfo.endDate, ...convertTimestampToDateObj(campaign.campaignInfo.endDate) });

                setCampaignBudget(campaign.campaignCreatorsAndBudget.totalBudget || '');
                setCampaignShouldLimitBudget(campaign.campaignCreatorsAndBudget.limitBudgetPerCreator.state || false);
                setCampaignLimitBudget(campaign.campaignCreatorsAndBudget.limitBudgetPerCreator.max || '');
                setCampaignLimitNumberOfVideos(campaign.campaignCreatorsAndBudget.limitContentPerCreator.state || false);
                setCampaignMinVideos(campaign.campaignCreatorsAndBudget.limitContentPerCreator.min || 1);
                setCampaignMaxVideos(campaign.campaignCreatorsAndBudget.limitContentPerCreator.max || 5);
                setCampaignAllCreators(!campaign.campaignCreatorsAndBudget.limitParticipatingCreator.state);
                setCampaignSelectedContentCreator(campaign.campaignCreatorsAndBudget.limitParticipatingCreator.creators || []);

                setCampaignCaptionType(campaign.campaignType.captionCampaign.state || false);
                setCampaignCaptionText(campaign.campaignType.captionCampaign.caption || '');
                setCampaignInTextAdType(campaign.campaignType.textInContentCampaign.state || false);
                setCampaignVideoText(campaign.campaignType.textInContentCampaign.text || '');
                setCampaignInVideoAdType(campaign.campaignType.VideoInContentCampaign.state || false);
                setVideo(campaign.campaignType.VideoInContentCampaign.video || null);
                setCampaignInVideoPosition(campaign.campaignType.VideoInContentCampaign.videoPosition || 'creator-choice');
                setCampaignInVideoCanSpeakOver(campaign.campaignType.VideoInContentCampaign.shouldSpeakOver || false);
                setCampaignInVideoSpeakOverScript(campaign.campaignType.VideoInContentCampaign.speakOverScript || '');
                setCampaignFullVideoAdType(campaign.campaignType.fullPresentationCampaign.state || false);
                setCampaignFullVideoAdDescription(campaign.campaignType.fullPresentationCampaign.description || '');
                setCampaignFullVideoAdDocuments(campaign.campaignType.fullPresentationCampaign.documents || null);
            }
        }
    }, [edit, campaignId, allCampaigns]);

    useEffect(() => {
        switch (scope) {
            case 'single':
                setCampaignAllCreators(false);
                setCampaignSelectedContentCreator(selectedCreator)
                break;
            case 'multiple':
                setCampaignAllCreators(false);
                setCampaignSelectedContentCreator(selectedCreator)
                break;
            case 'all':
                
                break;
        }

    }, [scope])
    // Fonction utilitaire pour convertir un timestamp en objet date {day, month, year}
    function convertTimestampToDateObj(timestamp) {
        if (!timestamp) return {};
        const date = new Date(timestamp);
        return {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            timeStamp: timestamp
        };
    }

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            result.assets[0].serverName = "Cover-" + user.email.replaceAll('@', '_') + "-" + Date.now() + "." + result.assets[0].fileName.split('.')[result.assets[0].fileName.split('.').length - 1];
            console.log(result.assets[0].serverName)
            setCampaignImage({ ...result.assets[0], name: result.assets[0].fileName });
        }
    };

    const pickVideo = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'video/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled === false) {
            result.assets[0].serverName = "InVideo-" + user.email.replaceAll('@', '_') + "-" + Date.now() + "." + result.assets[0].name.split('.')[result.assets[0].name.split('.').length - 1];
            console.log(result.assets[0].serverName)
            setVideo(result.assets[0]);
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            multiple: true
        });

        if (result.canceled === false) {

            const r = result.assets.map((_asset, i) => ({ ..._asset, serverName: "Documents-" + i + "-" + user.email.replaceAll('@', '_') + "-" + Date.now() + "." + _asset.name.split('.')[_asset.name.split('.').length - 1] }))

            console.log(r.map(_s => _s.serverName))
            if (campaignFullVideoAdDocuments)
                setCampaignFullVideoAdDocuments([...campaignFullVideoAdDocuments, ...r]);
            else
                setCampaignFullVideoAdDocuments(r);

        }
    };

    const handleCreateCampaign = async () => {
        let err;

        //CHECK ALL VALUES OF PAGE 1
        if (!campaignTitle || !campaignImage || !campaignDescription || !campaignStartDate?.day || !campaignEndDate?.day) {
            setCampaignError({
                error: "Veillez entrer toutes les informations sur cette page",
                page: 1
            })
            setCampaignFormStep(1)
            return
        }
        err = (campaignTitle.length < 5 || campaignTitle.length > 50) ? "Le titre de votre campagne doit être d'au moin 5 charactères et de 50 caractères au plus" :
            (campaignDescription.length < 20 || campaignDescription.length > 700) ? "La description de votre campagne doit être d'au moin 20 charactères et de 500 caractères au plus" :
                (campaignStartDate.timeStamp < Date.now()) ? "Votre date de début est soit aujourd'hui ou dans le passé, veillez le mettre à une date future" :
                    (campaignEndDate.timeStamp < campaignStartDate.timeStamp + 604740000) ? "Votre date de Fin doit être au moin 7 jours après votre date de début " :
                        null

        if (err) {
            setCampaignError({
                error: err,
                page: 1
            })
            setCampaignFormStep(1)
            return
        }


        //CHECK ALL VALUES OF PAGE 
        err = (isNaN(parseInt(campaignBudget)) || parseInt(campaignBudget) < 10000) ? "Le Budget de votre campagne doit être d'au moin 10,000frs" :
            (campaignShouldLimitBudget && campaignLimitBudget < 5000) ? "La limite minimale de budget par créateur est de 5000 FCFA" :
                (campaignLimitNumberOfVideos && (campaignMinVideos < 1 || campaignMinVideos > campaignMaxVideos)) ? "Le nombre minimale de vidéos produit par un créateur doit être supérieure à 0 et inférieure au nombre maximale de vidéo" :
                    (!campaignAllCreators && campaignSelectedContentCreator.length < 1) ? "Vous devez selectionner au moin 1 créateur de contenu qui pourra participer à votre campagne" :
                        null

        if (err) {
            setCampaignError({
                error: err,
                page: 2
            })
            setCampaignFormStep(2)
            return
        }


        //CHECK ALL VALUES OF PAGE 3
        err = (!campaignCaptionType && !campaignInTextAdType && !campaignInVideoAdType && !campaignFullVideoAdType) ? "Vous devez choisir au moin une des 4 options suivantes" :
            (campaignCaptionType && (campaignCaptionText.length < 10 || campaignCaptionText.length > 500)) ? "Le texte en description se doit d'être entre 10 et 500 caractères" :
                (campaignInTextAdType && (campaignVideoText.length < 10 || campaignVideoText.length > 200)) ? "Le texte à inserer dans la video du créateur de contenu se doit d'être entre 10 et 200 caractères" :
                    (campaignInVideoAdType && !video) ? "Veillez choisir la vidéo que le créateur de contenu inserera dans son contenu" :
                        (campaignInVideoAdType && !campaignInVideoPosition) ? "Veillez choisir la position de la vidéo que le créateur de contenu inserera dans son contenu" :
                            (campaignInVideoAdType && campaignInVideoCanSpeakOver && (campaignInVideoSpeakOverScript.length < 10 || campaignInVideoSpeakOverScript.length > 500)) ? "Le texte que le créateur de contenu devrait dire par dessus la vidéo qu'il insérera dans son contenu se doit d'être entre 10 et 500 caractères" :
                                (campaignFullVideoAdType && (!campaignFullVideoAdDocuments || campaignFullVideoAdDocuments.length < 1)) ? "Vous devez selectionner au moin 1 document pour aider le créateur de contenu dans la réalisation de sa vidéo publicitaire" :
                                    (campaignFullVideoAdType && (campaignFullVideoAdDescription.length < 10 || campaignFullVideoAdDescription.length > 1500)) ? "décrivez comment vous souhaitez que le créateur utilise les documents fournis pour réaliser sa vidéo publicitaire avec des instructions entre 10 et 500 caractères" :
                                        null

        if (err) {
            setCampaignError({
                error: err,
                page: 3
            })
            setCampaignFormStep(3)
            return
        }
        // Construction de l'objet Campaign
        let id = (edit && campaignId) ? campaignId : ("campaign-" + user.email + "-" + Date.now());

        let Campaign = {
            id: id,
            campaignOwner: user.email,
            campaignInfo: {
                title: campaignTitle,
                image: campaignImage.serverName,
                description: campaignDescription,
                startDate: campaignStartDate.timeStamp,
                endDate: campaignEndDate.timeStamp
            },
            campaignCreatorsAndBudget: {
                totalBudget: campaignBudget,
                limitBudgetPerCreator: {
                    state: campaignShouldLimitBudget,
                    min: 1,
                    max: campaignLimitBudget
                },
                limitContentPerCreator: {
                    state: campaignLimitNumberOfVideos,
                    min: campaignMinVideos,
                    max: campaignMaxVideos
                },
                limitParticipatingCreator: {
                    state: !campaignAllCreators,
                    creators: campaignSelectedContentCreator
                },
            },
            campaignType: {
                captionCampaign: {
                    state: campaignCaptionType,
                    caption: campaignCaptionText
                },
                textInContentCampaign: {
                    state: campaignInTextAdType,
                    text: campaignVideoText
                },
                VideoInContentCampaign: {
                    state: campaignInVideoAdType,
                    video: video,
                    videoPosition: campaignInVideoPosition,
                    shouldSpeakOver: campaignInVideoCanSpeakOver,
                    speakOverScript: campaignInVideoSpeakOverScript
                },
                fullPresentationCampaign: {
                    state: campaignFullVideoAdType,
                    documents: campaignFullVideoAdDocuments ? campaignFullVideoAdDocuments.map(doc => ({ name: doc.serverName, size: doc.size, mimeType: doc.mimeType, serverName: doc.serverName })) : [],
                    description: campaignFullVideoAdDescription
                },
            },
            evolution: {
                participantsVideos: [],
                stats: []
            },
            createdAt: Date.now(),
            status: "review"
        }

        let files = [campaignImage]
        if (campaignInVideoAdType) files.push(video)
        if (campaignFullVideoAdType && campaignFullVideoAdDocuments) files = files.concat(campaignFullVideoAdDocuments)

        files.forEach(f => console.log(' =>', f.serverName))

        Campaign.campaignInfo.documents = files.map(f => ({ name: f.serverName, size: f.size, mimeType: f.mimeType, serverName: f.serverName }))

        await CreateCampaign(files, Campaign, edit, campaignId)
        await loadCampaigns()
        setTabSelection(1)
        Alert.alert(edit ? 'Campagne modifiée avec succès !' : 'Campagne créée avec succès !');
        navigation.goBack();
    };

    const RenderStep1 = () => {
        return (
            <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Campaign Info</Text>

                <HelpBox Message={{ text: "Entrez les informations sur votre campagne. ces informations seront présenté au créateurs de contenu, alors n'hésitez pas à y intégrer tous ce qui pourrait les attirer à créer du contenu pour cette campagne", type: "info" }} />

                <TouchableOpacity style={[{ width: 150, alignSelf: "center", aspectRatio: 1, overflow: "hidden", borderRadius: 10, backgroundColor: "#555", justifyContent: "center", marginBottom: 10 }]} onPress={() => pickImage()}>
                    {campaignImage ?
                        <Image src={campaignImage.uri} style={{ width: "100%", aspectRatio: 1 }} />
                        :
                        <Text style={{ fontSize: 30, fontWeight: "bold", textAlign: "center", color: "#0005" }}> + </Text>
                    }
                </TouchableOpacity>

                <TextInput
                    placeholder="Campaign Title"
                    value={campaignTitle}
                    onChangeText={setCampaignTitle}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Campaign Description. Describe your campaign and it's objectives to the content creators"
                    value={campaignDescription}
                    onChangeText={setCampaignDescription}
                    style={[styles.input, { height: 100 }]}
                    multiline
                />

                <View
                    style={{ flexDirection: "row", justifyContent: "space-around" }}
                >

                    <TouchableOpacity
                        onPress={() => {
                            setDatePickerFunction('startdate')
                            setShowDatePicker(true)
                        }}
                        style={[styles.input, { marginTop: 0, marginBottom: 5, flexDirection: 'row', alignItems: "center", width: "45%" }]}
                    >
                        <Ionicons name={"calendar"} size={20} style={{ marginRight: 10 }} color={"white"}></Ionicons>
                        <Text style={{ color: "white" }}>{(!campaignStartDate?.day) ? "Start Date" : campaignStartDate?.day + "/" + campaignStartDate?.month + "/" + campaignStartDate?.year}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setDatePickerFunction('enddate')
                            setShowDatePicker(true)
                        }}
                        style={[styles.input, { marginTop: 0, marginBottom: 5, flexDirection: 'row', alignItems: "center", width: "45%" }]}
                    >
                        <Ionicons name={"calendar"} size={20} style={{ marginRight: 10 }} color={"white"}></Ionicons>
                        <Text style={{ color: "white" }}>{(!campaignEndDate?.day) ? "End Date" : campaignEndDate?.day + "/" + campaignEndDate?.month + "/" + campaignEndDate?.year}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const RenderStep2 = () => {
        return (
            <View>
                <Text style={styles.sectionTitle}>Campaign Creators & Budget</Text>

                <HelpBox Message={{
                    text: "Selectionnez les créateurs de contenu qui pourrons créer du contenu pour cette campagne",
                    type: "info"
                }} />

                <TextInput
                    placeholder="Total Budget (FCFA)"
                    value={isNaN(parseInt(campaignBudget)) ? 0 : parseInt(campaignBudget).toLocaleString('en-GB')}
                    onChangeText={(text) => { setCampaignBudget(text.replaceAll(',', '').replaceAll('.', '')) }}
                    style={[styles.input, { marginBottom: 5 }]}
                    keyboardType="numeric"
                />

                <CheckBox text={" Limit Budget Per Creator "} value={campaignShouldLimitBudget} setValue={setCampaignShouldLimitBudget} />

                {campaignShouldLimitBudget && (<TextInput
                    placeholder="Budget Max par Createur (FCFA)"
                    value={isNaN(parseInt(campaignLimitBudget)) ? 0 : parseInt(campaignLimitBudget).toLocaleString('en-GB')}
                    onChangeText={(text) => { setCampaignLimitBudget(text.replaceAll(',', '').replaceAll('.', '')) }}
                    style={styles.input}
                    keyboardType="numeric"
                />)}

                <CheckBox text={" Limit Number of content per creator "} value={campaignLimitNumberOfVideos} setValue={setCampaignLimitNumberOfVideos} />

                {campaignLimitNumberOfVideos && (
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <TextInput
                            placeholder="Min Video(s)"
                            value={campaignMinVideos + ""}
                            onChangeText={setCampaignMinVideos}
                            style={[styles.input, { width: "45%" }]}
                            keyboardType="numeric"
                        />
                        <TextInput
                            placeholder="Max Video(s)"
                            value={campaignMaxVideos + ""}
                            onChangeText={setCampaignMaxVideos}
                            style={[styles.input, { width: "45%" }]}
                            keyboardType="numeric"
                        />
                    </View>
                )}


                <CheckBox style={{ marginBottom: 10 }} text={" All Content Creators can participate "} value={campaignAllCreators} setValue={setCampaignAllCreators} />
                {!campaignAllCreators && (
                    <View style={{ backgroundColor: "#555", padding: 10, borderRadius: 10, marginBottom: 15 }}>
                        <TextInput
                            placeholder="Search Content Creator"
                            value={campaignSelectedCreatorInput}
                            onChangeText={setCampaignSelectedCreatorInput}
                            style={[styles.input, { marginTop: 0, backgroundColor: '#666' }]}
                        />
                        <FlatList
                            data={allUsers.docs.filter((_c, index) => {
                                let numberOfResult = 30;
                                if (campaignSelectedCreatorInput.length > 0) numberOfResult = 10
                                return (index < numberOfResult) && (_c.tiktokUser?.user.username.includes(campaignSelectedCreatorInput.toLowerCase()) || _c.tiktokUser?.user.nickname.toLowerCase().includes(campaignSelectedCreatorInput.toLowerCase()))
                            })}
                            keyExtractor={item => item.id}
                            horizontal
                            renderItem={({ item }) => {
                                const selectedCCIndex = campaignSelectedContentCreator.findIndex((_cc) => _cc.id === item.id);
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (selectedCCIndex !== -1) {
                                                const tempArr = [...campaignSelectedContentCreator]
                                                tempArr.splice(selectedCCIndex, 1)
                                                setCampaignSelectedContentCreator(tempArr)
                                            } else {
                                                setCampaignSelectedContentCreator([...campaignSelectedContentCreator, item])
                                            }
                                        }}
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
                    </View>
                )}

            </View>
        )
    }

    const RenderStep3 = () => {
        return (
            <View>
                <Text style={styles.sectionTitle}>Campaign Type</Text>

                { /** CAPTION CAMPAIGN */}
                <CheckBox style={{
                    borderRadius: 10,
                    backgroundColor: "#222",
                    padding: 15,
                    elevation: 5,
                    zIndex: 5
                }} text={" Caption Ad"} value={campaignCaptionType} setValue={setCampaignCaptionType} />

                {campaignCaptionType && (
                    <View style={{ marginHorizontal: 10, padding: 15, backgroundColor: "#222", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                        <HelpBox style={{ elevation: 5 }} Message={{ text: "Ici, le créateur de Contenu mettra ce texte comme description de son contenu vidéo habituel", type: "info" }} />

                        <Text style={[styles.title, { marginBottom: 0, marginTop: 0, fontSize: 14 }]}>Caption Text</Text>

                        <TextInput
                            placeholder="Enter Caption to be written by the creator in his video's description (hashtags can be included)"
                            value={campaignCaptionText}
                            onChangeText={setCampaignCaptionText}
                            style={[styles.input, { height: 150, marginTop: 0, marginBottom: 0 }]}
                            multiline
                        />
                        <Text style={{ color: "#555", marginBottom: 5 }}>{campaignCaptionText.length < 10 ? (10 - campaignCaptionText.length) + " caractères manquants" : (500 - campaignCaptionText.length) + "/500"}</Text>
                    </View>
                )}

                { /** TEXT IN VIDEO CAMPAIGN */}
                <CheckBox style={{
                    borderRadius: 10,
                    backgroundColor: "#222",
                    padding: 15,
                    marginTop: 20,
                    elevation: 5,
                    zIndex: 5
                }} text={" Text in video Ad "} value={campaignInTextAdType} setValue={setCampaignInTextAdType} />

                {campaignInTextAdType && (

                    <View style={{ marginHorizontal: 10, padding: 15, backgroundColor: "#222", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                        <HelpBox style={{ elevation: 5 }} Message={{ text: "Ici, le créateur de Contenu écrira en grand le texte que vous avez entré directement sur son contenu vidéo.", type: "info" }} />

                        <TextInput
                            placeholder="Enter the text to be written by the creator onto his video"
                            value={campaignVideoText}
                            onChangeText={setCampaignVideoText}
                            style={[styles.input, { height: 80, marginTop: 0, marginBottom: 0 }]}
                            multiline
                        />
                        <Text style={{ color: "#555", marginBottom: 5 }}>{campaignVideoText.length < 10 ? (10 - campaignVideoText.length) + " caractères manquants" : (500 - campaignVideoText.length) + "/500"}</Text>
                    </View>
                )}

                { /** VIDEO IN VIDEO CAMPAIGN */}
                <CheckBox style={{
                    borderRadius: 10,
                    backgroundColor: "#222",
                    padding: 15,
                    marginTop: 20
                }} text={" Video in Content Ad "} value={campaignInVideoAdType} setValue={setCampaignInVideoAdType} />

                {campaignInVideoAdType && (
                    <View style={{ marginHorizontal: 10, padding: 15, backgroundColor: "#222", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                        <HelpBox style={{ elevation: 5 }} Message={{ text: "Ici, le créateur de Contenu Inserera Votre vidéo à l'intérieure de son contenu habituel. Vous pouvez également rédiger ce qu'il dira par dessus la vidéo si besoin ai", type: "info" }} />

                        <TouchableOpacity
                            onPress={pickVideo}
                            style={[styles.input, { marginTop: 0, marginBottom: 5, flexDirection: 'row', alignItems: "center" }]}
                        >
                            <Ionicons name={video ? "checkmark-circle-outline" : "videocam"} size={20} style={{ marginRight: 10 }} color={"white"}></Ionicons>
                            <Text style={{ color: "white" }}>{video ? "Video Selected" : "Select Video"}</Text>
                        </TouchableOpacity>

                        {video &&
                            <TouchableOpacity onPress={() => {
                                setVideo(null)
                            }} style={[styles.input, { marginTop: 5, paddingVertical: 5, marginBottom: 5, flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }]}>
                                <Text style={{ color: "#fff" }}> • {video.name.split('.').map(t => { if (t.length > 15) return t.substring(0, 15) + "***"; else return t; }).join('.')} ({(video.size / (1000 * 1000)).toPrecision(3)}Mb)</Text>
                                <Text style={{ color: "#fff", fontSize: 18 }}> × </Text>
                            </TouchableOpacity>
                        }
                        {uploading && (
                            <View style={styles.progressContainer}>
                                <View style={{ borderRadius: 10, backgroundColor: "#222" }}>
                                    <View style={{ width: uploadProgress * 100 + "%", borderRadius: 10, padding: 3, backgroundColor: '#25D366' }} />
                                </View>
                                <Text>{Math.round(uploadProgress * 100)}%</Text>
                            </View>
                        )}

                        <Text style={[styles.title, { marginBottom: 0, marginTop: 10, fontSize: 14 }]}>Choose Video Position in Content</Text>
                        <RNPickerSelect
                            onValueChange={setCampaignInVideoPosition}
                            items={[
                                { label: 'Content creator should decide', value: 'creator-choice' },
                                { label: 'Start of the Video', value: 'Start-video' },
                                { label: 'Middle of the Video', value: 'mid-video' },
                                { label: 'End of the vidéo', value: 'end-of-video' }
                            ]}
                            value={campaignInVideoPosition}
                            style={pickerSelectStyles}
                        />

                        <CheckBox style={{}} text={" Should Creator speak over?"} value={campaignInVideoCanSpeakOver} setValue={setCampaignInVideoCanSpeakOver} />
                        {campaignInVideoCanSpeakOver && (
                            <>
                                <TextInput
                                    placeholder="Enter What the Content creator should say when your video is shown in his content"
                                    value={campaignInVideoSpeakOverScript}
                                    onChangeText={setCampaignInVideoSpeakOverScript}
                                    style={[styles.input, { height: 100, marginTop: 10 }]}
                                    multiline
                                />
                                <Text style={{ color: "#555", marginBottom: 5 }}>{campaignInVideoSpeakOverScript.length < 10 ? (10 - campaignInVideoSpeakOverScript.length) + " caractères manquants" : (500 - campaignInVideoSpeakOverScript.length) + "/500"}</Text>
                            </>
                        )}
                    </View>
                )
                }

                { /** FULL VIDEO CAMPAIGN */}
                <CheckBox style={{
                    borderRadius: 10,
                    backgroundColor: "#222",
                    padding: 15,
                    marginTop: 20
                }} text={" Full Presentation Ad "} value={campaignFullVideoAdType} setValue={setCampaignFullVideoAdType} />

                {
                    campaignFullVideoAdType && (
                        <View style={{ marginHorizontal: 10, padding: 15, backgroundColor: "#222", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                            <HelpBox style={{ elevation: 5 }} Message={{ text: "Ici, le créateur de Contenu fera une vidéo dédié à la présentation de votre produit/service. Donnez tout documents sur votre produit/service qui pourrait l'aider à efficacement le présenter (Image, pdf, vidéo, etc)", type: "info" }} />

                            <TouchableOpacity
                                onPress={pickDocument}
                                style={[styles.input, { marginTop: 0, marginBottom: 5, flexDirection: 'row', alignItems: "center" }]}
                            >
                                <Ionicons name={campaignFullVideoAdDocuments ? "add-circle-outline" : "document"} size={20} style={{ marginRight: 10 }} color={"white"}></Ionicons>
                                <Text style={{ color: "white" }}>{campaignFullVideoAdDocuments ? "Add More Documents" : "Select Support Documents"}</Text>
                            </TouchableOpacity>

                            {campaignFullVideoAdDocuments &&
                                <Text style={{ color: "#999" }}>
                                    Selected:
                                </Text>
                            }
                            {campaignFullVideoAdDocuments && campaignFullVideoAdDocuments.map((doc, id) => (
                                <TouchableOpacity onPress={() => {
                                    const tmpArr = [...campaignFullVideoAdDocuments]
                                    tmpArr.splice(id, 1)
                                    if (tmpArr.length == 0)
                                        setCampaignFullVideoAdDocuments(null)
                                    else
                                        setCampaignFullVideoAdDocuments(tmpArr)
                                }} key={id} style={[styles.input, { marginTop: 0, paddingVertical: 5, marginBottom: 5, flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }]}>
                                    <Text style={{ color: "#fff" }}> • {doc.name.split('.').map(t => { if (t.length > 15) return t.substring(0, 15) + "***"; else return t; }).join('.')} ({(doc.size / (1000 * 1000)).toPrecision(3)}Mb)</Text>
                                    <Text style={{ color: "#fff", fontSize: 18 }}> × </Text>
                                </TouchableOpacity>
                            ))}

                            {uploading && (
                                <View style={styles.progressContainer}>
                                    <View style={{ borderRadius: 10, backgroundColor: "#222" }}>
                                        <View style={{ width: uploadProgress * 100 + "%", borderRadius: 10, padding: 3, backgroundColor: '#25D366' }} />
                                    </View>
                                    <Text>{Math.round(uploadProgress * 100)}%</Text>
                                </View>
                            )}

                            <TextInput
                                placeholder="Describe how you want the content creator to use your documents to create an appropriate promotional content"
                                value={campaignFullVideoAdDescription}
                                onChangeText={setCampaignFullVideoAdDescription}
                                style={[styles.input, { height: 200, marginTop: 10 }]}
                                multiline
                            />
                            <Text style={{ color: "#555", marginBottom: 5 }}>{campaignFullVideoAdDescription.length < 10 ? (10 - campaignFullVideoAdDescription.length) + " caractères manquants" : (500 - campaignFullVideoAdDescription.length) + "/1500"}</Text>

                        </View>
                    )
                }
            </View >
        )
    }

    const renderContent = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
                    {Array.from({ length: NUM_CAMPAIGN_CREATION_STEPS }).map((_, row) => (
                        <View key={row} style={{ padding: 5, borderRadius: 15, backgroundColor: (row + 1) == campaignFormStep ? '#FF0050' : "#555", width: (100 / NUM_CAMPAIGN_CREATION_STEPS) - 1 + '%' }}></View>
                    ))}
                </View>

                {campaignError && campaignError.page == campaignFormStep &&
                    <HelpBox style={{ marginTop: 10, marginBottom: 0, marginRight: 20 }} Message={{ text: campaignError.error, type: "error" }} />
                }


                <ScrollView>

                    {campaignFormStep == 1 && RenderStep1()}
                    {campaignFormStep == 2 && RenderStep2()}
                    {campaignFormStep == 3 && RenderStep3()}

                </ScrollView>

                <View style={{ flexDirection: "row", justifyContent: "space-between", height: 60 }}>
                    {campaignFormStep > 1 && (
                        <TouchableOpacity onPress={() => setCampaignFormStep(Math.max(campaignFormStep - 1, 1))} style={[styles.Button, { left: 10, position: "absolute" }]}>
                            <Text style={[styles.ButtonText, { paddingHorizontal: 15 }]}>Previous</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => {
                        setCampaignError(null)
                        if (campaignFormStep == NUM_CAMPAIGN_CREATION_STEPS)
                            handleCreateCampaign()
                        else
                            setCampaignFormStep(Math.min(campaignFormStep + 1, NUM_CAMPAIGN_CREATION_STEPS))
                    }} style={[styles.Button, { right: 10, position: "absolute" }]}>
                        <Text style={[styles.ButtonText, { paddingHorizontal: 15 }]}>{campaignFormStep == NUM_CAMPAIGN_CREATION_STEPS ? (edit ? "Update Campaign" : "Create Campaign") : "Next"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={styles.container}>
            {renderContent()}

            {showDatePicker && <View style={styles.dateOverlay}>
                <View style={styles.datePickerContainer}>
                    <DateTimePicker onDateTimeSet={(date) => {
                        if (datePickerFunction === 'startdate')
                            setCampaignStartDate(date)
                        else if (datePickerFunction === 'enddate')
                            setCampaignEndDate(date)
                        setShowDatePicker(false)
                    }} onRevert={() => { setShowDatePicker(false) }} />
                </View>
            </View>}
            {uploading && <View style={styles.dateOverlay}>
                <View style={[styles.datePickerContainer, { alignItems: "center", paddingVertical: 25, top: "30%" }]}>
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Uploading...</Text>
                    {uploadProgress.map((_uploadProgress, i) => (
                        <View key={i} style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: "stretch" }}>
                            <Progress.Bar progress={_uploadProgress.progress} width={200} />
                            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold", marginHorizontal: 5 }}>{Math.round(_uploadProgress.progress.toFixed(2) * 100)}%</Text>

                        </View>
                    ))}

                </View>
            </View>}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 0,
        backgroundColor: '#121212'
    },
    sectionTitle: {
        color: '#00F2EA',
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
        marginBottom: 10
    },
    input: {
        backgroundColor: '#555',
        color: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15
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
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,

    },
    ButtonText: {
        color: '#fff',
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold"
    },
    dateOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: "#ddd8",
        alignItems: "center"
    },
    datePickerContainer: {
        position: "absolute",
        width: "80%",
        padding: 10,
        borderRadius: 10,
        top: "20%",
        backgroundColor: "#222"
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        backgroundColor: '#555',
        color: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 5
    },
    inputAndroid: {
        backgroundColor: '#555',
        color: 'white',
        padding: 5,
        borderRadius: 10,
        marginBottom: 15,
        marginTop: 5

    }
});

export default CreateCampaign;