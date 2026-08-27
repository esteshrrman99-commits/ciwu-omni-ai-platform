import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import AbijahVoiceChat from './src/components/AbijahVoiceChat';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <AbijahVoiceChat />
      <View style={styles.footer}>
        <Text style={styles.footerText}>CIWU OMNI v6.0 | Powered by Quantum AI</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  footer: { padding: 15, backgroundColor: '#6d4aff', alignItems: 'center' },
  footerText: { color: 'white', fontSize: 12 }
});
