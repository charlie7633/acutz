import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF',
  cardSecondary: '#E0AAFF',
  textMuted: '#A0A0A0',
  brandAccent: '#10002B',
  secondaryAccent1: '#5A189A',
};

export const StylistCard = ({ stylist }) => {
  // Safely extract database fields with fallbacks
  const name = stylist.businessName || 'Unknown Stylist';
  const price = stylist.startingPrice !== undefined ? stylist.startingPrice : '--';
  const rating = stylist.rating !== undefined ? stylist.rating.toFixed(1) : 'New';
  const tags = [...(stylist.hairTypes || []), ...(stylist.services || [])];
  
  // Use a fallback image if no image URL is stored in DB yet
  const imageUri = stylist.image || 'https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=300&q=80';

  return (
    <View style={styles.stylistCard}>
      <Image source={{ uri: imageUri }} style={styles.cardImage} />

      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.stylistSubtext}>Stylist Name</Text>
            <Text style={styles.stylistName}>{name}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        <Text style={styles.priceText}>Starts at <Text style={{ fontWeight: 'bold', color: COLORS.white }}>£{price}</Text></Text>

        <View style={styles.tagsContainer}>
          {tags.map((tag, idx) => (
            <View key={`${tag}-${idx}`} style={styles.cardTag}>
              <Text style={styles.cardTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stylistCard: {
    backgroundColor: COLORS.brandAccent,
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent1,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.75,
    marginRight: 15,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 200, resizeMode: 'cover' },
  cardInfo: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  stylistSubtext: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  stylistName: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white, marginLeft: 4 },
  priceText: { fontSize: 14, color: COLORS.textMuted, marginBottom: 15 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  cardTag: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginTop: 5 },
  cardTagText: { fontSize: 12, color: COLORS.cardSecondary, fontWeight: '600' }
});
