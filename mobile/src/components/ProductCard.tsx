import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product, Variant } from '../types';
import { colors } from '../theme/colors';
import VariantSelector from './VariantSelector';
import { useCartStore } from '../store/cartStore';

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const [selected, setSelected] = useState<Variant>(defaultVariant);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={product.image ? { uri: product.image } : require('../../assets/placeholder.png')}
        style={styles.image}
      />
      <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
      {product.nameBengali ? (
        <Text style={styles.nameBn} numberOfLines={1}>{product.nameBengali}</Text>
      ) : null}

      <VariantSelector
        variants={product.variants}
        selected={selected}
        onSelect={setSelected}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => addItem(product, selected)}
      >
        <Text style={styles.addBtnText}>Add · ₹{selected.price}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  image: { width: '100%', height: 90, borderRadius: 8, marginBottom: 6, backgroundColor: colors.surface },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  nameBn: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  addBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 }
});
