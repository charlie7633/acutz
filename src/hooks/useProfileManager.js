import { useState } from 'react';
import { databases, storage, appwriteConfig } from '../config/appwriteConfig';
import { ID, Permission, Role } from 'react-native-appwrite';

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
          size: portfolioImageUri.fileSize || Number(portfolioImageUri.size) || 0,
        };

        const filePermissions = [
          Permission.read(Role.any()),
          Permission.update(Role.user(profileData.userId)),
          Permission.delete(Role.user(profileData.userId)),
        ];

        // Upload to Appwrite storage (with explicit size and permissions restored)
        const uploadedFile = await storage.createFile(
          appwriteConfig.photosBucketId,
          fileId,
          fileToUpload,
          filePermissions
        );

        if (uploadedFile && uploadedFile.$id) {
          // Manually construct the URL to bypass any react-native-url-polyfill or SDK wrapper bugs
          finalImageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.photosBucketId}/files/${uploadedFile.$id}/view?project=699b4bcc001dba9897a1`;
        } else {
          throw new Error('Image upload failed to return a valid file from Server.');
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

      const permissions = [
        Permission.read(Role.any()),
        Permission.update(Role.user(profileData.userId)),
        Permission.delete(Role.user(profileData.userId)),
      ];

      if (existingProfile) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          existingProfile.$id,
          documentPayload,
          permissions
        );
      } else {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId,
          ID.unique(),
          documentPayload,
          permissions
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
