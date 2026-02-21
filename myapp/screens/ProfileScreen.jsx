import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';

const BASE_URL = 'http://10.0.2.2:8000';
const CATEGORY_COLORS = {
  Music: '#e91e8c', Tech: '#00bcd4', Sports: '#4caf50',
  Food: '#ff9800', Art: '#9c27b0', Comedy: '#ffeb3b',
  Business: '#2196f3',
};

export default function ProfileScreen({ navigation, route }) {
  const { token } = route.params;
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          fetch(`${BASE_URL}/profile`, { headers: authHeaders }),
          fetch(`${BASE_URL}/profile/bookings`, { headers: authHeaders }),
        ]);
        const pData = await pRes.json();
        const bData = await bRes.json();
        if (pRes.ok) setProfile(pData);
        if (bRes.ok) setBookings(bData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPrice = (price) => price === 0 ? 'FREE' : `₹${Number(price).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6c47ff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{profile.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            {profile.phone && <Text style={styles.profilePhone}>📱 {profile.phone}</Text>}
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>
                🗓️ Member since {formatDate(profile.created_at)}
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bookings.filter(b => b.status === 'confirmed').length}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              ₹{bookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Bookings */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          {bookings.length === 0 ? (
            <View style={styles.emptyBookings}>
              <Text style={styles.emptyEmoji}>🎟️</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>Book your first event and it will appear here</Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.exploreBtnText}>Explore Events →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bookings.map((booking) => {
              const catColor = CATEGORY_COLORS[booking.event?.category] || '#6c47ff';
              return (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={[styles.bookingAccent, { backgroundColor: catColor }]} />
                  <View style={styles.bookingContent}>
                    <View style={styles.bookingTop}>
                      <Text style={styles.bookingEventName} numberOfLines={2}>
                        {booking.event?.title}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: booking.status === 'confirmed' ? '#1a3a1a' : '#3a2a1a' }]}>
                        <Text style={[styles.statusText, { color: booking.status === 'confirmed' ? '#4caf50' : '#ff9800' }]}>
                          {booking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.bookingMeta}>📅 {formatDate(booking.event?.date)}</Text>
                    <Text style={styles.bookingMeta}>📍 {booking.event?.location}</Text>
                    <View style={styles.bookingBottom}>
                      <Text style={styles.bookingId}>Booking #{booking.id}</Text>
                      <Text style={[styles.bookingAmount, { color: catColor }]}>
                        {formatPrice(booking.amount)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.navigate('Login', {})}
        >
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f1a' },
  loadingText: { color: '#888', marginTop: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#1a1a2e', borderBottomWidth: 1, borderBottomColor: '#2a2a45',
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#2a2a45', borderRadius: 20 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  profileCard: {
    alignItems: 'center', padding: 28,
    backgroundColor: '#1a1a2e', margin: 16, borderRadius: 20,
    borderWidth: 1, borderColor: '#2a2a45',
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#6c47ff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#6c47ff', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#888', marginBottom: 4 },
  profilePhone: { fontSize: 14, color: '#888', marginBottom: 10 },
  memberBadge: { backgroundColor: '#2a2a45', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  memberBadgeText: { color: '#888', fontSize: 12 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a45' },
  statNumber: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center' },

  bookingsSection: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 14 },

  emptyBookings: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  exploreBtn: { backgroundColor: '#6c47ff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  bookingCard: {
    flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 14,
    marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a45',
  },
  bookingAccent: { width: 4 },
  bookingContent: { flex: 1, padding: 14 },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  bookingEventName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bookingMeta: { fontSize: 12, color: '#888', marginBottom: 3 },
  bookingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  bookingId: { fontSize: 11, color: '#555' },
  bookingAmount: { fontSize: 15, fontWeight: '800' },

  logoutBtn: {
    margin: 16, backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#ff4444', marginBottom: 32,
  },
  logoutText: { color: '#ff4444', fontWeight: '700', fontSize: 15 },
});