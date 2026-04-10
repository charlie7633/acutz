import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { ID, Query } from 'react-native-appwrite';
import { databases, storage, appwriteConfig, client } from '../config/appwriteConfig';
import { AuthContext } from '../context/AuthContext';
import { HairTypeItem } from '../components/HairTypeItem';

export const ProfessionalHomeScreen = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [hairTypes, setHairTypes] = useState([]);
  const [newHairType, setNewHairType] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHairTypes();

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collectionId}.documents`,
      (response) => {
        if (
          response.events.includes('databases.*.collections.*.documents.*.create') ||
          response.events.includes('databases.*.collections.*.documents.*.delete')
        ) {
          fetchHairTypes();
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchHairTypes = async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId
      );
      const types = response.documents.map(doc => ({ id: doc.$id, ...doc }));
      setHairTypes(types);
    } catch (error) {
      console.log('Fetch error:', error);
    }
  };

  const addHairType = async () => {
    if (!newHairType.trim()) return;
    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        ID.unique(),
        {
          name: newHairType,
          createdAt: new Date().toISOString(),
          userId: user.uid
        }
      );
      setNewHairType('');
    } catch (error) {
      Alert.alert("Error adding hair type", error.message);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.uri);
      uploadImage(asset);
    }
  };

  const uploadImage = async (asset) => {
    setUploading(true);
    try {
      const file = {
        uri: asset.uri,
        name: asset.fileName || asset.uri.substring(asset.uri.lastIndexOf('/') + 1),
        type: asset.mimeType || 'image/jpeg',
        size: asset.fileSize || 0,
      };

      const response = await storage.createFile(appwriteConfig.storageId, ID.unique(), file);
      Alert.alert("Success", "Photo uploaded!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            style={[styles.signOutButton, { borderColor: theme.colors.primary }]} 
            onPress={() => navigation.navigate('ProfessionalSetup')}
          >
            <Text style={[styles.signOutButtonText, { color: theme.colors.primary }]}>Setup Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={logout}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Hair Types</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Add Hair Type (e.g. 4C)"
              placeholderTextColor={theme.colors.textMuted}
              value={newHairType}
              onChangeText={setNewHairType}
              style={[styles.input, { flex: 1, marginRight: 10 }]}
            />
            <TouchableOpacity style={styles.addButton} onPress={addHairType}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {hairTypes.map((type) => (
            <HairTypeItem key={type.id} name={type.name} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Professional Portfolio</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.uploadButtonText}>Pick & Upload Image</Text>
          </TouchableOpacity>

          {uploading && <ActivityIndicator style={{ marginTop: 15 }} color={theme.colors.primary} size="large" />}
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
  signOutButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: theme.borderRadius.m, borderWidth: 1, borderColor: theme.colors.error },
  signOutButtonText: { color: theme.colors.error, fontWeight: 'bold' },
  content: { flex: 1 },
  section: { marginBottom: 40 },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.secondary, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  input: { backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 16, height: 50, borderRadius: theme.borderRadius.m, paddingHorizontal: 15, borderWidth: 1, borderColor: theme.colors.border },
  addButton: { backgroundColor: theme.colors.primary, paddingVertical: 15, paddingHorizontal: 20, height: 50, borderRadius: theme.borderRadius.m, justifyContent: 'center' },
  addButtonText: { color: theme.colors.text, fontWeight: 'bold' },
  uploadButton: { flexDirection: 'row', backgroundColor: theme.colors.tappable, paddingVertical: 15, borderRadius: theme.borderRadius.m, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  uploadButtonText: { color: theme.colors.text, fontWeight: 'bold', fontSize: 16 },
  previewImage: { width: '100%', height: 250, marginTop: 20, borderRadius: theme.borderRadius.l, resizeMode: 'cover' },
});
