import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';

const API_URL = 'https://ciwu-omni-ai-platform.onrender.com';

export default function App() {
  const [tab, setTab] = useState('home');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [user, setUser] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  const login = async () => {
    // Mock login for demo
    setUser({ name: 'Dr. Estes' });
    Alert.alert('Success', 'Logged in securely');
  };

  const sendMessage = async () => {
    if (!message) return;
    setResponse('Processing...');
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { message });
      setResponse(res.data.response);
    } catch (err) {
      setResponse('Error: ' + err.message);
    }
  };

  const takePhoto = async () => {
    if (!permission) return;
    if (!permission.granted) {
      await requestPermission();
    }
    // In a real app, capture and upload photo here
    Alert.alert('Demo', 'Photo captured! Uploading to AI for analysis...');
  };

  if (tab === 'home') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>CIWU OMNI v5.0 Mobile</Text>
        {!user ? (
          <Button title="Login Securely" onPress={login} />
        ) : (
          <View>
            <Text>Welcome, {user.name}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ask about diabetes, longevity..." 
              value={message} 
              onChangeText={setMessage} 
            />
            <Button title="Send" onPress={sendMessage} />
            <ScrollView style={{ height: 200, marginTop: 20 }}>
              <Text>{response}</Text>
            </ScrollView>
            <Button title="Take Photo for Analysis" onPress={takePhoto} />
          </View>
        )}
        <View style={styles.nav}>
          <Button title="Home" onPress={() => setTab('home')} />
          <Button title="Quantum" onPress={() => setTab('quantum')} />
          <Button title="Profile" onPress={() => setTab('profile')} />
        </View>
      </View>
    );
  }

  if (tab === 'quantum') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quantum Dashboard</Text>
        <Button title="Generate 100x Surprise" onPress={() => Alert.alert('Demo', 'Fetching quantum protocol...')} />
        <Button title="View Breakthroughs" onPress={() => Alert.alert('Demo', 'Loading Nature/Cell/Science...')} />
      </View>
    );
  }

  return <View style={styles.container}><Text>Profile Screen</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00d2ff', marginBottom: 20 },
  input: { width: '90%', height: 40, borderColor: '#6d4aff', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, color: '#fff' },
  nav: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 }
});
