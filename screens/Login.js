// screens/auth/Login.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const Login = ({ navigation }) => {
  const [userType, setUserType] = useState('creator');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const credentials = {
        email,
        password,
      };
      
      await login(credentials, true);
      // Navigation handled automatically by auth context
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    setIsValidEmail((validateEmail(email) != null && email.split('.')[ email.split('.').length-1].length < 4))
  },[email])
  
  useEffect(()=>{
    setIsValidPassword(password.length > 8)
  },[password])


  return (
    <KeyboardAvoidingView 
      behavior="height"
     style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input,{borderColor: isValidEmail? "#333" : "#933"}]}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={[styles.input,{borderColor: isValidPassword? "#333" : "#933"}]}
        secureTextEntry
      />
      
      <Button 
        title={isLoading ? "Signing In..." : "Login"} 
        onPress={handleLogin}
        disabled={isLoading}
        color="#FF0050"
      />
      
      <TouchableOpacity 
        style={styles.switchAuth}
        onPress={() => navigation.navigate('RoleGateway')}
      >
        <Text style={styles.switchText}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
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

export default Login;