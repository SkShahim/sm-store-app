import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';

export default function OrderConfirmationScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.subtitle}>Order ID: {orderId}</Text>
      <Text style={styles.note}>S.M Store will confirm and deliver to your address soon.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.btnText}>Continue Shopping</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.link}>View my orders</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  note: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 24 },
  btnText: { color: colors.white, fontWeight: '700' },
  link: { color: colors.accent, marginTop: 14, fontWeight: '600' }
});
