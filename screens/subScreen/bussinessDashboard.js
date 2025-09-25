import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import CampaignCard from '../../components/CampaignCard';
import { SubScreenStyles } from './SubScreenStyles';
import HeaderSelector from '../../components/headerSelector';

// Mock data for development
const mockCampaigns = [
    {
        id: '1',
        title: 'Summer Drink Campaign',
        reward: 15000,
        type: 'caption',
        views: 125000,
        status: 'review'
    },
    {
        id: '2',
        title: 'Tech Product Launch',
        reward: 25000,
        type: 'product-video',
        views: 85000,
        status: 'active'
    },
    {
        id: '3',
        title: 'Tech Product Launch',
        reward: 25000,
        type: 'product-video',
        views: 85000,
        status: 'draft'
    },
    {
        id: '4',
        title: 'Tech Product Launch',
        reward: 25000,
        type: 'product-video',
        views: 85000,
        status: 'rejected',
        reason: 'incomplete'
    },
    {
        id: '5',
        title: 'Summer Drink Campaign',
        reward: 15000,
        type: 'caption',
        views: 125000,
        status: 'active'
    }
];

const headerList = [
    {
        id: 2,
        name: 'Active Campaigns'
    },
    {
        id: 1,
        name: 'inactive campaigns'
    },
    {
        id: 3,
        name: 'Stats'
    },
]

const BussinessDashboard = ({ route, navigation }) => {
    const { user, allCampaigns, loadCampaigns, tabSelection, setTabSelection } = useAuth();
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        // Replace with API call to fetch campaigns
        setCampaigns(allCampaigns ? allCampaigns.docs.filter(d => !d.deleted && d.campaignOwner === user.email) : []);
        //console.log(user)
    }, [allCampaigns]);

    const handleCampaignPress = (campaign) => {
        navigation.navigate('CampaignHub', {
            campaignId: campaign.id,
            mode: campaign.status === 'available' ? 'apply' : 'view'
        });
    };

    return (
        <View style={styles.container}>

            {user && user.userType === 'business' && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>Total Views: 0</Text>
                    <Text style={styles.statsText}>Active Campaigns: 0</Text>
                </View>
            )}

            <HeaderSelector selectingList={headerList} selectedOption={tabSelection} onSelect={(_option) => { setTabSelection(_option.id) }} />

            {
                tabSelection == 1 && (
                    <FlatList
                        data={campaigns.filter((_c) => { return _c.status !== 'active' })}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View>
                                <CampaignCard
                                    campaignID={item.id}
                                    userType={user?.userType}
                                    navigation={navigation}
                                />
                            </View>
                        )}
                        ListEmptyComponent={(
                            <Text style={{
                                fontSize: 14,
                                padding: 3,
                                paddingHorizontal: 6,
                                borderRadius: 15,
                                color: "#aaa",
                                textAlign: 'center'
                            }}> - Aucune Campagn - </Text>
                        )}

                    />
                )
            }

            {
                tabSelection == 2 && (
                    <FlatList
                        data={campaigns.filter((_c) => { return _c.status === 'active' })}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View>
                                <CampaignCard
                                    campaignID={item.id}
                                    userType={user?.userType}
                                    navigation={navigation}
                                />
                            </View>
                        )}
                        ListEmptyComponent={(
                            <Text style={{
                                fontSize: 14,
                                padding: 3,
                                paddingHorizontal: 6,
                                borderRadius: 15,
                                color: "#aaa",
                                textAlign: 'center'
                            }}> - Aucune Campagn - </Text>
                        )}

                    />
                )
            }



            {user && user.userType === 'business' && (
                <TouchableOpacity
                    title=""
                    onPress={() => navigation.navigate('CampaignHub', { mode: 'create' })}
                    style={styles.Button}

                >
                    <Text
                        style={styles.ButtonText}
                    >Create New Campaign</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = SubScreenStyles

export default BussinessDashboard;