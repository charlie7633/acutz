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
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { databases, storage, appwriteConfig } from '../config/appwriteConfig';
import { ID } from 'react-native-appwrite';
import { ChipSelector } from '../components/ChipSelector';
const hairTextures = ['1A-2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const serviceTypes = ['Barber', 'Loctician', 'Hairdresser', 'Braider', 'Colorist'];

export const ProfessionalProfileSetup = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [businessName, setBusinessName] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [selectedTextures, setSelectedTextures] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [portfolioImage, setPortfolioImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPortfolioImage(result.assets[0].uri);
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


  const handleSaveProfile = async () => {
    if (!businessName.trim() || !startingPrice.trim() || selectedTextures.length === 0 || selectedServices.length === 0) {
      Alert.alert('Missing Fields', 'Please complete all fields to setup your profile.');
      return;
    }

    const priceInt = parseInt(startingPrice, 10);
    if (isNaN(priceInt)) {
      Alert.alert('Invalid Price', 'Please enter a valid number for Starting Price.');
      return;
    }

    // Appwrite stores user ID on user.$id. Fallbacks provided for pure Auth UI setups.
    const userId = user?.uid || user?.$id || 'unknown_user';

    setIsSubmitting(true);

    try {
      let finalImageUrl = null;

      if (portfolioImage) {
        const file = {
          uri: portfolioImage,
          name: `cover_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: 1024,
        };

        const uploadedFile = await storage.createFile(
          appwriteConfig.photosBucketId, 
          ID.unique(), 
          file
        );
        
        const fileViewUrl = storage.getFileView(appwriteConfig.photosBucketId, uploadedFile.$id);
        finalImageUrl = fileViewUrl.href || fileViewUrl.toString();
      }

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId, 
        ID.unique(),
        {
          userId: userId,
          businessName: businessName,
          hairTypes: selectedTextures,
          services: selectedServices,
          startingPrice: priceInt,
          latitude: 51.5274, // Dummy Coordinate 
          longitude: -0.1278, // Dummy Coordinate
          rating: 0.0,
          image: finalImageUrl // Append optional imageUrl securely
        }
      );
      
      Alert.alert('Success', 'Your professional profile has been saved successfully!');
      // navigation.navigate('ProfessionalHomeScreen'); // Optional if using React Navigation later
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
          <Text style={styles.title}>Setup Your Profile</Text>
          <Text style={styles.subtitle}>Let clients know what you specialize in.</Text>
        </View>

        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {portfolioImage ? (
            <Image source={{ uri: portfolioImage }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePlaceholderText}>Tap to upload cover photo</Text>
          )}
        </TouchableOpacity>

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

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Starting Price ($)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 50"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            value={startingPrice}
            onChangeText={setStartingPrice}
          />
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
            <Text style={styles.submitButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
        
      </ScrollView>
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
  }
});
