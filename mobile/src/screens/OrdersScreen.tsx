import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Order } from '../types';
import { fetchMyOrders } from '../services/api';
import { colors } from '../theme/colors';

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed',
  out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled'
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { fetchMyOrders().then(({ orders }) => setOrders(orders)); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.status}>{STATUS_LABEL[item.status]}</Text>
            </View>
            {item.items.map((it, idx) => (
              <Text key={idx} style={styles.itemLine}>
                {it.name} ({it.variantLabel}) × {it.count}
              </Text>
            ))}
            <View style={styles.rowBetween}>
              <Text style={styles.total}>₹{item.grandTotal}</Text>
              <Text style={styles.payment}>{item.paymentMethod} · {item.paymentStatus}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: colors.textPrimary },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontWeight: '700' },
  status: { color: colors.primary, fontWeight: '700' },
  itemLine: { fontSize: 12, color: colors.textSecondary },
  total: { fontWeight: '800', marginTop: 6 },
  payment: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 }
});
