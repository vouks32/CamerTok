import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';

const DateTimePicker = ({ startDate = new Date(), onDateTimeSet, onRevert }) => {

    const [month, setMonth] = useState(startDate.getMonth())
    const [day, setDay] = useState(startDate.getDate())
    const [year, setYear] = useState(startDate.getFullYear())

    return (
        <View onPress={() => { }}>

            <View
                style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", marginHorizontal: 25, marginBottom: 10 }}
            >
                <TouchableOpacity onPress={() => setYear(year - 1)} style={{ padding: 5 }}><Text style={{ color: "#fff" }}>{"<<"}</Text></TouchableOpacity>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, marginHorizontal: 15 }}> {(new Date(year, month, day)).toString("fr-FR").split(' ')[3]} </Text>
                <TouchableOpacity onPress={() => setYear(year + 1)} style={{ padding: 5 }}><Text style={{ color: "#fff" }}>{">>"}</Text></TouchableOpacity>

            </View>

            <View
                style={{ flexDirection: 'row', justifyContent: "space-around", alignItems: "center", marginHorizontal: 25, marginBottom: 15 }}
            >
                <Ionicons onPress={() => {
                    if (month == 0)
                        setYear(year - 1)
                    setMonth((month + 11) % 12)
                }} name='arrow-back-circle' color={"#fff"} size={35} />
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}> {(new Date(year, month, day)).toString("fr-FR").split(' ')[1]} </Text>
                <Ionicons onPress={() => {
                    if (month == 11)
                        setYear(year + 1)
                    setMonth((month + 1) % 12)
                }} name='arrow-forward-circle' color={"#fff"} size={35} />
            </View>
            <FlatList
                data={[
                    ...Array.from({ length: 7 }).map((_, i) => ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", 'Sun'][i]),
                    ...Array.from({ length: (((new Date(year, month, day)).getDay() + 7) - (day % 7)) % 7 }).map((_, i) => " "),
                    ...Array.from({ length: (month == 3 || month == 5 || month == 8 || month == 10) ? 30 : (month != 1) ? 31 : (year % 4 == 0) ? 29 : 28 }).map((_, i) => i + 1)
                ]}
                keyExtractor={item => item}
                numColumns={7}
                renderItem={({ item }) => {
                    const selectedCCIndex = item == day ;
                    return (
                        <TouchableOpacity
                            key={item}
                            onPress={() => {
                                if (item.length > 2 || item === " ") return

                                setDay(item )
                            }}
                            style={{ width: ((100 / 8) - 2) + '%', flexDirection: "row", justifyContent: "center", margin: 5, paddingVertical: 10, borderRadius: 10, backgroundColor: (item.length > 2 || item === " ") ? "#333" : (selectedCCIndex ? "#00F2EA" : "#EEE") }}>

                            <Text style={{ fontSize: 12, fontWeight: "bold", textAlign: "center", color: (item.length > 2) ? "#fff" : "#000" }}>{item}</Text>

                        </TouchableOpacity>
                    )
                }}

            />

            <View
                style={{ flexDirection: "row", padding: 20, margin: 10 }}
            >
                <TouchableOpacity onPress={() => { onRevert() }} style={[styles.Button, { left: 10, position: "absolute" }]}>
                    <Text style={[styles.ButtonText, { paddingHorizontal: 15 }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { onDateTimeSet({day, month, year, timeStamp : (new Date(year, month, day)).getTime()}) }} style={[styles.Button, { right: 10, position: "absolute" }]}>
                    <Text style={[styles.ButtonText, { paddingHorizontal: 15 }]}>Valider</Text>
                </TouchableOpacity>
            </View>
        </View>
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
});

export default DateTimePicker;