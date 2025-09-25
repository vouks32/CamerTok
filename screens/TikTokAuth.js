import React, { useCallback, useEffect, useState } from 'react';
import { View, Button, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Linking from 'expo-linking';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';


export default function TikTokAuth({ navigation }) {
  const { user, reloadUser, baseUrl } = useAuth()
  const [showText, setShowText] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const REDIRECT_URI = baseUrl + '/api/auth?email=' //J'utilise vercel pour valider tiktok parceque AWS n'offre pas de https
  const promptAsync = async () => {
    await Linking.openURL(REDIRECT_URI + user.email);
  }
  let routName = useNavigationState(state => {
    return state.routes[state.index].name
  })

  useEffect(
    () => {
      if (user && user.userType !== "creator") {
        navigation.navigate('Home')
        return
      }

      let timer = null

      const check = async (first = false) => {
        console.log('checking Tiktok')
        let _user = first ? user : (await reloadUser())
        if (_user?.tiktokToken) {
          if (_user?.tiktokToken.date + _user?.tiktokToken.expires_in < (Date.now() / 1000)) {
            try {
              const resp = await fetch('https://campay-api.vercel.app/api/refresh_token?email=' + _user.email + '&refresh_token=' + _user?.tiktokToken.refresh_token)
            } catch (error) {
              console.log('error reloading token')
            }
          }

          setTimeout(() => navigation.navigate('Home'), 500)
          if (timer) clearInterval(timer)
        } else if (first) {
          setShowText(true)
        }
      }

      timer = setInterval(check, 3000)

      check(true)
    }, [])


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={"large"} />

      {
        showText && (
          <>
            <Text style={{ color: "black", marginVertical: 10, fontSize: 18, fontWeight: "bold" }}>Connectez votre compte tiktok</Text>
            <Text style={{ color: "black", marginVertical: 10 }}>Veillez patienter quelques secondes, si votre compte tiktok n'est pas automatiquement lié, cliquez sur le bouton si dessous</Text>

            <TouchableOpacity disabled={!showButton} onPress={async () => {
              setShowButton(false)
              await promptAsync()
            }} style={{ padding: 20, backgroundColor: "#ff2020", borderRadius: 10, margin: 10 }}>
              {
                showButton ? (
                  <Text style={{ color: "white" }}>Connectez votre compte tiktok</Text>
                ) : (
                  <ActivityIndicator size={"small"} />
                )
              }
            </TouchableOpacity>

          </>
        )
      }
    </View>
  );
}