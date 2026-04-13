import { useState, useEffect, useCallback } from 'react';
import { Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from '../config/appwriteConfig';

/**
 * useStylists
 *
 * Custom hook that fetches stylist profile documents from Appwrite,
 * optionally filtered by hair types and/or services.
 *
 * @param {{ hairTypes: string[], services: string[] }} activeFilters
 * @returns {{ stylists: object[], isLoading: boolean, fetchStylists: Function }}
 */
export const useStylists = (activeFilters = { hairTypes: [], services: [] }) => {
  const [stylists, setStylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStylists = useCallback(async () => {
    setIsLoading(true);
    try {
      const queries = [];

      if (activeFilters.hairTypes && activeFilters.hairTypes.length > 0) {
        queries.push(Query.contains('hairTypes', activeFilters.hairTypes));
      }
      if (activeFilters.services && activeFilters.services.length > 0) {
        queries.push(Query.contains('services', activeFilters.services));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        queries.length > 0 ? queries : undefined,
      );

      setStylists(response.documents);
    } catch (error) {
      console.error('useStylists – error fetching stylists:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  // Re-run whenever the active filters change
  useEffect(() => {
    fetchStylists();
  }, [fetchStylists]);

  return { stylists, isLoading, fetchStylists };
};
