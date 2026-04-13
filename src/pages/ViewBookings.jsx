import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <>
      <div className="topbar">
        <h1 className="page-title">Booking Transactions</h1>
      </div>
      
      <div className="content-wrapper">
        <div className="table-container">
          <div className="table-header-action">
            <h3>Recent Bookings</h3>
            <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
              Total: {bookings.length} bookings
            </span>
          </div>
          
          {loading ? (
            <div style={{padding: '2rem'}}>Loading bookings...</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Movie</th>
                    <th>User</th>
                    <th>Theatre</th>
                    <th>Show Time</th>
                    <th>Tickets</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.booking_id}>
                      <td><span style={{color: 'var(--accent)', fontWeight: 600}}>#{booking.booking_id}</span></td>
                      <td style={{fontWeight: 600, color: 'white'}}>{booking.movie_title}</td>
                      <td>
                        <div>{booking.user_name}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{booking.email}</div>
                      </td>
                      <td>{booking.theatre_name}</td>
                      <td>{new Date(booking.show_time).toLocaleString()}</td>
                      <td>
                        <span style={{
                          background: 'rgba(99,102,241,0.15)',
                          color: '#818cf8',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}>
                          {booking.ticket_count || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          color: '#fbbf24'
                        }}>
                          {booking.seat_numbers || '—'}
                        </span>
                      </td>
                      <td style={{color: 'var(--success)', fontWeight: 600}}>₹{booking.total_amount}</td>
                      <td style={{fontSize: '0.82rem', color: 'var(--text-muted)'}}>
                        {new Date(booking.booking_date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{textAlign: 'center'}}>No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
