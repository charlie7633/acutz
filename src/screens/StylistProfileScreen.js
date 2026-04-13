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
import { ID } from 'react-native-appwrite';
import { AuthContext } from '../context/AuthContext';
import { databases, appwriteConfig } from '../config/appwriteConfig';
import { theme } from '../theme/theme';

// ---------------------------------------------------------------------------
// Colour aliases
// ---------------------------------------------------------------------------
const C = theme.colors;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date object → "YYYY-MM-DD" */
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Format a Date object → "HH:MM" (24-hour) */
const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};

// ---------------------------------------------------------------------------
// Static display Chip (profile page)
// ---------------------------------------------------------------------------
const Chip = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

// ---------------------------------------------------------------------------
// Selectable service chip (booking modal)
// ---------------------------------------------------------------------------
const ServiceChip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.serviceChip, selected && styles.serviceChipSelected]}
    onPress={onPress}
    activeOpacity={0.75}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={label}
  >
    {selected && (
      <Ionicons name="checkmark-circle" size={14} color={C.text} style={{ marginRight: 5 }} />
    )}
    <Text style={[styles.serviceChipText, selected && styles.serviceChipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Tappable row that opens a DateTimePicker
// ---------------------------------------------------------------------------
const PickerRow = ({ label, icon, displayValue, onPress }) => (
  <TouchableOpacity style={styles.pickerRow} onPress={onPress} activeOpacity={0.8}>
    <Ionicons name={icon} size={18} color={C.primary} style={{ marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.pickerRowLabel}>{label}</Text>
      <Text style={styles.pickerRowValue}>{displayValue}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
  </TouchableOpacity>
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

  // ── Booking modal visibility ───────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);

  // ── Service selection (from stylist's own list) ────────────────────────
  const [serviceRequested, setServiceRequested] = useState('');

  // ── Date picker state ──────────────────────────────────────────────────
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Time picker state ──────────────────────────────────────────────────
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ── Submit state ───────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Derived display values ─────────────────────────────────────────────
  const name = stylist.businessName || 'Unknown Stylist';
  const price = stylist.startingPrice !== undefined ? stylist.startingPrice : '--';
  const rating =
    stylist.rating !== undefined ? Number(stylist.rating).toFixed(1) : 'New';
  const hairTypes = stylist.hairTypes || [];
  const services = stylist.services || [];

  // ── Date/time picker handlers ──────────────────────────────────────────
  const onDateChange = (event, selected) => {
    // On Android, dismiss after selection; on iOS the picker stays inline.
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setAppointmentDate(selected);
  };

  const onTimeChange = (event, selected) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selected) setAppointmentTime(selected);
  };

  // On iOS we show the picker inline inside the modal.
  // On Android the native dialog appears and dismisses itself.
  const handleDateRowPress = () => {
    setShowTimePicker(false); // close time if open
    setShowDatePicker(true);
  };

  const handleTimeRowPress = () => {
    setShowDatePicker(false); // close date if open
    setShowTimePicker(true);
  };

  // ── Reset and close modal ──────────────────────────────────────────────
  const closeModal = () => {
    setServiceRequested('');
    setAppointmentDate(new Date());
    setAppointmentTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
    setModalVisible(false);
  };

  // ── Booking submit ─────────────────────────────────────────────────────
  /**
   * Validates the modal selections and creates an Appointments document in
   * Appwrite.  Shows a success alert on completion and closes the modal, or
   * surfaces an error alert if the request fails.
   */
  const handleBookingSubmit = async () => {
    if (!serviceRequested) {
      Alert.alert('Missing Service', 'Please select a service before confirming.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        professionalId: stylist.$id,
        clientId: user.$id,
        clientName: user.name || 'Acutz Client',
        serviceRequested,
        appointmentDate: formatDate(appointmentDate),
        appointmentTime: formatTime(appointmentTime),
        status: 'Pending',
      };

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.appointmentsCollectionId,
        ID.unique(),
        payload,
      );

      closeModal();
      Alert.alert('Success', 'Booking request sent!');
    } catch (error) {
      console.error('Booking submission error:', error);
      Alert.alert(
        'Booking Failed',
        error?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
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
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Drag handle */}
            <View style={styles.modalHandle} />

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book with {name}</Text>
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            {/* ── 1. SELECT SERVICE ── */}
            <Text style={styles.inputLabel}>Select a Service</Text>
            {services.length > 0 ? (
              <View style={styles.serviceChipRow}>
                {services.map((sv, i) => (
                  <ServiceChip
                    key={`modal-sv-${i}`}
                    label={sv}
                    selected={serviceRequested === sv}
                    onPress={() => setServiceRequested(sv)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.noServicesText}>No services listed by this stylist.</Text>
            )}

            {/* ── 2. DATE PICKER ── */}
            <Text style={styles.inputLabel}>Preferred Date</Text>
            <PickerRow
              label="Date"
              icon="calendar-outline"
              displayValue={formatDate(appointmentDate)}
              onPress={handleDateRowPress}
            />
            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={onDateChange}
                themeVariant="dark"
                accentColor={C.primary}
                style={styles.nativePicker}
              />
            )}

            {/* ── 3. TIME PICKER ── */}
            <Text style={styles.inputLabel}>Preferred Time</Text>
            <PickerRow
              label="Time"
              icon="time-outline"
              displayValue={formatTime(appointmentTime)}
              onPress={handleTimeRowPress}
            />
            {showTimePicker && (
              <DateTimePicker
                value={appointmentTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour
                onChange={onTimeChange}
                themeVariant="dark"
                accentColor={C.primary}
                style={styles.nativePicker}
              />
            )}

            {/* ── CONFIRM ── */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleBookingSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={C.text} />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: C.text },

  // Labels
  inputLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Selectable service chips (modal)
  serviceChipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceChipSelected: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  serviceChipText: { fontSize: 14, color: C.textMuted, fontWeight: '600' },
  serviceChipTextSelected: { color: C.text },

  noServicesText: { fontSize: 14, color: C.textMuted, fontStyle: 'italic' },

  // Picker rows (tappable date / time rows)
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerRowLabel: { fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  pickerRowValue: { fontSize: 17, color: C.text, fontWeight: '600', marginTop: 2 },

  // Native DateTimePicker wrapper
  nativePicker: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },

  // Submit
  submitButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: C.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
