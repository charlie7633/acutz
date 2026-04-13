import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from '../config/appwriteConfig';

/**
 * useAppointments
 *
 * Custom hook to encapsulate fetching and updating logic for the Appointments collection.
 * Serves both 'client' and 'professional' roles.
 */
export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (role, userId, silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const queries = [];
      
      if (role === 'client') {
        queries.push(Query.equal('clientId', userId));
      } else if (role === 'professional') {
        queries.push(Query.equal('professionalId', userId));
      }

      // Always order descending across both roles for newest first
      queries.push(Query.orderDesc('$createdAt'));

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.appointmentsCollectionId,
        queries
      );
      
      setAppointments(response.documents);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.appointmentsCollectionId,
        appointmentId,
        { status: newStatus }
      );
      
      // Optimistically update local state
      setAppointments((prev) => 
        prev.map((apt) => 
          apt.$id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating appointment:', err);
      Alert.alert('Error', 'Failed to update appointment status.');
      return false;
    }
  }, []);

  return { 
    appointments, 
    isLoading, 
    error, 
    fetchAppointments, 
    updateAppointmentStatus 
  };
};
