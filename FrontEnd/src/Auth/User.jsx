// Example User.jsx implementation
const API_URL = 'http://localhost:3000';

export async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    return [response.status, data];
  } catch (error) {
    console.error('Login error:', error);
    return [500, { message: 'Network error' }];
  }
}

export async function getUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [401, { message: 'No token' }];
    
    const response = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    const data = await response.json();
    return [response.status, data];
  } catch (error) {
    console.error('Get user error:', error);
    return [500, { message: 'Network error' }];
  }
}