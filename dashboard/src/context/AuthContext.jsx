import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { USER_SERVICE_URL } from '../../constants';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const storedToken = Cookies.get('token');
        
        if (!storedToken) {
          // No token found, immediately set loading to false
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // We have a token, update the state
        setToken(storedToken);
        
        try {
          const response = await axios.get(`${USER_SERVICE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (response.status === 200) {
            setUser(response.data);
          } else {
            // Invalid token response
            Cookies.remove('token');
            setToken(null);
            setUser(null);
            setError('Authentication failed. Please login again.');
          }
        } catch (err) {
          console.error('Authentication error:', err);
          Cookies.remove('token');
          setToken(null);
          setUser(null);
          setError('Authentication failed. Please login again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Only run on mount, not on token change

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would make an API call here
      const response = await axios.post(`${USER_SERVICE_URL}/api/auth/login`, credentials);

      if (response.status === 200) {
        const responseToken = response.data.token;
        const expires = credentials.rememberMe ? 30 : 7;
        Cookies.set('token', responseToken, { expires });

        setUser(response.data.user);
        setToken(responseToken);
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true); // Start loading to prevent flashing
    Cookies.remove('token');
    setUser(null);
    setToken(null);
    setLoading(false); // End loading
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 