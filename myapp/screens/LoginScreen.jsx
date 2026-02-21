import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';

const BASE_URL = 'http://10.0.2.2:8000';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Invalid credentials');
        return;
      }
      navigation.replace('Home', {
        token: data.access_token,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        _prev: 'Login',
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
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎟️</Text>
          </View>
          <Text style={styles.appName}>EventBook</Text>
          <Text style={styles.tagline}>Discover & Book Amazing Events</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#6c47ff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#6c47ff', shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 13, color: '#888', marginTop: 4 },
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
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeBtn: { paddingHorizontal: 10 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: '#6c47ff', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#6c47ff', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { color: '#888', fontSize: 14 },
  registerLink: { color: '#6c47ff', fontSize: 14, fontWeight: '700' },
});