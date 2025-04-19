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
      const token = Cookies.get('token');
      setToken(token);
      if (token) {
        try {
          const response = await axios.get(`${USER_SERVICE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.status === 200) {
            setUser(response.data);
          } else {
            Cookies.remove('token');
            setError('Authentication failed. Please login again.');
          }
        } catch (err) {
          console.error('Authentication error:', err);
          Cookies.remove('token');
          setError('Authentication failed. Please login again.');
        } finally {
          setLoading(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      // In a real app, you would make an API call here
      const response = await axios.post(`${USER_SERVICE_URL}/api/auth/login`, credentials);

      if (response.status === 200) {
        const token = response.data.token;
        const expires = credentials.rememberMe ? 30 : 7;
        Cookies.set('token', token, { expires });

        setUser(response.data.user);
        setToken(token);

        setError(null);
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
    Cookies.remove('token');
    setUser(null);
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