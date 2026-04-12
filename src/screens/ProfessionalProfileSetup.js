import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { databases, appwriteConfig } from '../config/appwriteConfig';
import { ID } from 'react-native-appwrite';
import { ChipSelector } from '../components/ChipSelector';

const { width, height } = Dimensions.get('window');
const hairTextures = ['1A-2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const serviceTypes = ['Barber', 'Loctician', 'Hairdresser', 'Braider', 'Colorist'];

const DEFAULT_REGION = {
  latitude: 51.5074,
  longitude: -0.1278,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const ProfessionalProfileSetup = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const existingProfile = route?.params?.profile || null;
  const isEditMode = !!existingProfile;

  // Form State
  const [businessName, setBusinessName] = useState(existingProfile?.businessName || '');
  const [startingPrice, setStartingPrice] = useState(existingProfile?.startingPrice?.toString() || '');
  const [selectedTextures, setSelectedTextures] = useState(existingProfile?.hairTypes || []);
  const [selectedServices, setSelectedServices] = useState(existingProfile?.services || []);
  const [portfolioImage, setPortfolioImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(existingProfile?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location State
  const [location, setLocation] = useState(
    existingProfile?.latitude && existingProfile?.longitude
      ? { latitude: existingProfile.latitude, longitude: existingProfile.longitude }
      : null
  );
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [mapRegion, setMapRegion] = useState(
    existingProfile?.latitude && existingProfile?.longitude
      ? {
          latitude: existingProfile.latitude,
          longitude: existingProfile.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION
  );
  const [isSearching, setIsSearching] = useState(false);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPortfolioImage(result.assets[0]);
      }
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('Error', 'Failed to open image picker.');
    }
  };

  const toggleSelection = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  // ─── MAP / LOCATION LOGIC ───
  const openMapModal = async () => {
    setIsMapVisible(true);

    // If we already have a saved location, don't override it
    if (location) return;

    // Try to get the user's current position to center the map
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to center the map. You can still search for an address or drag the pin.');
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      setLocation({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      });
    } catch (error) {
      console.error('Location Error:', error);
      // Silently fall back to default London region
    }
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(addressQuery);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setMapRegion(newRegion);
        setLocation({ latitude, longitude });
      } else {
        Alert.alert('Not Found', 'Could not find that address. Try a different search term.');
      }
    } catch (error) {
      console.error('Geocode Error:', error);
      Alert.alert('Search Error', 'Failed to search for the address.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  // ─── SAVE / UPDATE LOGIC ───
  const handleSaveProfile = async () => {
    if (!businessName.trim() || !startingPrice.trim() || selectedTextures.length === 0 || selectedServices.length === 0) {
      Alert.alert('Missing Fields', 'Please complete all fields to setup your profile.');
      return;
    }

    if (!location) {
      Alert.alert('Missing Location', 'Please set your business location using the map.');
      return;
    }

    const priceInt = parseInt(startingPrice, 10);
    if (isNaN(priceInt)) {
      Alert.alert('Invalid Price', 'Please enter a valid number for Starting Price.');
      return;
    }

    const userId = user?.uid || user?.$id || 'unknown_user';

    setIsSubmitting(true);

    try {
      let finalImageUrl = null;

      if (portfolioImage) {
        const fileId = ID.unique();
        
        const formData = new FormData();
        formData.append('fileId', fileId);
        formData.append('file', {
          uri: portfolioImage.uri,
          name: portfolioImage.fileName || `cover_${Date.now()}.jpg`,
          type: portfolioImage.mimeType || 'image/jpeg',
        });

        const uploadResponse = await fetch(
          `https://fra.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.photosBucketId}/files`,
          {
            method: 'POST',
            headers: {
              'X-Appwrite-Project': '699b4bcc001dba9897a1',
            },
            body: formData,
          }
        );

        const uploadedFile = await uploadResponse.json();

        if (uploadResponse.ok && uploadedFile.$id) {
          finalImageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.photosBucketId}/files/${uploadedFile.$id}/view?project=699b4bcc001dba9897a1`;
        } else {
          Alert.alert('Upload Error', 'Image upload failed. Profile will be saved without an image.');
        }
      }

      const imageToSave = finalImageUrl || existingImageUrl;

      const documentPayload = {
        userId: userId,
        businessName: businessName,
        hairTypes: selectedTextures,
        services: selectedServices,
        startingPrice: priceInt,
        latitude: location.latitude,
        longitude: location.longitude,
        rating: isEditMode ? (existingProfile.rating || 0.0) : 0.0,
        image: imageToSave
      };

      if (isEditMode) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          existingProfile.$id,
          documentPayload
        );
        Alert.alert('Updated', 'Your profile has been updated successfully!');
      } else {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          ID.unique(),
          documentPayload
        );
        Alert.alert('Success', 'Your professional profile has been saved successfully!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Appwrite Error:', error);
      Alert.alert('Database Error', 'Could not save your profile. Please check your Appwrite connection and Stylists collection permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditMode ? 'Edit Your Profile' : 'Setup Your Profile'}</Text>
          <Text style={styles.subtitle}>Let clients know what you specialize in.</Text>
        </View>

        {/* Cover Image Picker */}
        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {portfolioImage ? (
            <Image source={{ uri: portfolioImage.uri }} style={styles.previewImage} />
          ) : existingImageUrl ? (
            <Image source={{ uri: existingImageUrl }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePlaceholderText}>Tap to upload cover photo</Text>
          )}
        </TouchableOpacity>

        {/* Business Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Sarah's Cutz"
            placeholderTextColor={theme.colors.textMuted}
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        {/* Starting Price */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Starting Price (£)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 50"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            value={startingPrice}
            onChangeText={setStartingPrice}
          />
        </View>

        {/* Location Picker */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Business Location</Text>
          <TouchableOpacity 
            style={[styles.locationButton, location && styles.locationButtonSet]} 
            onPress={openMapModal}
          >
            <Ionicons 
              name={location ? 'checkmark-circle' : 'location-outline'} 
              size={20} 
              color={location ? '#4CAF50' : theme.colors.secondary} 
              style={{ marginRight: 10 }} 
            />
            <Text style={[styles.locationButtonText, location && styles.locationButtonTextSet]}>
              {location ? '✅ Location Saved — Tap to change' : '📍 Set Business Location'}
            </Text>
          </TouchableOpacity>
        </View>

        <ChipSelector 
          title="Specialized Hair Textures"
          options={hairTextures}
          selectedOptions={selectedTextures}
          onToggle={(option) => toggleSelection(option, selectedTextures, setSelectedTextures)}
        />

        <ChipSelector 
          title="Services Provided"
          options={serviceTypes}
          selectedOptions={selectedServices}
          onToggle={(option) => toggleSelection(option, selectedServices, setSelectedServices)}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSaveProfile}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditMode ? 'Update Profile' : 'Save Profile'}</Text>
          )}
        </TouchableOpacity>
        
      </ScrollView>

      {/* ─── MAP MODAL ─── */}
      <Modal
        visible={isMapVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Your Location</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)}>
              <Ionicons name="close-circle" size={30} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Address Search Bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search address..."
              placeholderTextColor={theme.colors.textMuted}
              value={addressQuery}
              onChangeText={setAddressQuery}
              onSubmitEditing={handleAddressSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleAddressSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
              ) : (
                <Ionicons name="search" size={20} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.mapHint}>Drag the pin to your exact salon location</Text>

          {/* Map */}
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              userInterfaceStyle="dark"
            >
              <Marker
                coordinate={location || { latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
                draggable
                onDragEnd={handleMarkerDragEnd}
                title="Your Salon"
              >
                <View style={styles.customPin}>
                  <Ionicons name="cut" size={16} color={theme.colors.text} />
                </View>
              </Marker>
            </MapView>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            style={styles.confirmLocationButton} 
            onPress={() => {
              if (!location) {
                // If the user hasn't dragged the pin, use the current map center
                setLocation({ latitude: mapRegion.latitude, longitude: mapRegion.longitude });
              }
              setIsMapVisible(false);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.confirmLocationText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  imagePickerContainer: {
    height: 150,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholderText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  inputSection: {
    marginBottom: theme.spacing.l,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
    height: 55,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Location Button
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    height: 55,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationButtonSet: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  locationButtonText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  locationButtonTextSet: {
    color: '#4CAF50',
  },

  // Submit
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.l,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ─── MAP MODAL STYLES ───
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: 60,
    paddingBottom: theme.spacing.m,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.s,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 15,
    height: 48,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customPin: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmLocationButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.l,
    marginVertical: theme.spacing.l,
    height: 56,
    borderRadius: theme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmLocationText: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
});
