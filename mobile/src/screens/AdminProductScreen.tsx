import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  FlatList, Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { Product } from '../types';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

interface VariantDraft { quantity: string; unit: string; price: string; }

const UNITS = ['gm', 'kg', 'ml', 'l', 'pcs', 'pack', 'dozen'];
const CATEGORIES = ['Rice & Grains', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Oil & Ghee', 'Spices & Masala', 'Snacks', 'Beverages', 'Personal Care', 'Household', 'Other'];

export default function AdminProductScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [nameBengali, setNameBengali] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [variants, setVariants] = useState<VariantDraft[]>([{ quantity: '500', unit: 'gm', price: '' }]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => fetchProducts().then(({ products }) => setProducts(products));
  useEffect(() => { load(); }, []);

  const addVariantRow = () => setVariants([...variants, { quantity: '', unit: 'gm', price: '' }]);
  const updateVariantRow = (i: number, field: keyof VariantDraft, value: string) => {
    setVariants(variants.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  };
  const removeVariantRow = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setName(''); setNameBengali(''); setCategory(CATEGORIES[0]);
    setVariants([{ quantity: '500', unit: 'gm', price: '' }]);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name || variants.some((v) => !v.quantity || !v.price)) {
      Alert.alert('Missing info', 'Product name, and quantity + price for every variant, are required.');
      return;
    }
    const payload = {
      name,
      nameBengali,
      category,
      variants: variants.map((v, idx) => ({
        quantity: Number(v.quantity),
        unit: v.unit,
        price: Number(v.price),
        isDefault: idx === 0
      }))
    };
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      resetForm();
      load();
    } catch (err: any) {
      Alert.alert('Save failed', err.message);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p._id);
    setName(p.name);
    setNameBengali(p.nameBengali || '');
    setCategory(p.category);
    setVariants(p.variants.map((v) => ({ quantity: String(v.quantity), unit: v.unit, price: String(v.price) })));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete product?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteProduct(id); load(); } }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{editingId ? 'Edit Product' : 'Add New Product'}</Text>

        <TextInput style={styles.input} placeholder="Product name (e.g. Chal)" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Bengali name (optional, e.g. চাল)" value={nameBengali} onChangeText={setNameBengali} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.catWrap}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]} onPress={() => setCategory(c)}>
              <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quantity & Price variants</Text>
        {variants.map((v, i) => (
          <View key={i} style={styles.variantRow}>
            <TextInput
              style={[styles.input, styles.variantQty]}
              placeholder="500"
              keyboardType="numeric"
              value={v.quantity}
              onChangeText={(t) => updateVariantRow(i, 'quantity', t)}
            />
            <View style={styles.unitPicker}>
              {UNITS.map((u) => (
                <TouchableOpacity key={u} style={[styles.unitChip, v.unit === u && styles.unitChipActive]} onPress={() => updateVariantRow(i, 'unit', u)}>
                  <Text style={[styles.unitChipText, v.unit === u && styles.unitChipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.variantPrice]}
              placeholder="₹ price"
              keyboardType="numeric"
              value={v.price}
              onChangeText={(t) => updateVariantRow(i, 'price', t)}
            />
            {variants.length > 1 && (
              <TouchableOpacity onPress={() => removeVariantRow(i)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addVariantRow}>
          <Text style={styles.addVariantText}>+ Add another quantity option</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{editingId ? 'Update Product' : 'Save Product'}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel edit</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>Your Catalog</Text>
        <FlatList
          data={products}
          keyExtractor={(p) => p._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productVariants}>
                  {item.variants.map((v) => `${v.quantity}${v.unit} · ₹${v.price}`).join('  |  ')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => startEdit(item)}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 20, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8, fontSize: 13
  },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: colors.white },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  variantQty: { width: 60 },
  variantPrice: { width: 80 },
  unitPicker: { flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 4 },
  unitChip: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  unitChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  unitChipText: { fontSize: 10, color: colors.textSecondary },
  unitChipTextActive: { color: colors.white, fontWeight: '700' },
  removeText: { color: colors.error, fontSize: 16, paddingHorizontal: 4 },
  addVariantText: { color: colors.primary, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: colors.white, fontWeight: '800' },
  cancelText: { color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  productName: { fontWeight: '700', fontSize: 13 },
  productVariants: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  editText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  deleteText: { color: colors.error, fontWeight: '700', fontSize: 12 }
});
