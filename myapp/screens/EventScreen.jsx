import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar,
} from 'react-native';

const CATEGORY_COLORS = {
  Music: '#e91e8c', Tech: '#00bcd4', Sports: '#4caf50',
  Food: '#ff9800', Art: '#9c27b0', Comedy: '#ffeb3b',
  Business: '#2196f3',
};
const CATEGORY_EMOJIS = {
  Music: '🎵', Tech: '💻', Sports: '⚽', Food: '🍕',
  Art: '🎨', Comedy: '😂', Business: '💼',
};

export default function EventScreen({ navigation, route }) {
  const { event, token } = route.params;
  const catColor = CATEGORY_COLORS[event.category] || '#6c47ff';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatPrice = (price) => price === 0 ? 'FREE' : `₹${price.toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: catColor }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.bannerEmoji}>{CATEGORY_EMOJIS[event.category] || '🎟️'}</Text>
          <View style={styles.bannerOverlay}>
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>{event.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title + Price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={[styles.pricePill, { backgroundColor: catColor }]}>
              <Text style={styles.priceText}>{formatPrice(event.price)}</Text>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🪑</Text>
              <Text style={styles.infoLabel}>Available Seats</Text>
              <Text style={styles.infoValue}>{event.available_seats.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Pricing Summary */}
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Pricing Summary</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Ticket Price</Text>
              <Text style={styles.pricingValue}>{formatPrice(event.price)}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Platform Fee</Text>
              <Text style={styles.pricingValue}>₹0</Text>
            </View>
            <View style={[styles.pricingRow, styles.pricingTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={[styles.totalValue, { color: catColor }]}>{formatPrice(event.price)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomPrice}>{formatPrice(event.price)}</Text>
          <Text style={styles.bottomSub}>per ticket</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: catColor }, event.available_seats === 0 && styles.bookBtnDisabled]}
          onPress={() => {
            if (event.available_seats === 0) return;
            navigation.navigate('Payment', { event, token, _prev: 'Event' });
          }}
          disabled={event.available_seats === 0}
        >
          <Text style={styles.bookBtnText}>
            {event.available_seats === 0 ? 'Sold Out' : 'Book Ticket 🎟️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  banner: { height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backBtn: { position: 'absolute', top: 48, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bannerEmoji: { fontSize: 80 },
  bannerOverlay: { position: 'absolute', bottom: 12, left: 16 },
  catBadge: { backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  catBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  content: { padding: 20, paddingBottom: 100 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '900', color: '#fff', lineHeight: 30 },
  pricePill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  priceText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  infoGrid: { gap: 10, marginBottom: 24 },
  infoCard: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2a2a45' },
  infoIcon: { fontSize: 20, marginBottom: 4 },
  infoLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#fff', fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 10 },
  description: { fontSize: 14, color: '#aaa', lineHeight: 22 },

  pricingCard: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a2a45' },
  pricingTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 12 },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pricingLabel: { color: '#888', fontSize: 14 },
  pricingValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  pricingTotal: { borderTopWidth: 1, borderTopColor: '#2a2a45', paddingTop: 10, marginTop: 4 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a1a2e', padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#2a2a45',
  },
  bottomLeft: {},
  bottomPrice: { fontSize: 22, fontWeight: '900', color: '#fff' },
  bottomSub: { fontSize: 12, color: '#888' },
  bookBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  bookBtnDisabled: { backgroundColor: '#444' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});