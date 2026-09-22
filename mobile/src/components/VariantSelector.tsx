import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Variant } from '../types';
import { colors } from '../theme/colors';

interface Props {
  variants: Variant[];
  selected: Variant;
  onSelect: (v: Variant) => void;
}

export default function VariantSelector({ variants, selected, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {variants.map((v) => {
        const active = v._id === selected._id;
        return (
          <TouchableOpacity
            key={v._id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(v)}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {v.quantity} {v.unit}
            </Text>
            <Text style={[styles.chipPrice, active && styles.chipLabelActive]}>
              ₹{v.price}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: colors.surface
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accentLight
  },
  chipLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  chipPrice: { fontSize: 13, color: colors.textPrimary, fontWeight: '700' },
  chipLabelActive: { color: colors.primaryDark }
});
