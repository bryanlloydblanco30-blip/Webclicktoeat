const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clicktoeat-pw67.onrender.com';


// ==================== HELPER FUNCTIONS ====================

// Generic fetch wrapper WITHOUT CSRF
async function apiFetch(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return response;
}

// Get or create session ID (for guest users)
function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Helper function to get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check user role
export function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Signup
// Signup - Improved error handling
export async function signup(username, email, password, role = 'member', foodPartner = '', fullName = '', srCode = '') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        email,
        password,
        role,
        food_partner: foodPartner,
        full_name: fullName,
        sr_code: srCode
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse signup response:', responseText);
      throw new Error('Server returned invalid response');
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

// Login - Simplified without CSRF
// Login - Improved error handling
export async function login(username, password) {
  try {
    console.log('🔐 Login attempt:', username);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    // Get response text first to debug
    const responseText = await response.text();
    console.log('📡 Response body:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', responseText);
      throw new Error('Server returned invalid response. Please check backend logs.');
    }

    if (!response.ok) {
      console.error('❌ Login failed:', data);
      throw new Error(data.error || 'Login failed');
    }

    console.log('✅ Login successful:', data);

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('authToken', 'authenticated-' + Date.now());
    }

    return data;
    
  } catch (err) {
    console.error('❌ Login exception:', err);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}
// Logout
export async function logout() {
  const response = await apiFetch('/api/auth/logout/', {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  
  return response.json();
}

// Check authentication status
export async function checkAuth() {
  try {
    const response = await apiFetch('/api/auth/check/');
    
    if (!response.ok) {
      localStorage.removeItem('user');
      return { authenticated: false, user: null };
    }
    
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('user');
    }
    
    return data;
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('user');
    return { authenticated: false, user: null };
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const data = await checkAuth();
    return data.authenticated === true;
  } catch (error) {
    return false;
  }
}

// ==================== CART FUNCTIONS ====================

export async function getCart() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/cart/?session_id=${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }
  return response.json();
}

export async function addToCart(menuItemId, quantity = 1) {
  const response = await apiFetch('/api/cart/add/', {
    method: 'POST',
    body: JSON.stringify({
      menu_item_id: menuItemId,
      quantity: quantity,
      session_id: getSessionId()
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add to cart');
  }
  return response.json();
}

export async function updateCartItem(itemId, quantity) {
  const response = await apiFetch(`/api/cart/update/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }
  return response.json();
}

export async function removeFromCart(itemId) {
  const response = await apiFetch(`/api/cart/remove/${itemId}/`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove from cart');
  }
  return response.json();
}

// ==================== ORDER FUNCTIONS ====================

// ==================== ORDER FUNCTIONS ====================

export async function createOrder(orderData) {
  const response = await apiFetch('/api/orders/create/', {
    method: 'POST',
    body: JSON.stringify({
      ...orderData,
      session_id: getSessionId()
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return response.json();
}

export async function cancelOrderAdmin(orderId) {
  const response = await apiFetch(`/api/orders/cancel/${orderId}/`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel order');
  }
  return response.json();
}

export async function cancelOrder(orderId) {
  const response = await apiFetch(`/api/orders/cancel/${orderId}/`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel order');
  }
  return response.json();
}


export async function getOrders() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/orders/?session_id=${sessionId}`);
  
  if (response.status === 401) {
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}


// ==================== FAVORITE FUNCTIONS ====================

export async function addFavorite(menuItemId) {
  const response = await apiFetch('/api/favorites/add/', {
    method: 'POST',
    body: JSON.stringify({
      menu_item_id: menuItemId,
      session_id: getSessionId()
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add to favorites');
  }
  return response.json();
}

export async function removeFavorite(menuItemId) {
  const sessionId = getSessionId();
  const response = await apiFetch(
    `/api/favorites/remove/?session_id=${sessionId}&menu_item_id=${menuItemId}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to remove from favorites');
  }
  return response.json();
}

export async function getFavorites() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/favorites/?session_id=${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch favorites');
  }
  return response.json();
}

export async function getFavoriteIds() {
  const sessionId = getSessionId();
  const response = await apiFetch(`/api/favorites/ids/?session_id=${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch favorite IDs');
  }
  return response.json();
}

// ==================== MENU FUNCTIONS ====================

export async function getMenuItems() {
  const response = await apiFetch('/api/menu/');
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }
  return response.json();
}

export async function getMenuItemById(id) {
  const response = await apiFetch(`/api/menu/${id}/`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch menu item');
  }
  
  return response.json();
}

// ==================== FOOD PARTNER FUNCTIONS ====================

export async function getFoodPartners() {
  const response = await apiFetch('/api/partners/');
  
  if (!response.ok) throw new Error('Failed to fetch partners');
  return response.json();
}

export async function getPartnerMenuItems(partnerName) {
  if (!partnerName || partnerName === 'undefined') {
    console.error('Invalid partner name:', partnerName);
    throw new Error('Partner name is required');
  }
  
  const encodedName = encodeURIComponent(partnerName);
  const response = await apiFetch(`/api/partners/${encodedName}/menu/`);
  
  if (!response.ok) {
    console.error('Failed to fetch partner menu. Status:', response.status);
    throw new Error('Failed to fetch partner menu');
  }
  
  return response.json();
}

// ==================== ADMIN FUNCTIONS ====================

export async function getAllMenuItemsAdmin() {
  const response = await apiFetch('/api/admin/menu/');
  
  if (!response.ok) {
    throw new Error('Failed to fetch admin menu items');
  }
  return response.json();
}

export async function createMenuItem(itemData) {
  const response = await apiFetch('/api/admin/menu/create/', {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
}

export async function updateMenuItem(itemId, itemData) {
  const response = await apiFetch(`/api/admin/menu/update/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify(itemData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
  return response.json();
}

export async function deleteMenuItem(itemId) {
  const response = await apiFetch(`/api/admin/menu/delete/${itemId}/`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
  return response.json();
}

export async function getAllOrders() {
  const response = await apiFetch('/api/admin/orders/');
  
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function updateOrderStatus(orderId, status) {
  const response = await apiFetch(`/api/admin/orders/${orderId}/status/`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
}