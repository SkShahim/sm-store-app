import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { colors, SERVICEABLE_PINCODE, MIN_ORDER_VALUE } from '../theme/colors';
import { useCartStore } from '../store/cartStore';
import { placeOrder, verifyPayment } from '../services/api';

export default function CheckoutScreen({ navigation }: any) {
  const { lines, itemsTotal, clearCart } = useCartStore();
  const [fullAddress, setFullAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD');
  const [submitting, setSubmitting] = useState(false);

  const total = itemsTotal();
  const deliveryFee = total >= 199 ? 0 : 20;
  const grandTotal = total + deliveryFee;

  const pincodeValid = pincode.trim() === SERVICEABLE_PINCODE;

  const handlePlaceOrder = async () => {
    if (!fullAddress || !phone) {
      Alert.alert('Missing details', 'Please fill in your address and phone number.');
      return;
    }
    if (!pincodeValid) {
      Alert.alert(
        'Out of delivery area',
        `Sorry, S.M Store currently delivers only to pincode ${SERVICEABLE_PINCODE}.`
      );
      return;
    }
    if (total < MIN_ORDER_VALUE) {
      Alert.alert('Minimum order not met', `Minimum order value is ₹${MIN_ORDER_VALUE}.`);
      return;
    }

    setSubmitting(true);
    try {
      const { order, razorpayOrder } = await placeOrder({
        items: lines.map((l) => ({ product: l.product._id, variantId: l.variant._id, count: l.count })),
        deliveryAddress: { fullAddress, pincode, landmark, phone, label: 'Home' } as any,
        paymentMethod
      });

      if (paymentMethod === 'UPI' && razorpayOrder) {
        Alert.alert('Redirecting to UPI payment', 'Complete the payment in the next screen.');
      }

      clearCart();
      navigation.navigate('OrderConfirmation', { orderId: order._id });
    } catch (err: any) {
      Alert.alert('Order failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Delivery Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Full address (house no, street, area)"
          value={fullAddress}
          onChangeText={setFullAddress}
          multiline
        />
        <TextInput
          style={[styles.input, !pincodeValid && pincode.length === 6 && styles.inputError]}
          placeholder="Pincode"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />
        {pincode.length === 6 && !pincodeValid && (
          <Text style={styles.errorText}>Sorry, we only deliver to {SERVICEABLE_PINCODE}.</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Landmark (optional)"
          value={landmark}
          onChangeText={setLandmark}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.title}>Payment Method</Text>
        <View style={styles.payRow}>
          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'UPI' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('UPI')}
          >
            <Text style={[styles.payText, paymentMethod === 'UPI' && styles.payTextActive]}>UPI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'COD' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Text style={[styles.payText, paymentMethod === 'COD' && styles.payTextActive]}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.grandValue}>₹{grandTotal}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeBtn, submitting && { opacity: 0.6 }]}
          onPress={handlePlaceOrder}
          disabled={submitting}
        >
          <Text style={styles.placeBtnText}>{submitting ? 'Placing order...' : `Place Order · ₹${grandTotal}`}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 12, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginBottom: 8, marginTop: -6 },
  payRow: { flexDirection: 'row', gap: 10 },
  payOption: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', backgroundColor: colors.surface
  },
  payOptionActive: { borderColor: colors.primary, backgroundColor: colors.accentLight },
  payText: { fontWeight: '700', color: colors.textSecondary },
  payTextActive: { color: colors.primaryDark },
  summary: { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { color: colors.textSecondary },
  summaryValue: { fontWeight: '600' },
  grandLabel: { fontWeight: '800', fontSize: 16 },
  grandValue: { fontWeight: '800', fontSize: 16, color: colors.primary },
  placeBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  placeBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 }
});
