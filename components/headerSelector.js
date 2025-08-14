import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';

const HeaderSelector = ({ selectingList, selectedOption, onSelect }) => {

    return (
        <View style={styles.container}>
            {
                selectingList.map((_option, index) => {
                    return (
                        <TouchableOpacity key={index} onPress={() => onSelect(_option)}
                            style={[styles.option, { backgroundColor: _option.id == selectedOption ? '#FF0050' : '#FF005000', }]}
                        >
                            <Text
                                style={styles.text}>{_option.name}</Text>
                        </TouchableOpacity>
                    )
                })
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#222",
        borderRadius: 10,
        marginBottom: 15
    },
    option: {
        padding: 10,
        justifyContent: "center",
        width: '33%',
        borderColor: '#FF0050',
        borderRadius: 5
    },
    text: {
        color: "#fff",
        textAlign: "center"
    }
})

export default HeaderSelector;