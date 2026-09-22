export interface Variant {
  _id: string;
  quantity: number;
  unit: 'gm' | 'kg' | 'ml' | 'l' | 'pcs' | 'pack' | 'dozen';
  price: number;
  mrp?: number;
  stock: number;
  isDefault?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  nameBengali?: string;
  category: string;
  description?: string;
  image: string;
  variants: Variant[];
  isAvailable: boolean;
}

export interface CartLine {
  product: Product;
  variant: Variant;
  count: number;
}

export interface Address {
  _id?: string;
  label: string;
  fullAddress: string;
  pincode: string;
  landmark?: string;
  phone: string;
}

export interface Order {
  _id: string;
  items: {
    name: string;
    variantLabel: string;
    price: number;
    count: number;
  }[];
  itemsTotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: 'UPI' | 'COD';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'placed' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'owner';
}
