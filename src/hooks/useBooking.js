import { useState } from 'react';
import { Alert } from 'react-native';
import { ID } from 'react-native-appwrite';
import { databases, appwriteConfig } from '../config/appwriteConfig';

/**
 * @hook useBooking
 * @description 
 * A custom React Hook that encapsulates the logic for submitting an appointment 
 * request to the Appwrite database. 
 * 
 * **University Presentation Note:**
 * By separating this logic from `StylistProfileScreen`, we strictly enforce 
 * the **Separation of Concerns (SoC)** principle. The UI layer only cares about 
 * gathering input and calling `submitBooking`, whilst this data layer manages 
 * the asynchronous network request and loading state independently.
 * 
 * @returns {Object} { isSubmitting, submitBooking }
 */
export const useBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submits the appointment payload to Appwrite.
   * @param {Object} payload The fully formed appointment object (from the UI).
   * @param {Function} onSuccess Callback fired when the document is successfully created.
   */
  const submitBooking = async (payload, onSuccess) => {
    setIsSubmitting(true);
    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.appointmentsCollectionId,
        ID.unique(),
        payload
      );

      // Trigger the UI callback to close the modal
      if (onSuccess) onSuccess();

      Alert.alert('Success', 'Booking request sent!');
    } catch (error) {
      console.error('Booking submission error:', error);
      Alert.alert(
        'Booking Failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBooking,
  };
};
