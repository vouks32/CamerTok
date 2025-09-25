import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, KeyboardAvoidingView, Image, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useAuth, TiktokUsernameSearch } from '../context/AuthContext';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};



const RoleGateway = ({ navigation }) => {
  const [userType, setUserType] = useState('creator');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [timeOutId, setTimeOutId] = useState(null);
  const [isLoadingTiktok, setIsLoadingTiktok] = useState(false);
  const [tiktokUser, setTiktokUser] = useState(null);
  const emailRef = useRef(null);

  const { login, reloadUser, baseUrl } = useAuth();
  const REDIRECT_URI = baseUrl + '/api/auth?email=' //J'utilise vercel pour valider tiktok parceque AWS n'offre pas de https

  const handleSubmit = async () => {

    if (email.length == 0 || phone.length == 0 || password.length == 0 || (userType === "business" && companyName.length == 0)) {
      Alert.alert("Please, enter all necessary informations")
      return
    }
    /*if (userType === "creator" && !tiktokUser.isSelected) {
      Alert.alert("Aucun Compte choisis", "Veillez cliquer sur le compte tiktok qui apparait")
      return
    }*/
    if ((validateEmail(email) == null || email.split('.')[email.split('.').length - 1].length >= 4)) {
      Alert.alert("Adresse Mail Incorrect", "Entrez une adresse mail correcte")
      return
    }

    if (password.length < 8) {
      Alert.alert("mot de passe non sécurisé", "Entrez un mot de passe d'au moin 8 caractères")
      return
    }

    try {
      const credentials = {
        userType,
        email,
        phone,
        password,
        username,
        tiktokUser: null,
        companyName,
        bank: {
          solde: 0,
          transactions: []
        }
      };
      await login(credentials);
      if(userType === "creator")
      await Linking.openURL(REDIRECT_URI + email);
    } catch (error) {
      alert('Authentication failed: ' + error.message);
    }
  };


  const handleDeepLink = async (event) => {
    // Parse redirect URL
    // with the setInterval this is not needed
    const url = Linking.parse(event.url);
    if (url.path === 'TiktokLogin') {
      //await reloadUser()
    }
  };

  useEffect(() => {
    // Add deep link listener
    const sub = Linking?.addEventListener('url', handleDeepLink);
    // Clean up listener
    return () => sub.remove()
  }, []);


  const TiktokUsernameFetch = async (text) => {
    setUsername(text)
    setIsLoadingTiktok(true)

    if (timeOutId !== null)
      clearTimeout(timeOutId)

    setTimeOutId(setTimeout(async () => {
      const userData = await TiktokUsernameSearch(text)
      setTiktokUser(userData)
      setIsLoadingTiktok(false)
    }, 1000))
  }

  return (
    <KeyboardAvoidingView
      behavior="height"
      style={[styles.container]}
    >
      <View>
        <Text style={styles.title}>TikTok Campaign Platform</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, userType === 'creator' && styles.activeButton]}
            onPress={() => setUserType('creator')}
          >
            <Text style={[styles.toggleText, userType === 'creator' && styles.activeText]}>
              Creator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, userType === 'business' && styles.activeButton]}
            onPress={() => setUserType('business')}
          >
            <Text style={[styles.toggleText, userType === 'business' && styles.activeText]}>
              Business
            </Text>
          </TouchableOpacity>
        </View>


        {userType === 'creatorxxx' && (
          <TextInput
            placeholder="@tiktok_username"
            value={username}
            onChangeText={TiktokUsernameFetch}
            style={[styles.input, { backgroundColor: tiktokUser?.isSelected ? '#333' : '#222' }]}
          />
        )}

        {userType === 'business' && (
          <TextInput
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            style={styles.input}
          />
        )}

        {userType === 'creator' && tiktokUser && tiktokUser.result && !tiktokUser.isSelected && !isLoadingTiktok && (
          <TouchableOpacity
            onPress={() => {
              setUsername(tiktokUser.result.user.username)
              setTiktokUser({ ...tiktokUser, isSelected: true })
              emailRef.current?.focus();
            }}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, padding: 10, borderRadius: 10, backgroundColor: "#EEE" }}>
            <Image src={tiktokUser.result?.user.avatarThumb} style={{ width: 50, aspectRatio: 1, borderRadius: 50, marginHorizontal: 10 }} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{tiktokUser.result?.user.nickname}</Text>
              <Text style={{ fontSize: 11 }}> {tiktokUser.result?.user.username}</Text>
            </View>
          </TouchableOpacity>
        )}

        {isLoadingTiktok && (
          <ActivityIndicator size="small" />
        )}

        <TextInput
          ref={emailRef}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text.toLocaleLowerCase())}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <Button
          title={userType === 'creator' ? "Create Creator Account" : "Create Business Account"}
          onPress={() => handleSubmit()}
          color="#FF0050"
        />

        <TouchableOpacity
          style={styles.switchAuth}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.switchText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#121212'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#222'
  },
  activeButton: {
    backgroundColor: '#FF0050'
  },
  toggleText: {
    color: '#aaa',
    fontWeight: '500'
  },
  activeText: {
    color: 'white'
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#222',
    color: 'white'
  },
  switchAuth: {
    marginTop: 20,
    alignSelf: 'center'
  },
  switchText: {
    color: '#00F2EA'
  }
});

export default RoleGateway;