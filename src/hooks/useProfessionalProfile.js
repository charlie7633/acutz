import { useState, useCallback } from 'react';
import { Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from '../config/appwriteConfig';

/**
 * @hook useProfessionalProfile
 * @description
 * Manages fetching of the Professional's dedicated business profile from Appwrite.
 * 
 * **University Presentation Note:**
 * This logic was originally deeply embedded within `ProfessionalHomeScreen.js`. By 
 * tearing it out into a custom hook, we achieve two major software engineering wins:
 * 1. **Reusability**: We can now fetch a professional's profile from any other screen
 *    without duplicating code.
 * 2. **Clean UI**: The `ProfessionalHomeScreen` component no longer cares *how* the 
 *    data is fetched, it only cares about injecting the result into its views.
 * 
 * @param {string} userId - The Appwrite Authentication ID of the currently logged-in professional.
 * @returns {Object} { profile, isLoading, fetchProfile }
 */
export const useProfessionalProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Triggers the fetch manually.
   * @param {Function} onProfileFound - Optional callback fired when the document is retrieved.
   */
  const fetchProfile = useCallback(async (onProfileFound) => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.equal('userId', userId)]
      );

      if (response.documents.length > 0) {
        const profileDoc = response.documents[0];
        setProfile(profileDoc);
        // Execute callback if provided (e.g. to fetch associated appointments)
        if (onProfileFound) await onProfileFound(profileDoc.$id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching professional profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { profile, isLoading, fetchProfile };
};
