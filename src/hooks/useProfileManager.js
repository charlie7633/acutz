import { useState } from 'react';
import { databases, storage, appwriteConfig } from '../config/appwriteConfig';
import { ID } from 'react-native-appwrite';

export const useProfileManager = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveProfile = async (profileData, portfolioImageUri, location, existingProfile) => {
    setIsSaving(true);
    try {
      let finalImageUrl = null;

      if (portfolioImageUri && portfolioImageUri.uri && !portfolioImageUri.uri.startsWith('http')) {
        const fileId = ID.unique();
        const fileToUpload = {
          uri: portfolioImageUri.uri,
          name: portfolioImageUri.fileName || `cover_${Date.now()}.jpg`,
          type: portfolioImageUri.mimeType || 'image/jpeg',
          size: portfolioImageUri.fileSize || 0,
        };

        // Upload to Appwrite storage
        const uploadedFile = await storage.createFile(
          appwriteConfig.photosBucketId,
          fileId,
          fileToUpload
        );

        if (uploadedFile.$id) {
          // Get the resulting View URL
          const result = storage.getFileView(appwriteConfig.photosBucketId, uploadedFile.$id);
          finalImageUrl = result?.href || result.toString();
        } else {
          throw new Error('Image upload failed.');
        }
      } else if (portfolioImageUri && portfolioImageUri.uri && portfolioImageUri.uri.startsWith('http')) {
        finalImageUrl = portfolioImageUri.uri;
      }

      const imageToSave = finalImageUrl || existingProfile?.image;

      const documentPayload = {
        userId: profileData.userId,
        businessName: profileData.businessName,
        hairTypes: profileData.hairTypes,
        services: profileData.services,
        startingPrice: profileData.startingPrice,
        latitude: location.latitude,
        longitude: location.longitude,
        rating: existingProfile ? (existingProfile.rating || 0.0) : 0.0,
        image: imageToSave,
      };

      if (existingProfile) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          existingProfile.$id,
          documentPayload
        );
      } else {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          ID.unique(),
          documentPayload
        );
      }

      return { success: true };
    } catch (error) {
      console.error('saveProfile error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, saveProfile };
};
