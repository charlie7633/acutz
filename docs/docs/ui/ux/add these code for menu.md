// Add this above your Map component
<View style={styles.brandHeaderContainer}>
  <View style={styles.topRow}>
    {/* The Logo */}
    <View style={styles.miniLogoBox}>
      <Text style={styles.miniLogoText}>A</Text>
    </View>
    <Text style={styles.brandTitle}>ACUTZ</Text>
    
    {/* Optional: Profile Icon Placeholder */}
    <View style={styles.profilePlaceholder} />
  </View>

  {/* The Search & Filter Row */}
  <View style={styles.searchRow}>
    <View style={styles.searchBar}>
      <Text style={styles.searchPlaceholder}>🔍 Search stylists, textures...</Text>
    </View>
    <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
      <Text style={styles.filterIcon}>⚙️</Text> 
    </TouchableOpacity>
  </View>
</View>

// Add these to your StyleSheet
const styles = StyleSheet.create({
  brandHeaderContainer: {
    position: 'absolute',
    top: 50, // Adjust based on your phone's safe area
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF', // Or your lightest nude color
    borderRadius: 25,
    padding: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  miniLogoBox: {
    width: 35,
    height: 35,
    backgroundColor: '#4A3628', // Your Dark Brown
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    marginRight: 10,
  },
  miniLogoText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#1A1A1A',
    flex: 1,
  },
  profilePlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#E0D5C1', // Light nude
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#F8F5F2', // Very light earthy tone
    padding: 15,
    borderRadius: 15,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    color: '#888',
    fontWeight: '500',
  },
  filterBtn: {
    backgroundColor: '#4A3628', // Dark Brown brand color
    width: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  }
});


and this code is for you just need to adjust the StyleSheet in the FilterModal
chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8F5F2', // Changed from generic gray to Light Nude
    borderWidth: 1,
    borderColor: '#E0D5C1', // Medium Taupe border
  },
  chipSelected: {
    backgroundColor: '#4A3628', // Changed from Black/Blue to Darkest Brown
    borderColor: '#4A3628',
  },
  chipText: { color: '#8C7A6B', fontWeight: '600' }, // Earthy text
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  applyButton: {
    backgroundColor: '#4A3628', // Darkest Brown
    // ...