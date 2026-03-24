import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// Strict Color Palette from Prompt + Image inference
const COLORS = {
  white: '#FFFFFF',
  cardSecondary: '#E0AAFF',
  textPrimary: '#FFFFFF', // Changed to white for dark theme
  textMuted: '#A0A0A0',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  secondaryAccent2: '#7B2CBF',
  glassOverlay: 'rgba(90, 24, 154, 0.35)', // 5A189A with opacity
  darkPanel: '#090014', // Very dark for cards/sheet
};

const hairTextures = ['1A-2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const serviceTypes = ['Barber', 'Loctician', 'Hairdresser', 'Braider', 'Colorist'];
const quickTags = ['All', '4C Expert', '3B', 'Locs', 'Braids', 'Curly', 'Coily'];

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

  const renderChip = (label, isSelected, onPress) => {
    return (
      <TouchableOpacity
        style={[styles.modalChip, isSelected && styles.modalChipSelected]}
        onPress={() => onPress(label)}
        activeOpacity={0.8}
        key={label}
      >
        <Text style={[styles.modalChipText, isSelected && styles.modalChipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
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

      {/* HEADER & SEARCH (Glass Overlay) */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">

        {/* Logout (Small functional icon) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search stylists, textures..."
              placeholderTextColor="#BDBDBD"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={20} color={COLORS.white} style={styles.searchIcon} />
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Quick Tags Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickTagsScrollView}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {quickTags.map(tag => {
            const isActive = activeQuickTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.quickTag, isActive && styles.quickTagActive]}
                onPress={() => setActiveQuickTag(tag)}
              >
                <Text style={[styles.quickTagText, isActive && styles.quickTagTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

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
              <View key={stylist.id} style={styles.stylistCard}>
                <Image source={{ uri: stylist.image }} style={styles.cardImage} />

                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.stylistSubtext}>Stylist Name</Text>
                      <Text style={styles.stylistName}>{stylist.name}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{stylist.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.priceText}>Starts at <Text style={{ fontWeight: 'bold', color: COLORS.white }}>${stylist.price}</Text></Text>

                  <View style={styles.tagsContainer}>
                    {stylist.tags.map(tag => (
                      <View key={tag} style={styles.cardTag}>
                        <Text style={styles.cardTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* FULL FILTER MODAL (Retained from Original Design) */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalContent}>
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Hair Texture</Text>
                <View style={styles.chipsWrapper}>
                  {hairTextures.map(texture =>
                    renderChip(texture, selectedTextures.includes(texture), toggleTexture)
                  )}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Service Needed</Text>
                <View style={styles.chipsWrapper}>
                  {serviceTypes.map(service =>
                    renderChip(service, selectedServices.includes(service), toggleService)
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.applyContainer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brandAccent,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinGlow: {
    backgroundColor: 'rgba(224, 170, 255, 0.25)', // E0AAFF aura
    padding: 10,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.secondaryAccent1,
    shadowColor: COLORS.secondaryAccent1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerContainer: {
    position: 'absolute',
    top: 45,
    left: 20,
    right: 0,
    zIndex: 10,
  },
  logoutBtn: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassOverlay,
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent2,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
  },
  searchIcon: {
    marginLeft: 10,
  },
  filterBtn: {
    backgroundColor: COLORS.glassOverlay,
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent2,
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTagsScrollView: {
    flexDirection: 'row',
  },
  quickTag: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  quickTagActive: {
    backgroundColor: COLORS.cardSecondary,
    borderColor: COLORS.cardSecondary,
  },
  quickTagText: {
    color: '#D1D1D1',
    fontWeight: '500',
    fontSize: 14,
  },
  quickTagTextActive: {
    color: COLORS.brandAccent,
    fontWeight: 'bold',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  resultsSheet: {
    backgroundColor: COLORS.darkPanel,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetTitleText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 20,
  },
  carouselContainer: {
    paddingHorizontal: 20,
  },
  stylistCard: {
    backgroundColor: COLORS.brandAccent,
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent1,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.75,
    marginRight: 15,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  stylistSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  stylistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 5,
  },
  cardTagText: {
    fontSize: 12,
    color: COLORS.cardSecondary,
    fontWeight: '600',
  },
  // Full Filter Modal Styles (Dark Theme adapt)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  filterModalSheet: {
    backgroundColor: COLORS.darkPanel,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalContent: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 15,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalChip: {
    backgroundColor: COLORS.brandAccent,
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  modalChipSelected: {
    backgroundColor: COLORS.cardSecondary,
    borderColor: COLORS.cardSecondary,
  },
  modalChipText: {
    color: COLORS.cardSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalChipTextSelected: {
    color: COLORS.brandAccent,
    fontWeight: 'bold',
  },
  applyContainer: {
    paddingTop: 10,
  },
  applyButton: {
    backgroundColor: COLORS.cardSecondary,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.cardSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  applyButtonText: {
    color: COLORS.brandAccent,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
