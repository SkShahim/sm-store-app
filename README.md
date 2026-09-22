S.M Store — Grocery Delivery App
Pincode-restricted (712310 only) grocery delivery app. You (owner) manage products, each with your own quantity/weight variants and prices (e.g. Chal 500gm ₹20, 1kg ₹38). Minimum order value: ₹1000. Payment: UPI or Cash on Delivery.
Structure
backend/ — Node.js + Express + MongoDB API
mobile/ — React Native (Expo) + TypeScript app
Backend setup
cd backend
npm install
cp .env.example .env   (fill in MONGO_URI, JWT_SECRET, Razorpay keys)
npm run dev
Runs on http://localhost:5000. Key env vars:
ALLOWED_PINCODE=712310 — only this pincode can place orders
MIN_ORDER_VALUE=1000 — orders below this are rejected
Create your owner account
Register once with role "owner" so you can add/edit products from the app's Manage tab:
POST /api/auth/register
{ "name": "Shahim", "phone": "7890181255", "password": "yourpassword", "role": "owner" }
All other registrations default to role "customer".
Adding your products (quantity + price)
Either use the app's Manage tab after logging in as owner, or call the API directly:
POST /api/products (Authorization: Bearer )
{
"name": "Chal (Rice)", "nameBengali": "চাল", "category": "Rice & Grains",
"variants": [
{ "quantity": 500, "unit": "gm", "price": 20 },
{ "quantity": 1, "unit": "kg", "price": 38, "isDefault": true }
]
}
Edit anytime with PUT /api/products/:id — same body shape.
Mobile app setup
cd mobile
npm install
npx expo start
Scan the QR code with Expo Go on your phone, or run npm run android / npm run ios.
Before running, open mobile/src/services/api.ts and set BASE_URL to your backend's address (use your computer's LAN IP, e.g. http://192.168.1.5:5000/api, when testing on a real phone — localhost only works in an emulator on the same machine).
Payment integration (UPI)
The backend already creates a Razorpay order (Razorpay supports UPI, cards, wallets). To finish the mobile side:
npm install react-native-razorpay (already in package.json) and follow its native setup steps for Expo (may need a dev build / expo prebuild, since it's a native module).
In CheckoutScreen.tsx, replace the placeholder alert with an actual RazorpayCheckout.open(...) call using the razorpayOrder.id returned from placeOrder(), then send the result to verifyPayment().
Until that's wired up, choosing "COD" works end-to-end already.
What's included
Pincode 712310 enforced both in the app UI and on the backend (can't be bypassed)
₹1000 minimum order enforced in cart, checkout, and backend
Owner-only "Manage" tab to add/edit products, weight variants, and prices anytime
Full order flow: cart → checkout → place order → confirmation → order history
Green/orange theme matching your existing S.M Store branding
