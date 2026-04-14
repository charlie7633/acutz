import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const C = theme.colors;

// ─── Formatting Helpers ────────────────────────────────────────────────────
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};

// ─── Sub-components used exclusively within the modal ──────────────────────
const ServiceChip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.serviceChip, selected && styles.serviceChipSelected]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {selected && (
      <Ionicons name="checkmark-circle" size={14} color={C.text} style={{ marginRight: 5 }} />
    )}
    <Text style={[styles.serviceChipText, selected && styles.serviceChipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

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

/**
 * @component BookingModal
 * @description
 * An isolated UI component that handles the complex logic of selecting a service, 
 * date, and time via native pickers. 
 * 
 * **University Presentation Note:**
 * This was extracted from the `StylistProfileScreen` to dramatically improve 
 * readability. The `StylistProfileScreen` is now strictly responsible for showing 
 * a professional's portfolio, whilst `BookingModal` manages the interactive 
 * "Request Appointment" form logic.
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility state.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {string} props.stylistName - Display name of the professional.
 * @param {Array<string>} props.services - the services offered.
 * @param {Function} props.onSubmit - Triggered when the user hits 'Confirm Booking'. 
 *                                    Receives the assembled payload.
 * @param {boolean} props.isSubmitting - Determines if the spinner should show.
 */
export const BookingModal = ({
  visible,
  onClose,
  stylistName,
  services = [],
  onSubmit,
  isSubmitting
}) => {
  const [serviceRequested, setServiceRequested] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ── Handlers ──
  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setAppointmentDate(selected);
  };

  const onTimeChange = (event, selected) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selected) setAppointmentTime(selected);
  };

  const handleDateRowPress = () => {
    setShowTimePicker(false);
    setShowDatePicker(true);
  };

  const handleTimeRowPress = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  const resetAndClose = () => {
    setServiceRequested('');
    setAppointmentDate(new Date());
    setAppointmentTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!serviceRequested) {
      Alert.alert('Missing Service', 'Please select a service before confirming.');
      return;
    }
    onSubmit(
      serviceRequested, 
      formatDate(appointmentDate), 
      formatTime(appointmentTime), 
      resetAndClose
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Drag handle */}
          <View style={styles.modalHandle} />

          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book with {stylistName}</Text>
            <TouchableOpacity onPress={resetAndClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
            onPress={handleConfirm}
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
  );
};

// ─── Styles ───
const styles = StyleSheet.create({
  // Modal layout
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

  // Service chips
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

  // Picker rows
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
  nativePicker: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },

  // Submit button
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
