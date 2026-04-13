import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    movie_id: '',
    theatre_id: '',
    show_time: '',
    price: ''
  });

  const fetchData = async () => {
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies'),
        api.get('/theatres')
      ]);
      setShows(showsRes.data);
      setMovies(moviesRes.data);
      setTheatres(theatresRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.show_time) {
      setError('Please select a valid date and time for the show.');
      return;
    }

    // datetime-local input gives "2026-03-10T15:30" — MySQL needs "2026-03-10 15:30:00"
    const formattedShowTime = formData.show_time.replace('T', ' ') + ':00';

    try {
      await api.post('/shows', { ...formData, show_time: formattedShowTime });
      setShowModal(false);
      fetchData();
      setFormData({ movie_id: '', theatre_id: '', show_time: '', price: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add show');
    }
  };

  const handleDelete = async (show) => {
    if (!window.confirm(`⚠️ Delete Show #${show.show_id}?\n\nThis will also permanently delete ALL seats for this show. This cannot be undone.`)) return;
    try {
      await api.delete(`/shows/${show.show_id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete show');
    }
  };

  return (
    <>
      <div className="topbar">
        <h1 className="page-title">Manage Shows</h1>
      </div>
      
      <div className="content-wrapper">
        <div className="table-container">
          <div className="table-header-action">
            <h3>Active Bookable Shows</h3>
            <button className="btn-add" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Schedule Show
            </button>
          </div>
          
          {loading ? (
            <div style={{padding: '2rem'}}>Loading shows...</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Show ID</th>
                    <th>Movie</th>
                    <th>Theatre</th>
                    <th>Date &amp; Time</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.map(show => (
                    <tr key={show.show_id}>
                      <td>#{show.show_id}</td>
                      <td style={{fontWeight: 600, color: 'white'}}>{show.title}</td>
                      <td>{show.theatre_name}</td>
                      <td>{new Date(show.show_time).toLocaleString()}</td>
                      <td>₹{show.price}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(show)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(239,68,68,0.12)', color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                            padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem',
                            fontWeight: 600, transition: 'all 0.18s ease'
                          }}
                          onMouseOver={e => { e.currentTarget.style.background='rgba(239,68,68,0.25)'; }}
                          onMouseOut={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shows.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center'}}>No shows scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Schedule a Show</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Select Movie</label>
                  <select value={formData.movie_id} onChange={e => setFormData({...formData, movie_id: e.target.value})} required>
                    <option value="">-- Choose a Movie --</option>
                    {movies.map(m => (
                      <option key={m.movie_id} value={m.movie_id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Select Theatre</label>
                  <select value={formData.theatre_id} onChange={e => setFormData({...formData, theatre_id: e.target.value})} required>
                    <option value="">-- Choose a Theatre --</option>
                    {theatres.map(t => (
                      <option key={t.theatre_id} value={t.theatre_id}>{t.name} - {t.location}</option>
                    ))}
                  </select>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Date & Time</label>
                    <input type="datetime-local" value={formData.show_time} onChange={e => setFormData({...formData, show_time: e.target.value})} required />
                  </div>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Ticket Price (₹)</label>
                    <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Schedule Show</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
