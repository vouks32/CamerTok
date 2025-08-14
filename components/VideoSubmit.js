import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const VideoSubmit = ({ campaignId }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!videoUrl.includes('tiktok.com')) {
      Alert.alert('Invalid URL', 'Please enter a valid TikTok video URL');
      return;
    }

    setIsSubmitting(true);
    
    // API call to submit video
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Submitted!', 
        'Your video has been submitted for review. You will be notified when approved.'
      );
    }, 1500);
  };

  return (
    <View>
      <Text style={styles.title}>Submit Your TikTok Video</Text>
      <Text style={styles.note}>
        Minimum 5,000 views required for monetization
      </Text>
      
      <TextInput
        placeholder="Paste TikTok Video URL"
        value={videoUrl}
        onChangeText={setVideoUrl}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="url"
      />
      
      <Button
        title={isSubmitting ? "Submitting..." : "Submit Video"}
        onPress={handleSubmit}
        disabled={isSubmitting}
        color="#FF0050"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  note: {
    color: '#FFC107',
    marginBottom: 15
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20
  }
});

export default VideoSubmit;