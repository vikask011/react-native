import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';

const BASE_URL = 'https://react-native-ebon-five.vercel.app';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Registration failed. Try again.');
        return;
      }
      navigation.replace('Home', {
        token: data.access_token,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        _prev: 'Register',
      });
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎟️</Text>
          </View>
          <Text style={styles.appName}>EventBook</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start booking events</Text>

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={(v) => { setName(v); setError(''); }}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
          />

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9999999999"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Min 6 characters"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setError(''); }}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  inner: { flexGrow: 1, padding: 24, paddingTop: 48 },
  header: { alignItems: 'center', marginBottom: 28 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#6c47ff', fontSize: 15, fontWeight: '600' },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#6c47ff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    shadowColor: '#6c47ff', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#2a2a45',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 24 },
  errorBox: {
    backgroundColor: '#3d1a1a', borderWidth: 1, borderColor: '#ff4444',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#ff6666', fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, color: '#ccc', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#0f0f1a', borderWidth: 1, borderColor: '#2a2a45',
    borderRadius: 10, padding: 14, color: '#fff', fontSize: 15, marginBottom: 16,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { paddingHorizontal: 10 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: '#6c47ff', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#6c47ff', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: '#888', fontSize: 14 },
  loginLink: { color: '#6c47ff', fontSize: 14, fontWeight: '700' },
});