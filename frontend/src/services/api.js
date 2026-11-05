const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('trackcart_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('trackcart_token');
      localStorage.removeItem('trackcart_user');
      window.dispatchEvent(new Event('trackcart_auth_change'));
    }
  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || (typeof data === 'string' ? data : 'An unexpected error occurred');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    me: () => request('/auth/me'),
  },

  // Orders
  orders: {
    getAll: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`),
    create: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    cancel: (id, reason) => request(`/orders/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    getInvoiceUrl: (id) => `${API_BASE}/orders/${id}/invoice`,
  },

  // Shipments & Tracking
  shipments: {
    track: (trackingNumber) => request(`/shipments/track/${encodeURIComponent(trackingNumber)}`),
    getByOrderId: (orderId) => request(`/shipments/order/${orderId}`),
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/shipments${query ? `?${query}` : ''}`);
    },
    updateStatus: (id, updateData) => request(`/shipments/${id}/status`, { method: 'PUT', body: JSON.stringify(updateData) }),
    assignPartner: (id, partnerId) => request(`/shipments/${id}/assign`, { method: 'POST', body: JSON.stringify({ partnerId }) }),
  },

  // Delivery Partners
  deliveryPartners: {
    getProfile: () => request('/delivery-partners/me'),
    getMyAssignments: () => request('/delivery-partners/my-assignments'),
    getAll: () => request('/delivery-partners'),
    updateAvailability: (isAvailable) => request('/delivery-partners/availability', { method: 'PUT', body: JSON.stringify({ isAvailable }) }),
    updateLocation: (lat, lng) => request('/delivery-partners/location', { method: 'PUT', body: JSON.stringify({ lat, lng }) }),
  },

  // Complaints & Support
  complaints: {
    getAll: () => request('/complaints'),
    getById: (id) => request(`/complaints/${id}`),
    create: (complaintData) => request('/complaints', { method: 'POST', body: JSON.stringify(complaintData) }),
    updateStatus: (id, updateData) => request(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(updateData) }),
  },

  // Analytics & Reports
  analytics: {
    getAdminSummary: () => request('/analytics/admin-summary'),
    getPartnerSummary: () => request('/analytics/partner-summary'),
    getAuditLogs: () => request('/analytics/audit-logs'),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  },

  // Data Seeding Demo Reset
  seed: {
    reset: () => request('/seed/reset', { method: 'POST' }),
  },
};

export default api;
