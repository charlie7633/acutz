import React, { useState } from 'react';
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
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

// Strict Color Palette from Prompt
const COLORS = {
  white: '#FFFFFF',
  cardSecondary: '#E0AAFF',
  textPrimary: '#000000',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  secondaryAccent2: '#7B2CBF',
};

const hairTextures = ['1A-2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const serviceTypes = ['Barber', 'Loctician', 'Hairdresser', 'Braider', 'Colorist'];

const MOCK_STYLISTS = [
  { id: '1', name: 'Marcus', rating: 4.8, price: 45, tags: ['Barber', '4C'], latitude: 37.78825, longitude: -122.4324 },
  { id: '2', name: 'Alayah', rating: 4.9, price: 80, tags: ['Loctician', '4A'], latitude: 37.78925, longitude: -122.4344 },
  { id: '3', name: 'Jasmine', rating: 4.7, price: 65, tags: ['Braider', '3C'], latitude: 37.78725, longitude: -122.4304 },
];

export default function DiscoveryScreen() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTextures, setSelectedTextures] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
        style={[styles.chip, isSelected && styles.chipSelected]} 
        onPress={() => onPress(label)}
        activeOpacity={0.8}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* B. The Map Layer (Background) */}
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        {MOCK_STYLISTS.map(stylist => (
          <Marker 
            key={stylist.id}
            coordinate={{ latitude: stylist.latitude, longitude: stylist.longitude }}
          >
            <View style={styles.mapPin}>
              <Ionicons name="cut" size={16} color={COLORS.white} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* A. The Header & Search Layer (Floating) */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textPrimary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search location or stylist..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* C. The Stylist Results Layer (Bottom) */}
      <View style={styles.resultsContainer} pointerEvents="box-none">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={Dimensions.get('window').width * 0.8 + 15} // card width + margin
          decelerationRate="fast"
        >
          {MOCK_STYLISTS.map(stylist => (
            <View key={stylist.id} style={styles.stylistCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.stylistName}>{stylist.name}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={COLORS.brandAccent} />
                  <Text style={styles.ratingText}>{stylist.rating}</Text>
                </View>
              </View>
              <Text style={styles.priceText}>From ${stylist.price}</Text>
              
              <View style={styles.tagsContainer}>
                {stylist.tags.map(tag => (
                  <View key={tag} style={styles.cardTag}>
                    <Text style={styles.cardTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* D. The Filter Modal (Bottom Sheet) */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetContent}>
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
    backgroundColor: COLORS.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPin: {
    backgroundColor: COLORS.textPrimary, // Using black as the Darkest Brown/Black for premium map pin
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.brandAccent,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  resultsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  carouselContainer: {
    paddingHorizontal: 15,
  },
  stylistCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get('window').width * 0.8,
    marginHorizontal: 7.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stylistName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.brandAccent,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardTag: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondaryAccent1,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginTop: 5,
  },
  cardTagText: {
    fontSize: 12,
    color: COLORS.secondaryAccent1,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sheetContent: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#D3C8B8', // A Light Taupe / Beige custom blend to fit interaction design requirement
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: COLORS.brandAccent, // Darkest Brown or Black equivalent using brand accent
    borderColor: COLORS.brandAccent,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  applyContainer: {
    paddingTop: 10,
  },
  applyButton: {
    backgroundColor: COLORS.brandAccent,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.brandAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
