import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF',
  cardSecondary: '#E0AAFF',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  secondaryAccent2: '#7B2CBF',
  glassOverlay: 'rgba(90, 24, 154, 0.35)',
};

const quickTags = ['All', '4C Expert', '3B', 'Locs', 'Braids', 'Curly', 'Coily'];

export const HomeHeader = ({
  logout,
  searchQuery,
  setSearchQuery,
  setFilterVisible,
  activeQuickTag,
  setActiveQuickTag
}) => {
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
  quickTagsScrollView: { flexDirection: 'row' },
  quickTag: { backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: COLORS.secondaryAccent1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10 },
  quickTagActive: { backgroundColor: COLORS.cardSecondary, borderColor: COLORS.cardSecondary },
  quickTagText: { color: '#D1D1D1', fontWeight: '500', fontSize: 14 },
  quickTagTextActive: { color: COLORS.brandAccent, fontWeight: 'bold' }
});
