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

const CreateCampaign = ({ navigation, edit = false, campaignId = null, scope = 'all', selectedCreator = null }) => {
    const { uploadProgress, uploading, allUsers, user, CreateCampaign, loadCampaigns, setTabSelection, allCampaigns, baseUrl, sendNotification } = useAuth();

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
                participatingCreators: [],
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

        if (campaignAllCreators) {
            const resp = await sendNotification( null, 'creators', "📢 Nouvelle Campaigne Publicitaire", 'Une nouvelle campagne publicitaire est disponible pour vous. Cliquez sur "En savoir plus"', { path: 'CampaignHub', params: { mode: 'view', campaignId: id } })
            console.log('NOTIFICATION ', resp)
        } else {
            const resp = await sendNotification(campaignSelectedContentCreator.map(u => ({
                notificationToken: u.notificationToken,
                email: u.email,
                phone: u.phone
            })), null, "📢 Nouvelle Campaigne Publicitaire", 'Une nouvelle campagne publicitaire est disponible pour vous. Cliquez sur "En savoir plus"', { path: 'CampaignHub', params: { mode: 'view', campaignId: id } })
            console.log('NOTIFICATION ', resp)
        }

        Alert.alert(edit ? 'Campagne modifiée avec succès !' : 'Campagne créée avec succès !');
        //navigation.navigate('Dashboard');
    };

    const RenderStep1 = () => {
        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.stepTitle}>Informations de la campagne</Text>
                </View>

                <HelpBox Message={{ text: "Entrez les informations sur votre campagne. Ces informations seront présentées aux créateurs de contenu, alors n'hésitez pas à y intégrer tout ce qui pourrait les attirer à créer du contenu pour cette campagne", type: "info" }} />

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Image de la campagne</Text>
                    <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage()}>
                        {campaignImage ? (
                            <Image source={{ uri: campaignImage.uri }} style={styles.campaignImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image-outline" size={40} color="#888" />
                                <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Titre de la campagne</Text>
                    <TextInput
                        placeholder="Donnez un titre accrocheur à votre campagne"
                        placeholderTextColor="#888"
                        value={campaignTitle}
                        onChangeText={setCampaignTitle}
                        style={styles.input}
                    />
                    <Text style={styles.charCounter}>{campaignTitle.length}/50</Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Description</Text>
                    <TextInput
                        placeholder="Décrivez votre campagne et ses objectifs pour les créateurs de contenu"
                        placeholderTextColor="#888"
                        value={campaignDescription}
                        onChangeText={setCampaignDescription}
                        style={[styles.input, styles.textArea]}
                        multiline
                    />
                    <Text style={styles.charCounter}>{campaignDescription.length}/700</Text>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Dates de la campagne</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setDatePickerFunction('startdate')
                                setShowDatePicker(true)
                            }}
                            style={[styles.dateButton, !campaignStartDate?.day && styles.dateButtonEmpty]}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#00F2EA" />
                            <Text style={styles.dateButtonText}>
                                {campaignStartDate?.day ?
                                    `${campaignStartDate.day}/${campaignStartDate.month}/${campaignStartDate.year}` :
                                    "Date de début"
                                }
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setDatePickerFunction('enddate')
                                setShowDatePicker(true)
                            }}
                            style={[styles.dateButton, !campaignEndDate?.day && styles.dateButtonEmpty]}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#00F2EA" />
                            <Text style={styles.dateButtonText}>
                                {campaignEndDate?.day ?
                                    `${campaignEndDate.day}/${campaignEndDate.month}/${campaignEndDate.year}` :
                                    "Date de fin"
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    const RenderStep2 = () => {
        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.stepTitle}>Budget et créateurs</Text>
                </View>

                <HelpBox Message={{ text: "Configurez le budget et sélectionnez les créateurs de contenu qui pourront participer à cette campagne", type: "info" }} />

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Budget total (FCFA)</Text>
                    <View style={styles.budgetInputContainer}>
                        <Text style={styles.currencySymbol}>FCFA</Text>
                        <TextInput
                            placeholder="0"
                            placeholderTextColor="#888"
                            value={isNaN(parseInt(campaignBudget)) ? '' : parseInt(campaignBudget).toLocaleString('en-GB')}
                            onChangeText={(text) => { setCampaignBudget(text.replaceAll(',', '').replaceAll('.', '')) }}
                            style={[styles.input, styles.budgetInput]}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.checkboxRow}>
                        <CheckBox
                            text="Limiter le budget par créateur"
                            value={campaignShouldLimitBudget}
                            setValue={setCampaignShouldLimitBudget}
                        />
                    </View>

                    {campaignShouldLimitBudget && (
                        <View style={styles.limitedBudgetContainer}>
                            <Text style={styles.sublabel}>Budget maximum par créateur (FCFA)</Text>
                            <View style={styles.budgetInputContainer}>
                                <Text style={styles.currencySymbol}>FCFA</Text>
                                <TextInput
                                    placeholder="0"
                                    placeholderTextColor="#888"
                                    value={isNaN(parseInt(campaignLimitBudget)) ? '' : parseInt(campaignLimitBudget).toLocaleString('en-GB')}
                                    onChangeText={(text) => { setCampaignLimitBudget(text.replaceAll(',', '').replaceAll('.', '')) }}
                                    style={[styles.input, styles.budgetInput]}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.checkboxRow}>
                        <CheckBox
                            text="Limiter le nombre de vidéos par créateur"
                            value={campaignLimitNumberOfVideos}
                            setValue={setCampaignLimitNumberOfVideos}
                        />
                    </View>

                    {campaignLimitNumberOfVideos && (
                        <View style={styles.videoLimitsContainer}>
                            <Text style={styles.sublabel}>Nombre de vidéos par créateur</Text>
                            <View style={styles.videoLimitsRow}>
                                <View style={styles.videoLimitInput}>
                                    <Text style={styles.videoLimitLabel}>Minimum</Text>
                                    <TextInput
                                        placeholder="1"
                                        placeholderTextColor="#888"
                                        value={campaignMinVideos + ""}
                                        onChangeText={setCampaignMinVideos}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.videoLimitInput}>
                                    <Text style={styles.videoLimitLabel}>Maximum</Text>
                                    <TextInput
                                        placeholder="5"
                                        placeholderTextColor="#888"
                                        value={campaignMaxVideos + ""}
                                        onChangeText={setCampaignMaxVideos}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.checkboxRow}>
                        <CheckBox
                            text="Tous les créateurs peuvent participer"
                            value={campaignAllCreators}
                            setValue={setCampaignAllCreators}
                        />
                    </View>

                    {!campaignAllCreators && (
                        <View style={styles.creatorsSelectionContainer}>
                            <Text style={styles.sublabel}>Sélectionnez les créateurs</Text>
                            <TextInput
                                placeholder="Rechercher un créateur..."
                                placeholderTextColor="#888"
                                value={campaignSelectedCreatorInput}
                                onChangeText={setCampaignSelectedCreatorInput}
                                style={styles.input}
                            />

                            <FlatList
                                data={allUsers.docs.filter((_c, index) => {
                                    let numberOfResult = 30;
                                    if (campaignSelectedCreatorInput.length > 0) numberOfResult = 10;
                                    return (index < numberOfResult) &&
                                        (_c.tiktokUser?.username.includes(campaignSelectedCreatorInput.toLowerCase()) ||
                                            _c.tiktokUser?.nickname.toLowerCase().includes(campaignSelectedCreatorInput.toLowerCase()));
                                })}
                                keyExtractor={item => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => {
                                    const selectedCCIndex = campaignSelectedContentCreator.findIndex((_cc) => _cc.id === item.id);
                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (selectedCCIndex !== -1) {
                                                    const tempArr = [...campaignSelectedContentCreator];
                                                    tempArr.splice(selectedCCIndex, 1);
                                                    setCampaignSelectedContentCreator(tempArr);
                                                } else {
                                                    setCampaignSelectedContentCreator([...campaignSelectedContentCreator, item]);
                                                }
                                            }}
                                            style={[
                                                styles.creatorCard,
                                                selectedCCIndex !== -1 && styles.creatorCardSelected
                                            ]}
                                        >
                                            <Image
                                                source={{ uri: item.tiktokUser.avatarThumb }}
                                                style={styles.creatorAvatar}
                                            />
                                            <View style={styles.creatorInfo}>
                                                <Text style={styles.creatorName} numberOfLines={1}>
                                                    {item.tiktokUser.nickname}
                                                </Text>
                                                <Text style={styles.creatorUsername} numberOfLines={1}>
                                                    @{item.tiktokUser.username}
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name={selectedCCIndex !== -1 ? "checkmark-circle" : "ellipse-outline"}
                                                size={20}
                                                color={selectedCCIndex !== -1 ? "#00F2EA" : "#888"}
                                            />
                                        </TouchableOpacity>
                                    );
                                }}
                            />

                            {campaignSelectedContentCreator.length > 0 && (
                                <View style={styles.selectedCreatorsContainer}>
                                    <Text style={styles.selectedCreatorsLabel}>
                                        {campaignSelectedContentCreator.length} créateur(s) sélectionné(s)
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const RenderStep3 = () => {
        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={styles.stepTitle}>Type de campagne</Text>
                </View>

                <HelpBox Message={{ text: "Choisissez le type de contenu que les créateurs devront produire pour votre campagne", type: "info" }} />

                {/* Caption Campaign */}
                <View style={styles.campaignTypeCard}>
                    <View style={styles.campaignTypeHeader}>
                        <CheckBox
                            text="Publicité en description"
                            value={campaignCaptionType}
                            setValue={setCampaignCaptionType}
                        />
                        <Ionicons name="text-outline" size={24} color="#00F2EA" />
                    </View>

                    {campaignCaptionType && (
                        <View style={styles.campaignTypeContent}>
                            <HelpBox Message={{ text: "Le créateur mettra ce texte comme description de son contenu vidéo habituel", type: "info" }} />

                            <Text style={styles.campaignTypeLabel}>Texte de la description</Text>
                            <TextInput
                                placeholder="Entrez le texte à inclure dans la description de la vidéo (vous pouvez ajouter des hashtags)"
                                placeholderTextColor="#888"
                                value={campaignCaptionText}
                                onChangeText={setCampaignCaptionText}
                                style={[styles.input, styles.textArea]}
                                multiline
                            />
                            <Text style={styles.charCounter}>
                                {campaignCaptionText.length < 10 ?
                                    `${10 - campaignCaptionText.length} caractères manquants` :
                                    `${500 - campaignCaptionText.length}/500`
                                }
                            </Text>
                        </View>
                    )}
                </View>

                {/* Text in Video Campaign */}
                <View style={styles.campaignTypeCard}>
                    <View style={styles.campaignTypeHeader}>
                        <CheckBox
                            text="Texte dans la vidéo"
                            value={campaignInTextAdType}
                            setValue={setCampaignInTextAdType}
                        />
                        <Ionicons name="create-outline" size={24} color="#00F2EA" />
                    </View>

                    {campaignInTextAdType && (
                        <View style={styles.campaignTypeContent}>
                            <HelpBox Message={{ text: "Le créateur écrira ce texte directement sur son contenu vidéo", type: "info" }} />

                            <TextInput
                                placeholder="Entrez le texte à afficher dans la vidéo"
                                placeholderTextColor="#888"
                                value={campaignVideoText}
                                onChangeText={setCampaignVideoText}
                                style={[styles.input, styles.textArea]}
                                multiline
                            />
                            <Text style={styles.charCounter}>
                                {campaignVideoText.length < 10 ?
                                    `${10 - campaignVideoText.length} caractères manquants` :
                                    `${200 - campaignVideoText.length}/200`
                                }
                            </Text>
                        </View>
                    )}
                </View>

                {/* Video in Video Campaign */}
                <View style={styles.campaignTypeCard}>
                    <View style={styles.campaignTypeHeader}>
                        <CheckBox
                            text="Vidéo intégrée"
                            value={campaignInVideoAdType}
                            setValue={setCampaignInVideoAdType}
                        />
                        <Ionicons name="film-outline" size={24} color="#00F2EA" />
                    </View>

                    {campaignInVideoAdType && (
                        <View style={styles.campaignTypeContent}>
                            <HelpBox Message={{ text: "Le créateur intégrera votre vidéo dans son contenu habituel", type: "info" }} />

                            <TouchableOpacity onPress={pickVideo} style={styles.fileUploadButton}>
                                <Ionicons name={video ? "checkmark-circle" : "videocam-outline"} size={24} color="#00F2EA" />
                                <Text style={styles.fileUploadText}>
                                    {video ? "Vidéo sélectionnée" : "Sélectionner une vidéo"}
                                </Text>
                            </TouchableOpacity>

                            {video && (
                                <View style={styles.selectedFileContainer}>
                                    <Text style={styles.selectedFileName} numberOfLines={1}>
                                        {video.name}
                                    </Text>
                                    <Text style={styles.selectedFileSize}>
                                        ({(video.size / (1000 * 1000)).toPrecision(2)} MB)
                                    </Text>
                                    <TouchableOpacity onPress={() => setVideo(null)} style={styles.removeFileButton}>
                                        <Ionicons name="close-circle" size={20} color="#FF0050" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Text style={styles.campaignTypeLabel}>Position de la vidéo</Text>
                            <RNPickerSelect
                                onValueChange={setCampaignInVideoPosition}
                                items={[
                                    { label: 'Le créateur décide', value: 'creator-choice' },
                                    { label: 'Début de la vidéo', value: 'Start-video' },
                                    { label: 'Milieu de la vidéo', value: 'mid-video' },
                                    { label: 'Fin de la vidéo', value: 'end-of-video' }
                                ]}
                                value={campaignInVideoPosition}
                                style={pickerSelectStyles}
                            />

                            <View style={styles.checkboxRow}>
                                <CheckBox
                                    text="Le créateur peut parler par-dessus"
                                    value={campaignInVideoCanSpeakOver}
                                    setValue={setCampaignInVideoCanSpeakOver}
                                />
                            </View>

                            {campaignInVideoCanSpeakOver && (
                                <>
                                    <TextInput
                                        placeholder="Entrez ce que le créateur doit dire pendant votre vidéo"
                                        placeholderTextColor="#888"
                                        value={campaignInVideoSpeakOverScript}
                                        onChangeText={setCampaignInVideoSpeakOverScript}
                                        style={[styles.input, styles.textArea]}
                                        multiline
                                    />
                                    <Text style={styles.charCounter}>
                                        {campaignInVideoSpeakOverScript.length < 10 ?
                                            `${10 - campaignInVideoSpeakOverScript.length} caractères manquants` :
                                            `${500 - campaignInVideoSpeakOverScript.length}/500`
                                        }
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* Full Video Campaign */}
                <View style={styles.campaignTypeCard}>
                    <View style={styles.campaignTypeHeader}>
                        <CheckBox
                            text="Vidéo complète"
                            value={campaignFullVideoAdType}
                            setValue={setCampaignFullVideoAdType}
                        />
                        <Ionicons name="play-circle-outline" size={24} color="#00F2EA" />
                    </View>

                    {campaignFullVideoAdType && (
                        <View style={styles.campaignTypeContent}>
                            <HelpBox Message={{ text: "Le créateur produira une vidéo dédiée à votre produit/service", type: "info" }} />

                            <TouchableOpacity onPress={pickDocument} style={styles.fileUploadButton}>
                                <Ionicons name="document-attach-outline" size={24} color="#00F2EA" />
                                <Text style={styles.fileUploadText}>
                                    {campaignFullVideoAdDocuments ?
                                        "Ajouter d'autres documents" :
                                        "Sélectionner des documents de support"
                                    }
                                </Text>
                            </TouchableOpacity>

                            {campaignFullVideoAdDocuments && campaignFullVideoAdDocuments.map((doc, id) => (
                                <View key={id} style={styles.selectedFileContainer}>
                                    <Text style={styles.selectedFileName} numberOfLines={1}>
                                        {doc.name}
                                    </Text>
                                    <Text style={styles.selectedFileSize}>
                                        ({(doc.size / (1000 * 1000)).toPrecision(2)} MB)
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const tmpArr = [...campaignFullVideoAdDocuments];
                                            tmpArr.splice(id, 1);
                                            if (tmpArr.length === 0) {
                                                setCampaignFullVideoAdDocuments(null);
                                            } else {
                                                setCampaignFullVideoAdDocuments(tmpArr);
                                            }
                                        }}
                                        style={styles.removeFileButton}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#FF0050" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <Text style={styles.campaignTypeLabel}>Instructions pour le créateur</Text>
                            <TextInput
                                placeholder="Décrivez comment le créateur doit utiliser vos documents pour réaliser la vidéo"
                                placeholderTextColor="#888"
                                value={campaignFullVideoAdDescription}
                                onChangeText={setCampaignFullVideoAdDescription}
                                style={[styles.input, styles.textArea]}
                                multiline
                            />
                            <Text style={styles.charCounter}>
                                {campaignFullVideoAdDescription.length < 10 ?
                                    `${10 - campaignFullVideoAdDescription.length} caractères manquants` :
                                    `${1500 - campaignFullVideoAdDescription.length}/1500`
                                }
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

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


                <ScrollView style={{
                    flex: 1
                }}>

                    {campaignFormStep == 1 && RenderStep1()}
                    {campaignFormStep == 2 && RenderStep2()}
                    {campaignFormStep == 3 && RenderStep3()}

                </ScrollView>

                <View style={{ flexDirection: "row", justifyContent: "space-between", height: 60 }}>
                    {campaignFormStep > 1 && (
                        <TouchableOpacity onPress={() => setCampaignFormStep(Math.max(campaignFormStep - 1, 1))} style={[styles.Button, { left: 10, position: "absolute" }]}>
                            <Text style={[styles.ButtonText, { paddingHorizontal: 15 }]}>Précédent</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => {
                        setCampaignError(null)
                        if (campaignFormStep == NUM_CAMPAIGN_CREATION_STEPS)
                            handleCreateCampaign()
                        else
                            setCampaignFormStep(Math.min(campaignFormStep + 1, NUM_CAMPAIGN_CREATION_STEPS))
                    }} style={[styles.Button, { right: 10, position: "absolute" }]}>
                        <Text style={[styles.ButtonText, { paddingHorizontal: 15 }]}>{campaignFormStep == NUM_CAMPAIGN_CREATION_STEPS ? (edit ? "Mettre la campagne à jour" : "Créer la campagne") : "Suivant"}</Text>
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

            {showDatePicker && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <DateTimePicker
                            onDateTimeSet={(date) => {
                                if (datePickerFunction === 'startdate') setCampaignStartDate(date);
                                else if (datePickerFunction === 'enddate') setCampaignEndDate(date);
                                setShowDatePicker(false);
                            }}
                            onRevert={() => { setShowDatePicker(false) }}
                        />
                    </View>
                </View>
            )}

            {uploading && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, styles.uploadModal]}>
                        <Text style={styles.uploadTitle}>Téléversement en cours...</Text>
                        {uploadProgress.map((_uploadProgress, i) => (
                            <View key={i} style={styles.uploadProgressContainer}>
                                <Progress.Bar
                                    progress={_uploadProgress.progress}
                                    width={200}
                                    color="#00F2EA"
                                    unfilledColor="#333"
                                    borderWidth={0}
                                    height={8}
                                />
                                <Text style={styles.uploadProgressText}>
                                    {Math.round(_uploadProgress.progress * 100)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        maxHeight: Dimensions.get('window').height - 60,
        backgroundColor: '#121212',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    progressStepContainer: {
        alignItems: 'center',
        zIndex: 2,
    },
    progressStep: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    progressStepActive: {
        backgroundColor: '#FF0050',
    },
    progressStepCompleted: {
        backgroundColor: '#00F2EA',
    },
    progressStepText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressStepTextActive: {
        color: '#FFF',
    },
    progressStepLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
    },
    progressStepLabelActive: {
        color: '#FFF',
    },
    progressLine: {
        position: 'absolute',
        top: 16,
        left: '16%',
        height: 2,
        backgroundColor: '#00F2EA',
        zIndex: 1,
    },
    stepContainer: {
        flex: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF0050',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepTitle: {
        color: '#00F2EA',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#333',
    },
    sectionLabel: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    sublabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2A2A2A',
        color: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#333',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCounter: {
        color: '#666',
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    imageUploadButton: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
    },
    campaignImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#333',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    imagePlaceholderText: {
        color: '#888',
        marginTop: 8,
        fontSize: 12,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    dateButtonEmpty: {
        borderStyle: 'dashed',
        borderColor: '#555',
    },
    dateButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 14,
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        color: '#00F2EA',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    budgetInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    checkboxRow: {
        marginBottom: 8,
    },
    limitedBudgetContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    videoLimitsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    videoLimitsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    videoLimitInput: {
        width: '48%',
    },
    videoLimitLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 4,
    },
    creatorsSelectionContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    creatorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 12,
        borderRadius: 8,
        margin: 4,
        minWidth: 200,
    },
    creatorCardSelected: {
        backgroundColor: '#00F2EA20',
        borderColor: '#00F2EA',
        borderWidth: 1,
    },
    creatorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    creatorInfo: {
        flex: 1,
    },
    creatorName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    creatorUsername: {
        color: '#888',
        fontSize: 12,
    },
    selectedCreatorsContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#00F2EA10',
        borderRadius: 6,
    },
    selectedCreatorsLabel: {
        color: '#00F2EA',
        fontSize: 12,
        textAlign: 'center',
    },
    campaignTypeCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#333',
    },
    campaignTypeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    campaignTypeContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    campaignTypeLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    fileUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        borderStyle: 'dashed',
    },
    fileUploadText: {
        color: '#FFF',
        marginLeft: 8,
        fontSize: 14,
    },
    selectedFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    selectedFileName: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
    },
    selectedFileSize: {
        color: '#888',
        fontSize: 12,
        marginHorizontal: 8,
    },
    removeFileButton: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
    },
    spacer: {
        height: 20,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#121212',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
    },
    prevButton: {
        backgroundColor: '#333',
    },
    nextButton: {
        backgroundColor: '#FF0050',
        marginLeft: 'auto',
    },
    navButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 4,
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
    errorBox: {
        marginBottom: 16,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 300,
    },
    uploadModal: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    uploadTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    uploadProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    uploadProgressText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 12,
        minWidth: 40,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        backgroundColor: '#2A2A2A',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 14,
    },
    inputAndroid: {
        backgroundColor: '#2A2A2A',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 14,
    },
});

export default CreateCampaign;