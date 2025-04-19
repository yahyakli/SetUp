import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      
      if (token) {
        try {
          // In a real app, you would fetch user data from your API
          // For now, we'll use mock data
          // const response = await axios.get('/api/user/me', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          
          // Mock user data
          setUser({
            id: 1,
            name: 'Admin User',
            email: 'admin@setup.com',
            role: 'admin'
          });
        } catch (err) {
          console.error('Authentication error:', err);
          Cookies.remove('token');
          setError('Authentication failed. Please login again.');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      // In a real app, you would make an API call here
      // const response = await axios.post('/api/auth/login', credentials);
      
      // Mock successful login
      const mockToken = 'mock-jwt-token-12345';
      Cookies.set('token', mockToken, { expires: 7 }); // Expires in 7 days
      
      setUser({
        id: 1,
        name: 'Admin User',
        email: credentials.email,
        role: 'admin'
      });
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 