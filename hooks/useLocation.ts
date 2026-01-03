import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Platform, Alert } from "react-native";

// Define a TypeScript interface for location data
interface LocationData {
    city?: string | null;
    region?: string | null;
    country?: string | null;
    postalCode?: string | null;
    district?: string | null;
    isoCountryCode?: string | null;
    name?: string | null;
    street?: string | null;
    streetNumber?: string | null;
    subregion?: string | null;
    timezone?: string | null;
  }

interface UseLocationHook {
  latitude: number | null;
  longitude: number | null;
  location: LocationData | null;
  errorMsg: string | null;
  hasPermission: boolean;
  getUserLocation: () => Promise<void>;
}

const useLocation = (): UseLocationHook => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const checkLocationPermissions = async (): Promise<void> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus === "granted") {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          setErrorMsg("Permission to access location was denied.");
        }
      }
    } catch (error) {
      setErrorMsg("Error checking location permissions.");
      console.error(error);
    }
  };

  const checkLocationServices = async (): Promise<boolean> => {
    try {
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert(
          "Location Disabled",
          "Your location services are disabled. Please enable them to use this feature.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Enable",
              onPress: () => {
                if (Platform.OS === "android") {
                  Location.enableNetworkProviderAsync();
                }
              },
            },
          ]
        );
      }
      return isLocationEnabled;
    } catch (error) {
      setErrorMsg("Error checking location services.");
      console.error(error);
      return false;
    }
  };

  const getUserLocation = async (): Promise<void> => {
    try {
      const isLocationEnabled = await checkLocationServices();
      if (!isLocationEnabled) return;

      if (!hasPermission) {
        await checkLocationPermissions();
      }

      if (hasPermission) {
        const { coords } = await Location.getCurrentPositionAsync({
            
        });
        if (coords) {
          const { latitude, longitude } = coords;
          setLatitude(latitude);
          setLongitude(longitude);

          const [response] = await Location.reverseGeocodeAsync({ latitude, longitude });

          if (response) {
            setLocation(response);
          }
        }
      }
    } catch (error) {
      setErrorMsg("Error fetching location.");
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await checkLocationPermissions();
        await getUserLocation();
      } catch (error) {
        console.warn('Location initialization error (non-critical):', error);
        // Continue without location - don't block app
      }
    })();
  }, []);

  return { latitude, longitude, location, errorMsg, hasPermission, getUserLocation };
};

export default useLocation;
