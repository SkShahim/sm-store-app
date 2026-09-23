import React, { useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { setAuthToken } from './src/services/api';

// After login, set the token and pass whether the logged-in user is the owner (role === 'owner')
// so the "Manage" tab (add/edit products & prices) only shows for you, Shahim.
export default function App() {
  const [isOwner, setIsOwner] = useState(false);

  // Example after a successful login response:
  // setAuthToken(loginResponse.token);
  // setIsOwner(loginResponse.user.role === 'owner');

  return <AppNavigator isOwner={isOwner} />;
}
