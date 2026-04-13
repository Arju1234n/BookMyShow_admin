import React, { useEffect, useState } from 'react';
import { Film, MapPin, CalendarDays, Ticket, Users, DollarSign } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/bookings')
        ]);
        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = stats ? [
    { icon: <Film />, label: 'Total Movies', value: stats.total_movies, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: <MapPin />, label: 'Total Theatres', value: stats.total_theatres, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: <CalendarDays />, label: 'Active Shows', value: stats.total_shows, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: <Ticket />, label: 'Total Bookings', value: stats.total_bookings, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { icon: <Users />, label: 'Registered Users', value: stats.total_users, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { icon: <DollarSign />, label: 'Total Revenue', value: `₹${Number(stats.total_revenue).toLocaleString()}`, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  ] : [];

  return (
    <>
      <div className="topbar">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>
      
      <div className="content-wrapper">
        {loading ? (
          <div>Loading statistics...</div>
        ) : (
          <div className="stats-grid">
            {statCards.map((card, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon" style={{color: card.color, background: card.bg}}>
                  {card.icon}
                </div>
                <div className="stat-info">
                  <h3>{card.label}</h3>
                  <p>{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Bookings Activity */}
        <div className="table-container">
          <div className="table-header-action">
            <h3>Recent Booking Activity</h3>
            <span style={{color: 'var(--text-muted)', fontSize: '0.82rem'}}>Last 5 bookings</span>
          </div>
          {recentBookings.length === 0 ? (
            <div style={{padding: '2rem', color: 'var(--text-muted)'}}>No bookings yet.</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.booking_id}>
                      <td><span style={{color: 'var(--accent)', fontWeight: 600}}>#{b.booking_id}</span></td>
                      <td>{b.user_name}</td>
                      <td style={{fontWeight: 600, color: 'white'}}>{b.movie_title}</td>
                      <td><span style={{fontFamily: 'monospace', color: '#fbbf24', fontSize: '0.82rem'}}>{b.seat_numbers || '—'}</span></td>
                      <td style={{color: 'var(--success)', fontWeight: 600}}>₹{b.total_amount}</td>
                      <td style={{fontSize: '0.82rem', color: 'var(--text-muted)'}}>{new Date(b.booking_date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
