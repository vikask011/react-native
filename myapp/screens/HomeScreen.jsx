import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, RefreshControl,
  StatusBar, ScrollView,
} from 'react-native';

const BASE_URL = 'https://react-native-ebon-five.vercel.app';

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Food', 'Art', 'Comedy', 'Business'];
const CATEGORY_EMOJIS = {
  All: '✨', Music: '🎵', Tech: '💻', Sports: '⚽',
  Food: '🍕', Art: '🎨', Comedy: '😂', Business: '💼',
};
const CATEGORY_COLORS = {
  Music: '#e91e8c', Tech: '#00bcd4', Sports: '#4caf50',
  Food: '#ff9800', Art: '#9c27b0', Comedy: '#ffeb3b',
  Business: '#2196f3', All: '#6c47ff',
};

export default function HomeScreen({ navigation, route }) {
  const { token, name } = route.params;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchEvents = useCallback(async (searchVal = '', category = 'All') => {
    try {
      let url = `${BASE_URL}/events?`;
      if (searchVal.trim()) url += `search=${encodeURIComponent(searchVal.trim())}&`;
      if (category !== 'All') url += `category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(search, selectedCategory); }, [selectedCategory]);

  const handleSearch = (text) => {
    setSearch(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => fetchEvents(text, selectedCategory), 500);
    setSearchTimeout(t);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents(search, selectedCategory);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => price === 0 ? 'FREE' : `₹${price.toLocaleString('en-IN')}`;

  const renderEvent = ({ item }) => {
    const catColor = CATEGORY_COLORS[item.category] || '#6c47ff';
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('Event', { event: item, token, _prev: 'Home' })}
        activeOpacity={0.85}
      >
        {/* Color Banner */}
        <View style={[styles.eventBanner, { backgroundColor: catColor }]}>
          <Text style={styles.bannerEmoji}>{CATEGORY_EMOJIS[item.category] || '🎟️'}</Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{formatPrice(item.price)}</Text>
          </View>
        </View>

        <View style={styles.eventBody}>
          <View style={styles.categoryRow}>
            <View style={[styles.catTag, { backgroundColor: catColor + '22', borderColor: catColor }]}>
              <Text style={[styles.catTagText, { color: catColor }]}>{item.category}</Text>
            </View>
            <Text style={styles.seatsText}>🪑 {item.available_seats} left</Text>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.eventMeta}>
            <Text style={styles.metaText}>📅 {formatDate(item.date)}</Text>
            <Text style={styles.metaText}>📍 {item.location}</Text>
          </View>

          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: catColor }]}
            onPress={() => navigation.navigate('Event', { event: item, token, _prev: 'Home' })}
          >
            <Text style={styles.bookBtnText}>Book Tickets →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>Find your next event</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile', { token, _prev: 'Home' })}
          >
            <Text style={styles.profileInitial}>{name?.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, locations..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesBar}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] || '#6c47ff', borderColor: CATEGORY_COLORS[cat] || '#6c47ff' }]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={styles.catEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6c47ff" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6c47ff" colors={['#6c47ff']} />}
          ListHeaderComponent={
            events.length > 0 ? <Text style={styles.resultsText}>{events.length} event{events.length > 1 ? 's' : ''} found</Text> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎭</Text>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>{search ? 'Try a different search term' : 'Check back later'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    backgroundColor: '#1a1a2e', paddingTop: 48, paddingHorizontal: 20,
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a45',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 13, color: '#888', marginTop: 2 },
  profileBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#6c47ff',
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitial: { color: '#fff', fontSize: 18, fontWeight: '800' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f0f1a',
    borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2a2a45',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 12 },
  clearText: { color: '#888', fontSize: 16, paddingLeft: 8 },
  categoriesBar: { maxHeight: 56 },
  categoriesScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  catChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#2a2a45', gap: 4,
  },
  catEmoji: { fontSize: 13 },
  catText: { fontSize: 12, color: '#888', fontWeight: '600' },
  catTextActive: { color: '#fff' },
  resultsText: { color: '#888', fontSize: 13, paddingHorizontal: 16, marginBottom: 8, marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },

  eventCard: {
    backgroundColor: '#1a1a2e', borderRadius: 18, marginBottom: 20,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a45',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  eventBanner: {
    height: 120, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bannerEmoji: { fontSize: 56 },
  priceBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4,
    paddingHorizontal: 10, borderRadius: 20,
  },
  priceBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  eventBody: { padding: 16 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catTag: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1 },
  catTagText: { fontSize: 11, fontWeight: '700' },
  seatsText: { fontSize: 12, color: '#888' },
  eventTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 6 },
  eventDesc: { fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 10 },
  eventMeta: { gap: 4, marginBottom: 14 },
  metaText: { fontSize: 12, color: '#aaa' },
  bookBtn: {
    borderRadius: 10, padding: 13, alignItems: 'center',
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { color: '#888', marginTop: 12, fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 32 },
});