import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Query } from 'react-native-appwrite';
import { AuthContext } from '../context/AuthContext';
import { databases, appwriteConfig } from '../config/appwriteConfig';
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

// ─── Sub-components ────────────────────────────────────────────────────────

/**
 * Coloured pill badge showing the appointment status.
 */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Ionicons name={cfg.icon} size={13} color={cfg.color} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

/**
 * A single appointment card shown in the list.
 */
const AppointmentCard = ({ item }) => (
  <View style={styles.card}>
    {/* Top row: service name + status badge */}
    <View style={styles.cardHeader}>
      <View style={styles.serviceIconWrap}>
        <Ionicons name="cut" size={18} color={C.primary} />
      </View>
      <Text style={styles.serviceName} numberOfLines={1}>
        {item.serviceRequested || 'Service'}
      </Text>
      <StatusBadge status={item.status} />
    </View>

    {/* Divider */}
    <View style={styles.cardDivider} />

    {/* Date & time row */}
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
  </View>
);

// ─── Main screen ───────────────────────────────────────────────────────────

/**
 * ClientAppointmentsScreen
 *
 * Displays all booking requests made by the currently logged-in client,
 * fetched from the Appwrite Appointments collection.
 *
 * @param {object} navigation - React Navigation navigation prop.
 */
export const ClientAppointmentsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.appointmentsCollectionId,
        [
          Query.equal('clientId', user.$id),
          Query.orderDesc('$createdAt'),   // newest first
        ],
      );
      setAppointments(response.documents);
    } catch (error) {
      console.error('Error fetching client appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user.$id]);

  // Fetch on first mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Re-fetch every time this screen comes into focus (e.g. after booking)
  useFocusEffect(
    useCallback(() => {
      fetchAppointments(true);
    }, [fetchAppointments]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAppointments(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={C.background} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading your appointments…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        {/* Spacer to keep title centred */}
        <View style={{ width: 36 }} />
      </View>

      {/* Count sub-header */}
      {appointments.length > 0 && (
        <Text style={styles.countLabel}>
          {appointments.length} booking{appointments.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* List / Empty state */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        contentContainerStyle={
          appointments.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={48} color={C.primary} />
            </View>
            <Text style={styles.emptyTitle}>No booking requests</Text>
            <Text style={styles.emptySubtitle}>
              You have no booking requests.{'\n'}Find a stylist on the map to get started.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Ionicons name="map-outline" size={18} color={C.text} style={{ marginRight: 8 }} />
              <Text style={styles.emptyBtnText}>Find a Stylist</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.3,
  },

  // Count label
  countLabel: {
    fontSize: 13,
    color: C.textMuted,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },

  // Card
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
    padding: 16,
    paddingBottom: 12,
  },
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

  // Card meta row
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

  // Loading
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: C.textMuted,
    fontSize: 14,
    marginTop: 12,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyBtnText: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
