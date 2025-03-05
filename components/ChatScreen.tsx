import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchMessages, sendMessage } from '../services/chatService';
import { supabase } from '../lib/supabase';

// References
// Coding Garden (2025). Building a Simple Real-Time Chat App with Supabase [YouTube Video]. Retrieved from https://www.youtube.com/watch?v=C29kMuMTmKQ
// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge 

// Props type using navigation params
type ChatScreenProps = StackScreenProps<RootStackParamList, 'ChatScreen'>;

// Message type
type Message = {
  id: string;
  sender_golfer_id?: string;
  sender_pga_id?: string;
  receiver_golfer_id?: string;
  receiver_pga_id?: string;
  message_text: string;
  created_at: string;
};

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { senderId, senderType, receiverId, receiverType } = route.params;
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(receiverId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [golfers, setGolfers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  console.log(" Route Params:", route.params);

  useEffect(() => {
    console.log(" useEffect started");
  
    const initChat = async () => {
      console.log(" Starting initialization with senderType:", senderType);
  
      if (senderType === 'golfer' && !selectedReceiverId) {
        console.log(" Golfer detected, fetching PGA Pro...");
        await fetchAssignedPGAPro();
      } else if (senderType === 'pga' && !selectedReceiverId) {
        console.log(" PGA detected, fetching golfers...");
        await fetchGolfers();
      } else if (selectedReceiverId) {
        console.log(" Receiver ID available, loading messages...");
        await loadMessages();
      }
  
      console.log(" Initialization complete");
      setLoading(false);
    };
  
    initChat();

    const unsubscribe = subscribeToMessages();

    return () => {
      unsubscribe();
    };
  
    
  }, [senderType, selectedReceiverId]);
  
  

  const fetchAssignedPGAPro = async () => {
    setLoading(true);
    console.log(" Fetching PGA Pro for GolferID:", senderId);
    
    const { data, error } = await supabase
      .from('golfers1')
      .select('PGAID')
      .eq('GolferID', senderId)
      .single();
  
    if (error) {
      console.error(" Fetching PGA Pro Error:", error);
      Alert.alert('Error', 'Unable to load PGA Professional.');
      setLoading(false);
      return;
    }
  
    if (!data) {
      console.warn(" No PGA Pro assigned for this Golfer.");
      Alert.alert('Warning', 'No PGA Professional assigned.');
      setLoading(false);
      return;
    }
  
    console.log(" PGA Pro ID found:", data.PGAID);
    setSelectedReceiverId(data.PGAID);
  };
  

  const fetchGolfers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('golfers1')
      .select('GolferID, name')
      .eq('PGAID', senderId);

    if (error) {
      console.error("❌ Error fetching golfers:", error);
      Alert.alert('Error', 'Unable to load golfers.');
      setLoading(false);
      return;
    }

    console.log(" Golfers fetched:", data);
    setGolfers(data);
    setLoading(false);
  };

  const loadMessages = async () => {
    const data = await fetchMessages(senderId, senderType, selectedReceiverId!, receiverType);
    console.log(" Messages loaded:", data);
    setMessages(data);
    setLoading(false);
  };

  const subscribeToMessages = () => {
    console.log(" Subscribing to real-time messages...");
    const subscription = supabase
      .channel('realtime_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log(" New message:", payload.new);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      console.log(" Unsubscribing from real-time messages...");
      supabase.removeChannel(subscription);
    };
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    console.log("🚀 Sending message:", messageText);
    await sendMessage(senderId, senderType, selectedReceiverId!, receiverType, messageText);
    setMessageText('');
  };

  if (loading) {
    console.log(" Loading indicator active...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!selectedReceiverId && senderType === 'pga') {
    return (
      <View style={styles.selectionContainer}>
        <Text style={styles.selectTitle}>Select a Golfer to Chat:</Text>
        <FlatList
          data={golfers}
          keyExtractor={(item) => item.GolferID}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.golferButton}
              onPress={() => {
                console.log(" Selected golfer:", item.GolferID);
                setSelectedReceiverId(item.GolferID);
              }}
            >
              <Text style={styles.golferButtonText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSentByMe =
            (senderType === "golfer" && item.sender_golfer_id === senderId) ||
            (senderType === "pga" && item.sender_pga_id === senderId);
  
          return (
            <View
              style={[
                styles.messageBubble,
                isSentByMe ? styles.sentMessage : styles.receivedMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.message_text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          value={messageText}
          onChangeText={setMessageText}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#F0F4F8' },
  messageBubble: { padding: 10, borderRadius: 10, marginBottom: 5, maxWidth: '80%' },
  sentMessage: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#ddd' },
  messageText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', marginTop: 10 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5 },
  selectionContainer: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
  selectTitle: { fontSize: 18, marginBottom: 10, fontWeight: '600', color: '#333' },
  golferButton: { padding: 12, width: '100%', backgroundColor: '#4CAF50', borderRadius: 8, marginVertical: 5 },
  golferButtonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
