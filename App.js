import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Image, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-url-polyfill/auto';
import { account, databases, storage, appwriteConfig, client } from './appwriteConfig';
import { ID, Query } from 'react-native-appwrite';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [accountType, setAccountType] = useState('user');


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
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="cut" size={50} color={theme.colors.primary} />
          </View>
          <Text style={styles.appTitle}>Acutz</Text>
          <Text style={styles.appSubtitle}>Personalized Hair Care Management</Text>
        </View>

        <View style={styles.authTabs}>
          <TouchableOpacity
            style={[styles.authTab, authMode === 'login' && styles.authTabActive]}
            onPress={() => setAuthMode('login')}
          >
            <Text style={[styles.authTabText, authMode === 'login' && styles.authTabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authTab, authMode === 'signup' && styles.authTabActive]}
            onPress={() => setAuthMode('signup')}
          >
            <Text style={[styles.authTabText, authMode === 'signup' && styles.authTabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Choose Account Type</Text>
        <View style={styles.accountTypeRow}>
          <TouchableOpacity
            style={[styles.accountCard, accountType === 'user' && styles.accountCardActive]}
            onPress={() => setAccountType('user')}
          >
            <View style={[styles.accountIconCircle, accountType === 'user' && styles.accountIconCircleActive]}>
              <Ionicons name="person" size={24} color={accountType === 'user' ? theme.colors.primary : theme.colors.textMuted} />
            </View>
            <Text style={[styles.accountCardText, accountType === 'user' && styles.accountCardTextActive]}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.accountCard, accountType === 'professional' && styles.accountCardActive]}
            onPress={() => setAccountType('professional')}
          >
            <View style={[styles.accountIconCircle, accountType === 'professional' && styles.accountIconCircleActive]}>
              <Ionicons name="cut" size={24} color={accountType === 'professional' ? theme.colors.primary : theme.colors.textMuted} />
            </View>
            <Text style={[styles.accountCardText, accountType === 'professional' && styles.accountCardTextActive]}>Professional</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            placeholder="hello@acutz.com"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <Ionicons name="eye-outline" size={20} color={theme.colors.textMuted} />
        </View>

        {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={authMode === 'login' ? handleLogin : handleSignUp}
            >
              <Text style={styles.primaryButtonText}>
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Hair Types</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Add Hair Type (e.g. 4c)"
              placeholderTextColor={theme.colors.textMuted}
              value={newHairType}
              onChangeText={setNewHairType}
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
            />
            <TouchableOpacity style={styles.addButton} onPress={addHairType}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {hairTypes.map((type) => (
            <View key={type.id} style={styles.listItem}>
              <Text style={styles.listText}>{type.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Your Photos</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.uploadButtonText}>Pick & Upload Image</Text>
          </TouchableOpacity>

          {uploading && <ActivityIndicator style={{ marginTop: 15 }} color={theme.colors.primary} />}
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.tappable,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: theme.colors.tappable,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  signOutButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  signOutButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 15,
    marginTop: 10,
  },
  section: {
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
  },
  addButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  listItem: {
    padding: 15,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.tappable,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  uploadButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 250,
    marginTop: 20,
    borderRadius: theme.borderRadius.l,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    marginBottom: 24,
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
  },
  authTabActive: {
    backgroundColor: theme.colors.primary,
  },
  authTabText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  authTabTextActive: {
    color: theme.colors.text,
  },
  sectionLabel: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  accountTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  accountCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  accountCardActive: {
    borderColor: theme.colors.primary,
  },
  accountIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIconCircleActive: {
    backgroundColor: theme.colors.tappable,
  },
  accountCardText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountCardTextActive: {
    color: theme.colors.text,
  },
  inputLabel: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  }
});