import { Product, Order, Address } from '../types';

// Point this to your deployed backend, e.g. https://sm-store-api.onrender.com/api
const BASE_URL = 'http://localhost:5000/api';

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => { authToken = token; };

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// ---- Auth ----
export const login = (phone: string, password: string) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });

export const register = (name: string, phone: string, password: string, role: 'customer' | 'owner' = 'customer') =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ name, phone, password, role }) });

export const addAddress = (address: Address) =>
  request('/auth/address', { method: 'POST', body: JSON.stringify(address) });

// ---- Products ----
export const fetchProducts = (params?: { category?: string; search?: string }): Promise<{ products: Product[] }> => {
  const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return request(`/products${qs}`);
};

export const fetchProduct = (id: string): Promise<{ product: Product }> => request(`/products/${id}`);

export const createProduct = (payload: Partial<Product>) =>
  request('/products', { method: 'POST', body: JSON.stringify(payload) });

export const updateProduct = (id: string, payload: Partial<Product>) =>
  request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteProduct = (id: string) =>
  request(`/products/${id}`, { method: 'DELETE' });

// ---- Orders ----
export const placeOrder = (payload: {
  items: { product: string; variantId: string; count: number }[];
  deliveryAddress: Address;
  paymentMethod: 'UPI' | 'COD';
}) => request('/orders', { method: 'POST', body: JSON.stringify(payload) });

export const verifyPayment = (payload: {
  orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
}) => request('/orders/verify-payment', { method: 'POST', body: JSON.stringify(payload) });

export const fetchMyOrders = (): Promise<{ orders: Order[] }> => request('/orders/my');

export const fetchAllOrders = (): Promise<{ orders: Order[] }> => request('/orders');

export const updateOrderStatus = (id: string, status: string) =>
  request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
