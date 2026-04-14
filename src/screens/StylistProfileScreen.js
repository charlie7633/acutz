import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { useBooking } from '../hooks/useBooking';
import { BookingModal } from '../components/BookingModal';

// ---------------------------------------------------------------------------
// Colour aliases
// ---------------------------------------------------------------------------
const C = theme.colors;

// ---------------------------------------------------------------------------
// Static display Chip (profile page)
// ---------------------------------------------------------------------------
const Chip = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

// ---------------------------------------------------------------------------
// StylistProfileScreen
// ---------------------------------------------------------------------------
/**
 * Displays a stylist's full profile and provides a booking modal so that a
 * logged-in client can submit an appointment request to Appwrite.
 *
 * @param {object} route      - React Navigation route; expects `route.params.stylist`.
 * @param {object} navigation - React Navigation navigation prop.
 */
export const StylistProfileScreen = ({ route, navigation }) => {
  const { stylist } = route.params;
  const { user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const { isSubmitting, submitBooking } = useBooking();

  const name = stylist.businessName || 'Unknown Stylist';
  const price = stylist.startingPrice !== undefined ? stylist.startingPrice : '--';
  const rating = stylist.rating !== undefined ? Number(stylist.rating).toFixed(1) : 'New';
  const hairTypes = stylist.hairTypes || [];
  const services = stylist.services || [];

  const handleBookingSubmit = (serviceRequested, date, time, onSuccess) => {
    const payload = {
      professionalId: stylist.$id,
      clientId: user.$id,
      clientName: user.name || 'Acutz Client',
      serviceRequested,
      appointmentDate: date,
      appointmentTime: time,
      status: 'Pending',
    };
    submitBooking(payload, onSuccess);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.background} />

      {/* ── Back button overlays the hero image ── */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color={C.text} />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO / COVER PHOTO ── */}
        {stylist.image && typeof stylist.image === 'string' ? (
          <Image source={{ uri: stylist.image }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="cut-outline" size={60} color={C.secondary} />
            <Text style={styles.heroPlaceholderText}>No cover photo</Text>
          </View>
        )}

        {/* ── PROFILE INFO CARD ── */}
        <View style={styles.profileCard}>
          {/* Header row */}
          <View style={styles.profileHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileLabel}>Stylist</Text>
              <Text style={styles.profileName}>{name}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          {/* Starting price */}
          <View style={styles.priceRow}>
            <Ionicons name="pricetag-outline" size={16} color={C.primary} />
            <Text style={styles.priceText}>
              Starting from{' '}
              <Text style={styles.priceBold}>£{price}</Text>
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Hair types */}
          {hairTypes.length > 0 && (
            <View style={styles.chipSection}>
              <Text style={styles.chipSectionTitle}>Hair Types</Text>
              <View style={styles.chipRow}>
                {hairTypes.map((ht, i) => (
                  <Chip key={`ht-${i}`} label={ht} />
                ))}
              </View>
            </View>
          )}

          {/* Services */}
          {services.length > 0 && (
            <View style={styles.chipSection}>
              <Text style={styles.chipSectionTitle}>Services</Text>
              <View style={styles.chipRow}>
                {services.map((sv, i) => (
                  <Chip key={`sv-${i}`} label={sv} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── REQUEST APPOINTMENT BUTTON ── */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={20} color={C.text} style={{ marginRight: 8 }} />
          <Text style={styles.ctaButtonText}>Request Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOOKING MODAL ── */}
      <BookingModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        stylistName={name}
        services={services}
        onSubmit={handleBookingSubmit}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Back button
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    padding: 8,
  },

  // Hero image
  heroImage: { width: '100%', height: 280, resizeMode: 'cover' },
  heroPlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: { color: C.textMuted, fontSize: 14, marginTop: 10 },

  // Profile card
  profileCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 24,
    paddingTop: 28,
    minHeight: 300,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileName: { fontSize: 26, fontWeight: 'bold', color: C.text },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: C.text, marginLeft: 4 },

  // Price
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  priceText: { fontSize: 15, color: C.textMuted, marginLeft: 6 },
  priceBold: { fontWeight: 'bold', color: C.text },

  // Divider
  divider: { height: 1, backgroundColor: C.border, marginBottom: 20 },

  // Display chips (profile page)
  chipSection: { marginBottom: 18 },
  chipSectionTitle: {
    fontSize: 13,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: 'rgba(157, 78, 221, 0.18)',
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13, color: C.secondary, fontWeight: '600' },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: C.background,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  ctaButton: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: { color: C.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },

});
