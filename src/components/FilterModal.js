import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF',
  cardSecondary: '#E0AAFF',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
  secondaryAccent2: '#7B2CBF',
  darkPanel: '#090014',
};

const hairTextures = ['1A-2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const serviceTypes = ['Barber', 'Loctician', 'Hairdresser', 'Braider', 'Colorist'];

export const FilterModal = ({
  filterVisible,
  setFilterVisible,
  selectedTextures,
  toggleTexture,
  selectedServices,
  toggleService
}) => {
  const renderChip = (label, isSelected, onPress) => (
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

  return (
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
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  filterModalSheet: { backgroundColor: COLORS.darkPanel, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, maxHeight: '80%', borderWidth: 1, borderColor: COLORS.secondaryAccent1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  modalContent: { marginBottom: 20 },
  filterSection: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.white, marginBottom: 15 },
  chipsWrapper: { flexDirection: 'row', flexWrap: 'wrap' },
  modalChip: { backgroundColor: COLORS.brandAccent, borderWidth: 1, borderColor: COLORS.secondaryAccent2, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  modalChipSelected: { backgroundColor: COLORS.cardSecondary, borderColor: COLORS.cardSecondary },
  modalChipText: { color: COLORS.cardSecondary, fontSize: 14, fontWeight: '500' },
  modalChipTextSelected: { color: COLORS.brandAccent, fontWeight: 'bold' },
  applyContainer: { paddingTop: 10 },
  applyButton: { backgroundColor: COLORS.cardSecondary, borderRadius: 25, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.cardSecondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  applyButtonText: { color: COLORS.brandAccent, fontSize: 18, fontWeight: 'bold' }
});
