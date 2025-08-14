import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const CheckBox = ({ text, value, setValue, style }) => {

    return (
        <TouchableOpacity style={[styles.checkBoxContainer, style]} onPress={() => setValue(!value)}>
            <View style={[styles.checkBox, { backgroundColor: value ? '#FF0050' : '#FF005000' }]} />
            <Text style={styles.checkBoxText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({

    checkBoxContainer: {
        flexDirection: 'row',
        padding: 5
    },
    checkBox: {
        width: 18,
        aspectRatio: 1,
        borderColor: '#FF0050',
        borderWidth: 3,
        borderRadius: 5,
        marginHorizontal: 5
    },
    checkBoxText: {
        color: "#fff"
    },
});

export default CheckBox;