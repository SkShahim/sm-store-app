import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Product, Variant } from '../types';
import { fetchProduct } from '../services/api';
import { colors } from '../theme/colors';
import VariantSelector from '../components/VariantSelector';
import { useCartStore } from '../store/cartStore';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Variant | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchProduct(id).then(({ product }) => {
      setProduct(product);
      setSelected(product.variants.find((v) => v.isDefault) || product.variants[0]);
    });
  }, [id]);

  if (!product || !selected) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={product.image ? { uri: product.image } : require('../../assets/placeholder.png')}
          style={styles.image}
        />
        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          {product.nameBengali ? <Text style={styles.nameBn}>{product.nameBengali}</Text> : null}
          <Text style={styles.category}>{product.category}</Text>

          <Text style={styles.label}>Select quantity</Text>
          <VariantSelector variants={product.variants} selected={selected} onSelect={setSelected} />

          {product.description ? (
            <>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.price}>₹{selected.price} <Text style={styles.perUnit}>/ {selected.quantity} {selected.unit}</Text></Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { addItem(product, selected); navigation.goBack(); }}
        >
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', height: 240, backgroundColor: colors.surface },
  body: { padding: 16 },
  name: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  nameBn: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  category: { fontSize: 12, color: colors.accent, marginTop: 4, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8, color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderTopWidth: 1, borderTopColor: colors.border
  },
  price: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  perUnit: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: colors.white, fontWeight: '700' }
});
