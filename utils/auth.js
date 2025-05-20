// Helper functions for authentication

// Set authentication token and user data in both cookies and localStorage
export const setAuthData = (token, userData) => {
  // Set in cookies (for server-side and middleware access)
  document.cookie = `drhouse_auth_token=${token}; path=/; max-age=259200000`; // 30 days
  
  // Also set in localStorage for client-side access
  if (typeof window !== 'undefined') {
    
  
    localStorage.setItem('drhouse_auth_token', token);
    localStorage.setItem('drhouse_user', JSON.stringify(userData));
  }
};

// Clear authentication data on logout
export const clearAuthData = () => {
  // Clear cookies
  document.cookie = 'drhouse_auth_token=; path=/; max-age=0';
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('drhouse_auth_token');
    localStorage.removeItem('drhouse_user');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!localStorage.getItem('drhouse_auth_token');
};

// Get user data
export const getUserData = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userData = localStorage.getItem('drhouse_user');
  return userData ? JSON.parse(userData) : null;
};
