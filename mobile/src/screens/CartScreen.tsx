import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, MIN_ORDER_VALUE } from '../theme/colors';
import { useCartStore } from '../store/cartStore';

export default function CartScreen({ navigation }: any) {
  const { lines, incrementItem, decrementItem, itemsTotal } = useCartStore();
  const total = itemsTotal();
  const deliveryFee = total >= 199 || total === 0 ? 0 : 20;
  const belowMinimum = total < MIN_ORDER_VALUE;

  if (lines.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.shopBtnText}>Browse products</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={lines}
        keyExtractor={(l) => `${l.product._id}-${l.variant._id}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.variant}>{item.variant.quantity} {item.variant.unit} · ₹{item.variant.price} each</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => decrementItem(item.product._id, item.variant._id)} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.count}>{item.count}</Text>
              <TouchableOpacity onPress={() => incrementItem(item.product._id, item.variant._id)} style={styles.stepBtn}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.lineTotal}>₹{item.variant.price * item.count}</Text>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items total</Text>
          <Text style={styles.summaryValue}>₹{total}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery fee</Text>
          <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.grandLabel}>To pay</Text>
          <Text style={styles.grandValue}>₹{total + deliveryFee}</Text>
        </View>
        {belowMinimum && (
          <Text style={styles.minOrderText}>
            Minimum order ₹{MIN_ORDER_VALUE}. Add ₹{MIN_ORDER_VALUE - total} more to checkout.
          </Text>
        )}
        <TouchableOpacity
          style={[styles.checkoutBtn, belowMinimum && styles.checkoutBtnDisabled]}
          onPress={() => !belowMinimum && navigation.navigate('Checkout')}
          disabled={belowMinimum}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  empty: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginBottom: 16 },
  shopBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  shopBtnText: { color: colors.white, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  variant: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  stepBtn: { backgroundColor: colors.surface, borderRadius: 6, width: 26, height: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  stepBtnText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  count: { marginHorizontal: 8, fontWeight: '700' },
  lineTotal: { fontWeight: '700', width: 60, textAlign: 'right' },
  summary: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { color: colors.textSecondary },
  summaryValue: { fontWeight: '600' },
  grandLabel: { fontWeight: '800', fontSize: 16 },
  grandValue: { fontWeight: '800', fontSize: 16, color: colors.primary },
  checkoutBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  checkoutBtnDisabled: { backgroundColor: colors.border },
  checkoutBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  minOrderText: { color: colors.error, fontSize: 12, textAlign: 'center', marginTop: 10 }
});
