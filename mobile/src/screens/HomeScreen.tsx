import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Product } from '../types';
import { fetchProducts } from '../services/api';
import { colors, SERVICEABLE_PINCODE, MIN_ORDER_VALUE } from '../theme/colors';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';

const CATEGORIES = ['All', 'Rice & Grains', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Oil & Ghee', 'Spices & Masala', 'Snacks', 'Beverages', 'Household'];

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const totalCount = useCartStore((s) => s.totalCount());

  const load = async () => {
    setLoading(true);
    try {
      const { products } = await fetchProducts({
        ...(category !== 'All' ? { category } : {}),
        ...(search ? { search } : {})
      });
      setProducts(products);
    } catch (e) {
      // ignore for brevity — show a toast/snackbar in production
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [category, search]);

  const grouped = CATEGORIES.slice(1).map((cat) => ({
    category: cat,
    items: products.filter((p) => p.category === cat)
  })).filter((g) => g.items.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>S.M Store</Text>
          <Text style={styles.deliveryNote}>Delivering to {SERVICEABLE_PINCODE} only</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartBtnText}>🛒 {totalCount}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search chal, alu, tel..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          🛵 Delivering only to {SERVICEABLE_PINCODE} · Minimum order ₹{MIN_ORDER_VALUE}
        </Text>
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item && styles.catChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.catChipText, category === item && styles.catChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={category === 'All' ? grouped : [{ category, items: products }]}
        keyExtractor={(g) => g.category}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item: group }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{group.category}</Text>
            <FlatList
              horizontal
              data={group.items}
              keyExtractor={(p) => p._id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item._id })} />
              )}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  brand: { fontSize: 22, fontWeight: '800', color: colors.primary },
  deliveryNote: { fontSize: 11, color: colors.textSecondary },
  cartBtn: { backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  cartBtnText: { color: colors.white, fontWeight: '700' },
  search: {
    marginTop: 10, backgroundColor: colors.surface, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.border
  },
  banner: {
    marginTop: 8, backgroundColor: colors.accentLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.accent
  },
  bannerText: { fontSize: 11, color: colors.primaryDark, fontWeight: '600', textAlign: 'center' },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: colors.white },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }
});
