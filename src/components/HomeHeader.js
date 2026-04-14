import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
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
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out" size={18} color={COLORS.white} />
      </TouchableOpacity>

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
  appointmentsBtnText: { color: theme.colors.text, fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }
});
