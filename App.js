import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-url-polyfill/auto';
import { account, databases, storage, appwriteConfig, client } from './appwriteConfig';
import { ID, Query } from 'react-native-appwrite';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Hair Type Data
  const [hairTypes, setHairTypes] = useState([]);
  const [newHairType, setNewHairType] = useState('');

  // Image Upload
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Authentication Listener
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser({ ...currentUser, uid: currentUser.$id });
    } catch (e) {
      setUser(null);
    }
  };

  // Fetch Hair Types
  const fetchHairTypes = async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.orderDesc('createdAt')]
      );
      const types = response.documents.map(doc => ({ id: doc.$id, ...doc }));
      setHairTypes(types);
    } catch (error) {
      console.log('Fetch error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHairTypes();

      // Realtime subscription
      const unsubscribe = client.subscribe(
        `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.collectionId}.documents`,
        (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
            response.events.includes('databases.*.collections.*.documents.*.delete')) {
            fetchHairTypes();
          }
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  // Auth Functions
  const handleSignUp = async () => {
    setLoading(true);
    try {
      await account.create(ID.unique(), email, password);
      await account.createEmailPasswordSession(email, password);
      await checkUser();
      Alert.alert("Success", "Account created!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      await checkUser();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  // Database Functions
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

  // Image Functions
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

      const response = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      );

      const downloadURL = storage.getFileView(appwriteConfig.storageId, response.$id);

      Alert.alert("Success", "Photo uploaded!");
      console.log("File available at", downloadURL);
    } catch (error) {
      console.error(error);
      Alert.alert("Error uploading image");
    }
    setUploading(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acutz Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        {loading ? <ActivityIndicator /> : (
          <View style={styles.buttonContainer}>
            <Button title="Login" onPress={handleLogin} />
            <View style={{ height: 10 }} />
            <Button title="Sign Up" onPress={handleSignUp} color="gray" />
          </View>
        )}
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Button title="Sign Out" onPress={handleSignOut} color="red" />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Hair Types</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Add Hair Type (e.g. 4c)"
              value={newHairType}
              onChangeText={setNewHairType}
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
            />
            <Button title="Add" onPress={addHairType} />
          </View>

          {hairTypes.map((type) => (
            <View key={type.id} style={styles.listItem}>
              <Text style={styles.listText}>{type.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Your Photos</Text>
          <Button title="Pick & Upload Image" onPress={pickImage} />
          {uploading && <ActivityIndicator style={{ marginTop: 10 }} />}
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  section: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 5,
  },
  listText: {
    fontSize: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  content: {
    flex: 1,
  }
});