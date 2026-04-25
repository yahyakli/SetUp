import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/dashboard/Overview';
import Users from './pages/dashboard/Users';
import Projects from './pages/dashboard/Projects';
import Teams from './pages/dashboard/Teams';
import Subscriptions from './pages/dashboard/Subscriptions';
import Invoices from './pages/dashboard/Invoices';
import Plans from './pages/dashboard/Plans';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Create a component to handle root redirects based on auth state
const RootRedirect = () => {
  const { token, loading } = useAuth();
  
  // While checking auth, show nothing to prevent flashing
  if (loading) return null;
  
  // After auth check, redirect based on token
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <ToastContainer />
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="users" element={<Users />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="teams" element={<Teams />} />
                  <Route path="plans" element={<Plans />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="invoices" element={<Invoices />} />
                </Route>
              </Route>

              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
