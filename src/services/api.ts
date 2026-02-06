const API_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://chat-app-backend-a0i1.onrender.com';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async register(email: string, username: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  }

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  }

  async getMe() {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get user');
    return res.json();
  }

  async getRooms() {
    const res = await fetch(`${API_URL}/rooms`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get rooms');
    return res.json();
  }

  async getRoom(id: string) {
    const res = await fetch(`${API_URL}/rooms/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get room');
    return res.json();
  }

  async createRoom(name: string) {
    const res = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  }

  async joinRoom(id: string) {
    const res = await fetch(`${API_URL}/rooms/${id}/join`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to join room');
    return res.json();
  }
}

export const api = new ApiService();
