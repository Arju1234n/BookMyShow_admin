import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import Layout from './components/Layout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ManageMovies from './pages/ManageMovies';
import ManageTheatres from './pages/ManageTheatres';
import ManageShows from './pages/ManageShows';
import ViewBookings from './pages/ViewBookings';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!admin) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { admin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" /> : <AdminLogin />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="movies" element={<ManageMovies />} />
        <Route path="theatres" element={<ManageTheatres />} />
        <Route path="shows" element={<ManageShows />} />
        <Route path="bookings" element={<ViewBookings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
