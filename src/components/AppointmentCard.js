import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

const C = theme.colors;

// ─── Status badge config ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    icon: 'time-outline',
    color: '#FFC107',
    bg: 'rgba(255, 193, 7, 0.12)',
    border: 'rgba(255, 193, 7, 0.4)',
  },
  Confirmed: {
    label: 'Confirmed',
    icon: 'checkmark-circle-outline',
    color: '#4CAF50',
    bg: 'rgba(76, 175, 80, 0.12)',
    border: 'rgba(76, 175, 80, 0.4)',
  },
  Declined: {
    label: 'Declined',
    icon: 'close-circle-outline',
    color: C.error,
    bg: 'rgba(255, 76, 76, 0.12)',
    border: 'rgba(255, 76, 76, 0.4)',
  },
};

/**
 * Coloured pill badge showing the appointment status.
 */
export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Ionicons name={cfg.icon} size={13} color={cfg.color} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

/**
 * @component AppointmentCard
 * @description 
 * Renders a highly reusable card displaying appointment details. 
 * Supports both 'client' and 'professional' views.
 * 
 * **Separation of Concerns:** 
 * Extracted from monolithic screens (`ProfessionalHomeScreen`, `ClientAppointmentsScreen`)
 * to ensure our Dashboard UI is clean and strictly responsible for page layout, 
 * not micro-component rendering.
 * 
 * @param {Object} props
 * @param {Object} props.item - The Appwrite appointment document.
 * @param {string} props.role - Identifies the viewer ('client' | 'professional').
 * @param {Function} props.onUpdateStatus - Callback for Professional to accept/decline.
 */
export const AppointmentCard = ({ item, role = 'client', onUpdateStatus }) => {
  return (
    <View style={styles.card}>
      {/* ── Top row: Identity + Status ── */}
      <View style={styles.cardHeader}>
        {role === 'client' ? (
          <>
            <View style={styles.serviceIconWrap}>
              <Ionicons name="cut" size={18} color={C.primary} />
            </View>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceRequested || 'Service'}
            </Text>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{item.clientName || 'Client'}</Text>
            <Text style={styles.serviceRequested}>{item.serviceRequested || 'Service'}</Text>
          </View>
        )}
        <StatusBadge status={item.status} />
      </View>

      {/* ── Divider ── */}
      <View style={styles.cardDivider} />

      {/* ── Date & time row ── */}
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={C.textMuted} />
          <Text style={styles.metaText}>{item.appointmentDate || '—'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={C.textMuted} />
          <Text style={styles.metaText}>{item.appointmentTime || '—'}</Text>
        </View>
      </View>

      {/* ── Action Buttons (Professional Only) ── */}
      {role === 'professional' && item.status === 'Pending' && onUpdateStatus && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => onUpdateStatus(item.$id, 'Confirmed')}
          >
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => onUpdateStatus(item.$id, 'Declined')}
          >
            <Ionicons name="close-circle" size={18} color={C.error} style={{ marginRight: 6 }} />
            <Text style={[styles.actionButtonText, { color: C.error }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Card base
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },

  // Client specifics
  serviceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginRight: 8,
  },

  // Professional specifics
  clientName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: C.text,
  },
  serviceRequested: {
    fontSize: 14,
    color: C.secondary,
    marginTop: 2,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Meta row
  cardDivider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
  },

  // Professional action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: theme.spacing.m,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 42,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: 'rgba(255, 76, 76, 0.08)',
    borderColor: C.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
