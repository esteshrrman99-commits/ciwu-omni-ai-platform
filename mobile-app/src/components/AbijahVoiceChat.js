import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Mic, Volume2, StopCircle } from 'lucide-react-native';
import axios from 'axios';

export default function AbijahVoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello, darling! I'm Abijah. How can I help you today?", sender: 'abijah' }
  ]);
  const [inputText, setInputText] = useState("");

  // Abijah speaks automatically when messages arrive
  const speak = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.1, // Slightly higher, warmer tone
      rate: 0.9,  // Slightly slower, more natural
      gender: 'female',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false)
    });
    setIsSpeaking(true);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    try {
      // Call the AI Brain
      // Note: In a real app, this would call your backend API with the Abijah prompt
      const response = await axios.post('https://ciwu-omni-ai-platform.onrender.com/api/chat', {
        message: inputText
      });
      
      // Abijah's response
      const abijahReply = response.data.response || "I'm listening, honey. Tell me more.";
      
      setMessages(prev => [...prev, { text: abijahReply, sender: 'abijah' }]);
      
      // Read it aloud
      speak(abijahReply);
      
    } catch (error) {
      const fallback = "I had trouble connecting, sweetie. Let's try that again in a moment.";
      setMessages(prev => [...prev, { text: fallback, sender: 'abijah' }]);
      speak(fallback);
    }
  };

  const toggleReading = (text) => {
    speak(text);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✨ Abijah</Text>
        <Text style={styles.subtitle}>Your Personal Health Companion</Text>
      </View>

      {/* Messages Area */}
      <View style={styles.chatArea}>
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.abijahBubble]}>
            <Text style={styles.messageText}>{msg.text}</Text>
            {msg.sender === 'abijah' && (
              <TouchableOpacity onPress={() => toggleReading(msg.text)} style={styles.readBtn}>
                <Volume2 size={16} color="#6d4aff" />
                <Text style={styles.readText}>Read Aloud</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ask Abijah anything..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.micBtn, isListening && styles.micActive]} 
          onPress={() => setIsListening(!isListening)}>
          {isListening ? <StopCircle size={24} color="white" /> : <Mic size={24} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, backgroundColor: '#6d4aff', alignItems: 'center' },
  title: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#e0d4ff', fontSize: 14 },
  chatArea: { flex: 1, padding: 15 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10, position: 'relative' },
  userBubble: { backgroundColor: '#6d4aff', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  abijahBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderLeftWidth: 3, borderLeftColor: '#6d4aff' },
  messageText: { fontSize: 16, color: '#333' },
  readBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 5 },
  readText: { fontSize: 12, color: '#6d4aff', marginLeft: 4 },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, marginRight: 10, height: 45 },
  sendBtn: { justifyContent: 'center', alignItems: 'center', width: 45, backgroundColor: '#6d4aff', borderRadius: 25 },
  sendIcon: { color: 'white', fontSize: 20 },
  micBtn: { justifyContent: 'center', alignItems: 'center', width: 45, height: 45, borderRadius: 22.5, marginLeft: 5, backgroundColor: '#6d4aff' },
  micActive: { backgroundColor: '#ff4444' }
});
