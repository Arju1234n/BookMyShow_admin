import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { 
  LayoutDashboard, 
  Film, 
  MapPin, 
  CalendarDays, 
  Ticket, 
  LogOut 
} from 'lucide-react';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <Ticket className="text-accent" size={28} />
            BookMyShow
          </h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/movies" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Film size={20} />
            Manage Movies
          </NavLink>
          <NavLink to="/theatres" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <MapPin size={20} />
            Manage Theatres
          </NavLink>
          <NavLink to="/shows" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <CalendarDays size={20} />
            Manage Shows
          </NavLink>
          <NavLink to="/bookings" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Ticket size={20} />
            View Bookings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
