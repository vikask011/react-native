import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';

const BASE_URL = 'https://react-native-ebon-five.vercel.app';

const CATEGORY_COLORS = {
  Music: '#e91e8c', Tech: '#00bcd4', Sports: '#4caf50',
  Food: '#ff9800', Art: '#9c27b0', Comedy: '#ffeb3b',
  Business: '#2196f3',
};

export default function PaymentScreen({ navigation, route }) {
  const { event, token } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const catColor = CATEGORY_COLORS[event.category] || '#6c47ff';

  const formatPrice = (price) => price === 0 ? 'FREE' : `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const handlePayment = async () => {
    setError('');
    setLoading(true);
    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch(`${BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ event_id: event.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.detail || 'Failed to create order');
        return;
      }

      // Step 2: Simulate payment (test mode — no real Razorpay SDK)
      // In production, replace with: RazorpayCheckout.open({ key, order_id, ... })
      const fakePaymentId = 'pay_test_' + Date.now();

      // Step 3: Confirm booking via test endpoint (skips signature check)
      const confirmRes = await fetch(`${BASE_URL}/payment/confirm-test`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: fakePaymentId,
        }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        setError(confirmData.detail || 'Booking confirmation failed');
        return;
      }

      // Step 4: Navigate to Confirmation screen
      navigation.replace('Confirmation', {
        event,
        token,
        bookingId: confirmData.booking_id,
        paymentId: fakePaymentId,
        amount: event.price,
        _prev: 'Payment',
      });
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Summary Card */}
        <View style={styles.eventCard}>
          <View style={[styles.eventCardBanner, { backgroundColor: catColor }]}>
            <Text style={styles.eventCardEmoji}>🎟️</Text>
          </View>
          <View style={styles.eventCardBody}>
            <Text style={styles.eventCardTitle}>{event.title}</Text>
            <Text style={styles.eventCardMeta}>📅 {formatDate(event.date)}</Text>
            <Text style={styles.eventCardMeta}>📍 {event.location}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>1x Ticket</Text>
            <Text style={styles.summaryValue}>{formatPrice(event.price)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Convenience Fee</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST</Text>
            <Text style={styles.summaryValue}>Included</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: catColor }]}>{formatPrice(event.price)}</Text>
          </View>
        </View>

        {/* Test Mode Notice */}
        <View style={styles.testNotice}>
          <Text style={styles.testNoticeIcon}>🧪</Text>
          <Text style={styles.testNoticeText}>
            Running in Razorpay Test Mode. No real money will be charged.
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          <Text style={styles.paymentTitle}>Pay Via</Text>
          {['💳  Credit / Debit Card', '🏦  Net Banking', '📱  UPI', '💰  Razorpay Wallet'].map((m, i) => (
            <View key={i} style={styles.paymentOption}>
              <Text style={styles.paymentOptionText}>{m}</Text>
              <Text style={styles.paymentOptionCheck}>✓</Text>
            </View>
          ))}
        </View>

        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: catColor }, loading && styles.payBtnDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Pay {formatPrice(event.price)} →</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>🔒 Secured by Razorpay</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#1a1a2e', borderBottomWidth: 1, borderBottomColor: '#2a2a45',
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#2a2a45', borderRadius: 20 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  content: { padding: 20, paddingBottom: 120 },

  eventCard: { backgroundColor: '#1a1a2e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a45', marginBottom: 20 },
  eventCardBanner: { height: 80, alignItems: 'center', justifyContent: 'center' },
  eventCardEmoji: { fontSize: 40 },
  eventCardBody: { padding: 14 },
  eventCardTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 6 },
  eventCardMeta: { fontSize: 13, color: '#888', marginBottom: 3 },

  summaryCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a2a45', marginBottom: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#888', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#2a2a45', paddingTop: 12, marginTop: 4 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },

  testNotice: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a2a1a',
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2a4a2a', marginBottom: 16, gap: 8,
  },
  testNoticeIcon: { fontSize: 18 },
  testNoticeText: { flex: 1, color: '#4caf50', fontSize: 12, fontWeight: '600' },

  paymentMethods: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a2a45', marginBottom: 16 },
  paymentTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 12 },
  paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a45' },
  paymentOptionText: { color: '#ccc', fontSize: 14 },
  paymentOptionCheck: { color: '#4caf50', fontSize: 16, fontWeight: '800' },

  errorBox: { backgroundColor: '#3d1a1a', borderWidth: 1, borderColor: '#ff4444', borderRadius: 10, padding: 12, marginTop: 8 },
  errorText: { color: '#ff6666', fontSize: 13, fontWeight: '600' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a2e', padding: 16, borderTopWidth: 1, borderTopColor: '#2a2a45' },
  payBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 8 },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  secureText: { color: '#888', fontSize: 12, textAlign: 'center' },
});