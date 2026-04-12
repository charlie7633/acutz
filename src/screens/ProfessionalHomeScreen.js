import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, ActivityIndicator, Image, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from '../config/appwriteConfig';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export const ProfessionalHomeScreen = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const userId = user?.uid || user?.$id;
      if (!userId) {
        setProfile(null);
        return;
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.equal('userId', userId)]
      );

      if (response.documents.length > 0) {
        setProfile(response.documents[0]);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when the screen regains focus (e.g. after completing profile setup)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // ─── LOADING STATE ───
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // ─── NO PROFILE STATE ───
  if (!profile) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyStateContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="cut-outline" size={48} color={theme.colors.primary} />
          </View>

          <Text style={styles.welcomeTitle}>Welcome to Acutz</Text>
          <Text style={styles.welcomeSubtitle}>Professional</Text>
          <Text style={styles.emptyDescription}>
            Set up your business profile to start appearing on the client map and receiving bookings.
          </Text>

          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => navigation.navigate('ProfessionalSetup')}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.ctaButtonText}>Complete Your Business Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButtonEmpty} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── DASHBOARD STATE ───
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover Image */}
        {profile.image && typeof profile.image === 'string' ? (
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: profile.image }} style={styles.coverImage} />
            <View style={styles.coverOverlay} />
          </View>
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image-outline" size={48} color={theme.colors.textMuted} />
          </View>
        )}

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.businessName}>{profile.businessName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {profile.rating !== undefined ? profile.rating.toFixed(1) : 'New'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButtonDash} onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>£{profile.startingPrice}</Text>
            <Text style={styles.statLabel}>Starting Price</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(profile.hairTypes || []).length}</Text>
            <Text style={styles.statLabel}>Hair Types</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(profile.services || []).length}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
        </View>

        {/* Hair Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialised Hair Textures</Text>
          <View style={styles.chipContainer}>
            {(profile.hairTypes || []).map((type, index) => (
              <View key={`hair-${index}`} style={styles.chip}>
                <Text style={styles.chipText}>{type}</Text>
              </View>
            ))}
            {(profile.hairTypes || []).length === 0 && (
              <Text style={styles.emptyChipText}>No hair types listed</Text>
            )}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Provided</Text>
          <View style={styles.chipContainer}>
            {(profile.services || []).map((service, index) => (
              <View key={`svc-${index}`} style={[styles.chip, styles.serviceChip]}>
                <Text style={[styles.chipText, styles.serviceChipText]}>{service}</Text>
              </View>
            ))}
            {(profile.services || []).length === 0 && (
              <Text style={styles.emptyChipText}>No services listed</Text>
            )}
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('ProfessionalSetup', { profile })}
        >
          <Ionicons name="pencil-outline" size={18} color={theme.colors.text} style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ─── CENTERED LAYOUTS (Loading + Empty) ───
  centeredContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: theme.spacing.m,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  welcomeSubtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
  },
  emptyDescription: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.m,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButtonEmpty: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: 13,
  },

  // ─── DASHBOARD LAYOUT ───
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Cover Image
  coverImageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 0, 20, 0.3)',
  },
  coverPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile Header
  profileHeader: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  businessName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  logoutButtonDash: {
    padding: 10,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.l,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.l,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },

  // Sections
  section: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.m,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  serviceChip: {
    backgroundColor: 'rgba(224, 170, 255, 0.1)',
    borderColor: theme.colors.secondary,
  },
  serviceChipText: {
    color: theme.colors.secondary,
  },
  emptyChipText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Edit Button
  editButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.l,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.m,
  },
  editButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
