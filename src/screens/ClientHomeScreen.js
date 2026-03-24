import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { HomeHeader } from '../components/HomeHeader';
import { FilterModal } from '../components/FilterModal';
import { StylistCard } from '../components/StylistCard';

const COLORS = {
  white: '#FFFFFF',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  darkPanel: '#090014',
};

const MOCK_STYLISTS = [
  { id: '1', name: 'Nia Adebayo', rating: 4.9, price: 60, tags: ['4C Specialist', 'Natural Hair'], image: 'https://images.unsplash.com/photo-1531123414708-5beafff72fff?auto=format&fit=crop&w=300&q=80', latitude: 51.5274, longitude: -0.1278 },
  { id: '2', name: 'Marcus Lee', rating: 4.8, price: 75, tags: ['Locs Expert', 'Retwists'], image: 'https://images.unsplash.com/photo-1506803682981-6e718a9ec3cb?auto=format&fit=crop&w=300&q=80', latitude: 51.5154, longitude: -0.1178 },
  { id: '3', name: 'Anya Sharma', rating: 4.7, price: 100, tags: ['Braids', 'Protective Styles'], image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=300&q=80', latitude: 51.4934, longitude: -0.1378 },
];

export const ClientHomeScreen = () => {
  const { logout } = useContext(AuthContext);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTextures, setSelectedTextures] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickTag, setActiveQuickTag] = useState('All');

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
        {MOCK_STYLISTS.map(stylist => (
          <Marker
            key={stylist.id}
            coordinate={{ latitude: stylist.latitude, longitude: stylist.longitude }}
          >
            <View style={styles.pinGlow}>
              <View style={styles.mapPin}>
                <Ionicons name="cut" size={14} color={COLORS.white} />
              </View>
            </View>
          </Marker>
        ))}
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={Dimensions.get('window').width * 0.75 + 15}
            decelerationRate="fast"
          >
            {MOCK_STYLISTS.map(stylist => (
              <StylistCard key={stylist.id} stylist={stylist} />
            ))}
          </ScrollView>
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
