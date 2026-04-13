import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

/**
 * useLocation
 *
 * Custom hook that requests foreground location permissions and retrieves
 * the device's current GPS coordinates on mount.
 *
 * @returns {{ location: Location.LocationObject | null, errorMsg: string | null }}
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (!cancelled) {
            setErrorMsg('Location permission was denied. Showing default map area.');
          }
          return;
        }

        const coords = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setLocation(coords);
        }
      } catch (error) {
        console.error('useLocation – error fetching coordinates:', error);
        if (!cancelled) {
          setErrorMsg('Unable to retrieve your location.');
        }
      }
    };

    requestLocation();

    // Cleanup to prevent state updates on unmounted components
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, errorMsg };
};
