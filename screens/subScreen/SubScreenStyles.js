import { StyleSheet } from "react-native";

export const SubScreenStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statsText: {
    color: '#aaa',
    fontSize: 16
  },
  sectionTitle: {
    color: '#FF0050',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  Button: {
    backgroundColor: '#FF0050',
    marginVertical: 10,
    marginHorizontal : 30,
    padding : 10,
    borderRadius : 10
  },
  ButtonText: {
    color: '#fff',
    textAlign : "center",
    fontSize : 18,
    fontWeight : "bold"
  },
  logoutButton: {
    marginRight: 15
  },
  logoutText: {
    color: '#FF0050',
    fontWeight: '500'
  }
});
