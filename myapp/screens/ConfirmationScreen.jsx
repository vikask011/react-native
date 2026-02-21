import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, StatusBar,
} from 'react-native';

const CATEGORY_COLORS = {
  Music: '#e91e8c', Tech: '#00bcd4', Sports: '#4caf50',
  Food: '#ff9800', Art: '#9c27b0', Comedy: '#ffeb3b',
  Business: '#2196f3',
};

export default function ConfirmationScreen({ navigation, route }) {
  const { event, bookingId, paymentId, amount } = route.params;
  const token = route.params.token;
  const catColor = CATEGORY_COLORS[event?.category] || '#6c47ff';

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 5 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => price === 0 ? 'FREE' : `₹${Number(price).toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View style={styles.successSection}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.successEmoji}>✅</Text>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>Your ticket has been booked successfully</Text>
          </Animated.View>
        </View>

        {/* Ticket Card */}
        <Animated.View style={[styles.ticketCard, { opacity: fadeAnim }]}>
          {/* Ticket Top */}
          <View style={[styles.ticketHeader, { backgroundColor: catColor }]}>
            <Text style={styles.ticketHeaderEmoji}>🎟️</Text>
            <Text style={styles.ticketHeaderText}>YOUR TICKET</Text>
          </View>

          {/* Ticket Body */}
          <View style={styles.ticketBody}>
            <Text style={styles.ticketEventName}>{event?.title}</Text>

            <View style={styles.ticketDivider}>
              <View style={styles.ticketDividerLine} />
              <Text style={styles.ticketDividerText}>✂</Text>
              <View style={styles.ticketDividerLine} />
            </View>

            <View style={styles.ticketDetails}>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>📅  Date</Text>
                <Text style={styles.ticketDetailValue}>{formatDate(event?.date)}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>📍  Venue</Text>
                <Text style={styles.ticketDetailValue}>{event?.location}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>💰  Amount Paid</Text>
                <Text style={[styles.ticketDetailValue, { color: catColor, fontWeight: '800' }]}>
                  {formatPrice(amount)}
                </Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>🔖  Booking ID</Text>
                <Text style={styles.ticketDetailValue}>#{bookingId || 'N/A'}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>💳  Payment ID</Text>
                <Text style={[styles.ticketDetailValue, { fontSize: 11 }]}>{paymentId || 'N/A'}</Text>
              </View>
            </View>

            {/* QR Placeholder */}
            <View style={styles.qrBox}>
              <Text style={styles.qrEmoji}>▪▫▪▫▪{'\n'}▫▪▫▪▫{'\n'}▪▫▪▫▪</Text>
              <Text style={styles.qrLabel}>Show this at the venue</Text>
            </View>
          </View>

          {/* Ticket Footer */}
          <View style={[styles.ticketFooter, { backgroundColor: catColor + '22' }]}>
            <Text style={styles.ticketFooterText}>✨ Enjoy the event!</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile', { token, _prev: 'Confirmation' })}
          >
            <Text style={styles.profileBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: catColor }]}
            onPress={() => navigation.navigate('Home', { ...route.params, _prev: 'Confirmation' })}
          >
            <Text style={styles.homeBtnText}>Explore More Events →</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  successSection: { alignItems: 'center', marginBottom: 32 },
  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1a2e1a', borderWidth: 3, borderColor: '#4caf50',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 6 },
  successSubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },

  ticketCard: {
    backgroundColor: '#1a1a2e', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2a2a45', marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  ticketHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketHeaderEmoji: { fontSize: 24 },
  ticketHeaderText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 2 },

  ticketBody: { padding: 20 },
  ticketEventName: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 16, lineHeight: 26 },

  ticketDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ticketDividerLine: { flex: 1, height: 1, backgroundColor: '#2a2a45', borderStyle: 'dashed' },
  ticketDividerText: { color: '#444', paddingHorizontal: 8, fontSize: 16 },

  ticketDetails: { gap: 12, marginBottom: 20 },
  ticketDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  ticketDetailLabel: { color: '#888', fontSize: 13, flex: 1 },
  ticketDetailValue: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },

  qrBox: { alignItems: 'center', backgroundColor: '#0f0f1a', borderRadius: 12, padding: 16 },
  qrEmoji: { fontSize: 28, color: '#fff', textAlign: 'center', lineHeight: 36, fontFamily: 'monospace', letterSpacing: 4 },
  qrLabel: { color: '#888', fontSize: 12, marginTop: 8 },

  ticketFooter: { padding: 14, alignItems: 'center' },
  ticketFooterText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  actions: { gap: 12 },
  profileBtn: {
    borderRadius: 14, padding: 16, alignItems: 'center',
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2a2a45',
  },
  profileBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  homeBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  homeBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});