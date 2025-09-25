import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CreatorHome from './CreatorHome';
import BusinessHome from './BusinessHome';
import * as Notifications from 'expo-notifications';
import { messaging, getToken, onMessage } from '../firebase';

//const localStorage = null /// EXPO TESTS

const Home = ({ route, navigation }) => {
  const { user, logout, allCampaigns, allUsers, updateUserInfo, sendNotification, AddToasts, subscribeNotification } = useAuth();

  // Add to header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  useEffect(() => {
    if (user && messaging) {

      const PermissionRoutine = async () => {
        const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          if (canAskAgain) {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          } else return
        }
        if (finalStatus !== 'granted') {
          alert('Permission refusé!');
          return;
        }

        try {
          const currentToken = await getToken(messaging, {
            vapidKey: "BNVpHSvKggformVZ2o6Ga5dwzEsPkMJLdbvR4SdyL61WKYlH25r6sodn7QCJ45YOt4Ks3EasVtecEIOH6BOqZ3s", // from Firebase console
          });
          if (currentToken) {
            console.log("FCM token:", currentToken);
            const oldToken = user.notificationToken
            const r = await updateUserInfo({ notificationToken: currentToken })
            const subscribeResponse = await subscribeNotification([currentToken], user.userType)
            if (r.notificationToken !== oldToken) {
              window.localStorage?.setItem("tokenDate", Date.now().toString()); // persist for future 
              console.log('token enregistré!!!')
            }
            // send this token to your server to send push later
          }
        } catch (err) {
          console.error("Error getting token:", err);
        }

      }


      const requestPermission = async () => {
        const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
        if ((canAskAgain && existingStatus !== "granted")) {
          alert('Active les notifications pour pleinement utiliser Kolabo')
          await PermissionRoutine()
        } else if (existingStatus === "granted" && parseInt(window.localStorage?.getItem("tokenDate") || 0) < Date.now() - (1000 * 60 * 60 * 24)) {
          await PermissionRoutine()
        }
      }

      requestPermission()

    }
  }, [user, messaging]);

  const handleNotification = (payload) => {
    // Show your custom toast/snackbar instead of system notification
    //alert(`📩 ${payload.notification.title}\n${payload.notification.body}`);
    AddToasts(payload.notification.title, payload.notification.body, () => { }, [
      {
        label: "View", onPress: () => {
          console.log("View clicked")
          if (payload.data?.path)
            navigation.navigate(payload.data?.path, payload.data?.params || undefined)
        }
      },
      { label: "Dismiss", onPress: () => console.log("Dismiss clicked") },
    ], image = null, duration = 7000)
  }

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker?.addEventListener("message", (event) => {
        if (event.data?.type === "PUSH_MESSAGE") {
          const payload = event.data.payload;
          console.log("Push forwarded from SW:", payload);
          handleNotification(payload)
        }
      });
    }

    onMessage(messaging, (payload) => {
      console.log("Push forwarded from SW:", payload);
      handleNotification(payload)
    })
  }, []);


  return (
    <View style={styles.container}>

      <TouchableOpacity style={{ marginVertical: 10, padding: 10, borderRadius: 10, backgroundColor: "#ff2222", opacity: user.notificationToken ? 1 : 0.3 }}
        onPress={async () => {
          if (user.notificationToken) {
            const resp = await sendNotification(allUsers.docs.filter(u => u.notificationToken).map(u => u.notificationToken), null, "Ouvrir la page notif", 'This is a test notification so chill out nigga', { path: 'NotificationCenter' })
            console.log('NOTIFICATION ', resp)
          } else alert('Le message n\'a pas pu être envoyé')
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}> Send Notification</Text>
      </TouchableOpacity>
      {user && user.userType === 'creator'
        ? <CreatorHome navigation={navigation} />
        : <BusinessHome navigation={navigation} />
      }

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#121212',
    paddingTop: 0
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
  logoutButton: {
    marginRight: 15
  },
  logoutText: {
    color: '#FF0050',
    fontWeight: '500'
  }
});

export default Home;