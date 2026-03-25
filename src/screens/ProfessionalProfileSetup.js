import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { theme } from '../theme/theme';
import { AuthContext } from '../context/AuthContext';
import { databases, appwriteConfig } from '../config/appwriteConfig';
import { ID } from 'react-native-appwrite';

const hairTextures = ['1A-2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const serviceTypes = ['Barber', 'Loctician', 'Hairdresser', 'Braider', 'Colorist'];

export const ProfessionalProfileSetup = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [businessName, setBusinessName] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [selectedTextures, setSelectedTextures] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSelection = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  const renderChips = (options, selectedList, setSelectedList) => {
    return (
      <View style={styles.chipsWrapper}>
        {options.map(option => {
          const isSelected = selectedList.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleSelection(option, selectedList, setSelectedList)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
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
      await databases.createDocument(
        appwriteConfig.databaseId,
        'Stylists', // Writing to Stylists Collection Name string
        ID.unique(),
        {
          userId: userId,
          businessName: businessName,
          hairTypes: selectedTextures,
          services: selectedServices,
          startingPrice: priceInt,
          latitude: 51.5274, // Dummy Coordinate 
          longitude: -0.1278, // Dummy Coordinate
          rating: 0.0
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

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Specialized Hair Textures</Text>
          {renderChips(hairTextures, selectedTextures, setSelectedTextures)}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Services Provided</Text>
          {renderChips(serviceTypes, selectedServices, setSelectedServices)}
        </View>

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
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: theme.colors.text, 
    fontWeight: 'bold',
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
