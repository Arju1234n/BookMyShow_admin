import React, { useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import api from '../utils/api';

export default function ManageTheatres() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  const fetchTheatres = async () => {
    try {
      const res = await api.get('/theatres');
      setTheatres(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const openAddModal = () => {
    setEditingTheatre(null);
    setFormData({ name: '', location: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (theatre) => {
    setEditingTheatre(theatre);
    setFormData({ name: theatre.name, location: theatre.location });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingTheatre) {
        await api.put(`/theatres/${editingTheatre.theatre_id}`, formData);
      } else {
        await api.post('/theatres', formData);
      }
      setShowModal(false);
      fetchTheatres();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save theatre');
    }
  };

  return (
    <>
      <div className="topbar">
        <h1 className="page-title">Manage Theatres</h1>
      </div>
      
      <div className="content-wrapper">
        <div className="table-container">
          <div className="table-header-action">
            <h3>Theatre Directory ({theatres.length} total)</h3>
            <button className="btn-add" onClick={openAddModal}>
              <Plus size={18} />
              Add Theatre
            </button>
          </div>
          
          {loading ? (
            <div style={{padding: '2rem'}}>Loading theatres...</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Theatre ID</th>
                    <th>Theatre Name</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {theatres.map(theatre => (
                    <tr key={theatre.theatre_id}>
                      <td>#{theatre.theatre_id}</td>
                      <td style={{fontWeight: 600, color: 'white'}}>{theatre.name}</td>
                      <td>{theatre.location}</td>
                      <td>
                        <button
                          onClick={() => openEditModal(theatre)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                            border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px',
                            padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
                          }}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {theatres.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center'}}>No theatres found.</td>
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
              <h2>{editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Theatre Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. PVR Cinemas" />
                </div>
                <div className="input-group">
                  <label>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required placeholder="e.g. City Mall, Mumbai" />
                </div>
                <button type="submit" className="btn-primary">
                  {editingTheatre ? 'Update Theatre' : 'Save Theatre'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
