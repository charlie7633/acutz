import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { HomeHeader } from '../components/HomeHeader';
import { FilterModal } from '../components/FilterModal';
import { StylistCard } from '../components/StylistCard';
import { databases, appwriteConfig } from '../config/appwriteConfig';

const COLORS = {
  white: '#FFFFFF',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  darkPanel: '#090014',
};

export const ClientHomeScreen = () => {
  const { logout } = useContext(AuthContext);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTextures, setSelectedTextures] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickTag, setActiveQuickTag] = useState('All');

  const [stylists, setStylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collectionId
        );
        setStylists(response.documents);
      } catch (error) {
        console.error("Error fetching stylists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStylists();
  }, []);

  const toggleTexture = (texture) => {
    setSelectedTextures(prev =>
      prev.includes(texture) ? prev.filter(t => t !== texture) : [...prev, texture]
    );
  };

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  return (
    <View style={styles.container}>
      {/* MAP BACKGROUND */}
      <MapView
        provider={PROVIDER_DEFAULT}
        userInterfaceStyle="dark"
        style={styles.map}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.0822,
          longitudeDelta: 0.0421,
        }}
      >
        {stylists.map(stylist => {
          if (!stylist.latitude || !stylist.longitude) return null;
          return (
            <Marker
              key={stylist.$id || stylist.id}
              coordinate={{ latitude: stylist.latitude, longitude: stylist.longitude }}
              title={stylist.businessName}
              description={`Starting at £${stylist.startingPrice}`}
            >
              <View style={styles.pinGlow}>
                <View style={styles.mapPin}>
                  <Ionicons name="cut" size={14} color={COLORS.white} />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <HomeHeader
        logout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setFilterVisible={setFilterVisible}
        activeQuickTag={activeQuickTag}
        setActiveQuickTag={setActiveQuickTag}
      />

      {/* BOTTOM SHEET / STYLIST RESULTS */}
      <View style={styles.bottomSheetContainer} pointerEvents="box-none">
        <View style={styles.resultsSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitleText}>Nearby Specialists</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.white} style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              snapToInterval={Dimensions.get('window').width * 0.75 + 15}
              decelerationRate="fast"
            >
              {stylists.map(stylist => (
                <StylistCard key={stylist.$id || stylist.id} stylist={stylist} />
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <FilterModal
        filterVisible={filterVisible}
        setFilterVisible={setFilterVisible}
        selectedTextures={selectedTextures}
        toggleTexture={toggleTexture}
        selectedServices={selectedServices}
        toggleService={toggleService}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.brandAccent },
  map: { ...StyleSheet.absoluteFillObject },
  pinGlow: { backgroundColor: 'rgba(224, 170, 255, 0.25)', padding: 10, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  mapPin: { backgroundColor: '#000000', padding: 10, borderRadius: 20, borderWidth: 2, borderColor: COLORS.secondaryAccent1, shadowColor: COLORS.secondaryAccent1, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 },
  bottomSheetContainer: { position: 'absolute', bottom: 0, width: '100%' },
  resultsSheet: { backgroundColor: COLORS.darkPanel, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 15, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  sheetTitleText: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginBottom: 20 },
  carouselContainer: { paddingHorizontal: 20 }
});
