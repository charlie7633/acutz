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
import { AuthContext } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { theme } from '../theme/theme';
import { AppointmentCard } from '../components/AppointmentCard';

const C = theme.colors;

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
  const { appointments, isLoading, fetchAppointments } = useAppointments();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  
  // Fetch on first mount
  useEffect(() => {
    if (user?.$id) {
      fetchAppointments('client', user.$id);
    }
  }, [fetchAppointments, user?.$id]);

  // Re-fetch every time this screen comes into focus (e.g. after booking)
  useFocusEffect(
    useCallback(() => {
      if (user?.$id) {
        fetchAppointments('client', user.$id, true);
      }
    }, [fetchAppointments, user?.$id]),
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (user?.$id) {
      await fetchAppointments('client', user.$id, true);
    }
    setIsRefreshing(false);
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
