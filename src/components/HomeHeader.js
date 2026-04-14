import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';

const COLORS = {
  white: '#FFFFFF',
  cardSecondary: '#E0AAFF',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  secondaryAccent2: '#7B2CBF',
  glassOverlay: 'rgba(90, 24, 154, 0.35)',
};

export const HomeHeader = ({
  logout,
  searchQuery,
  setSearchQuery,
  setFilterVisible,
  onSearchSubmit,
}) => {
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 500);
  };

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5`, {
        headers: {
          'User-Agent': 'AcutzApp/1.0'
        }
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Autocomplete Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    
    if (onSearchSubmit) {
      onSearchSubmit({
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
        name: suggestion.display_name
      });
    }
  };

  return (
    <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out" size={18} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by address or location..."
            placeholderTextColor="#BDBDBD"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => onSearchSubmit?.()}
            returnKeyType="search"
          />
          <Ionicons name="search" size={20} color={COLORS.white} style={styles.searchIcon} />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Autocomplete Dropdown */}
        {(suggestions.length > 0 || isSearching) && (
          <View style={styles.dropdownContainer}>
            {isSearching ? (
              <ActivityIndicator color={COLORS.white} style={{ padding: 15 }} />
            ) : (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
                    <Ionicons name="location-outline" size={16} color={COLORS.white} />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.appointmentsBtn}
        onPress={() => navigation.navigate('ClientAppointments')}
      >
        <Text style={styles.appointmentsBtnText}>📅 View My Appointments</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: { position: 'absolute', top: 45, left: 20, right: 0, zIndex: 10 },
  logoutBtn: { alignSelf: 'flex-end', marginRight: 20, marginBottom: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 15 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glassOverlay, borderWidth: 1, borderColor: COLORS.secondaryAccent2, borderRadius: 15, paddingHorizontal: 15, height: 50, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.white },
  searchIcon: { marginLeft: 10 },
  filterBtn: { backgroundColor: COLORS.glassOverlay, borderWidth: 1, borderColor: COLORS.secondaryAccent2, width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  appointmentsBtn: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  appointmentsBtnText: { color: theme.colors.text, fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  dropdownContainer: { position: 'absolute', top: 55, left: 0, right: 60, backgroundColor: COLORS.brandAccent, borderRadius: 15, borderWidth: 1, borderColor: COLORS.secondaryAccent2, maxHeight: 220, zIndex: 100, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  suggestionText: { color: COLORS.white, fontSize: 13, marginLeft: 10, flexShrink: 1, lineHeight: 18 }
});
