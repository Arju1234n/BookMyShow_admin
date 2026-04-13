import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import api from '../utils/api';

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    language: '',
    duration: '',
    release_date: '',
    poster_url: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies');
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Pagination
  const totalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);
  const paginatedMovies = movies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openAddModal = () => {
    setEditingMovie(null);
    setFormData({ title: '', genre: '', language: '', duration: '', release_date: '', poster_url: '' });
    setImageFile(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      genre: movie.genre,
      language: movie.language,
      duration: movie.duration,
      release_date: movie.release_date ? movie.release_date.split('T')[0] : '',
      poster_url: movie.poster_url || ''
    });
    setImageFile(null);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let finalPosterUrl = formData.poster_url;
    
    // Upload image first if one is selected
    if (imageFile) {
      try {
        const uploadData = new FormData();
        uploadData.append('poster', imageFile);
        const uploadRes = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalPosterUrl = api.defaults.baseURL + uploadRes.data.imageUrl;
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to upload picture');
        return;
      }
    }
    
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.movie_id}`, { ...formData, poster_url: finalPosterUrl });
      } else {
        await api.post('/movies', { ...formData, poster_url: finalPosterUrl });
      }
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save movie');
    }
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`⚠️ Delete "${movie.title}"?\n\nThis will also permanently delete ALL shows and seats for this movie. This cannot be undone.`)) return;
    try {
      await api.delete(`/movies/${movie.movie_id}`);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete movie');
    }
  };

  return (
    <>
      <div className="topbar">
        <h1 className="page-title">Manage Movies</h1>
      </div>
      
      <div className="content-wrapper">
        <div className="table-container">
          <div className="table-header-action">
            <h3>Movie Listing ({movies.length} total)</h3>
            <button className="btn-add" onClick={openAddModal}>
              <Plus size={18} />
              Add Movie
            </button>
          </div>
          
          {loading ? (
            <div style={{padding: '2rem'}}>Loading movies...</div>
          ) : (
            <>
              <div style={{overflowX: 'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Poster</th>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Genre</th>
                      <th>Language</th>
                      <th>Duration</th>
                      <th>Release Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMovies.map(movie => (
                      <tr key={movie.movie_id}>
                        <td>
                          {movie.poster_url ? (
                            <img src={movie.poster_url} alt="poster" style={{width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} />
                          ) : (
                            <div style={{width: '40px', height: '60px', background: '#334155', borderRadius: '4px'}}></div>
                          )}
                        </td>
                        <td>#{movie.movie_id}</td>
                        <td style={{fontWeight: 600, color: 'white'}}>{movie.title}</td>
                        <td>{movie.genre}</td>
                        <td>{movie.language}</td>
                        <td>{movie.duration} mins</td>
                        <td>{new Date(movie.release_date).toLocaleDateString()}</td>
                        <td>
                          <div style={{display: 'flex', gap: 8}}>
                            <button
                              onClick={() => openEditModal(movie)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                                border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px',
                                padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
                              }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(movie)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(239,68,68,0.12)', color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                                padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {movies.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{textAlign: 'center'}}>No movies found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0'}}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                      background: 'var(--bg-card)', color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)', fontSize: '0.85rem',
                      opacity: currentPage === 1 ? 0.4 : 1
                    }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                        background: currentPage === i + 1 ? 'var(--accent)' : 'var(--bg-card)',
                        color: currentPage === i + 1 ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                      background: 'var(--bg-card)', color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)', fontSize: '0.85rem',
                      opacity: currentPage === totalPages ? 0.4 : 1
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Genre</label>
                    <input type="text" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} required placeholder="Action, Sci-Fi" />
                  </div>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Language</label>
                    <input type="text" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} required />
                  </div>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Duration (mins)</label>
                    <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                  </div>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Release Date</label>
                    <input type="date" value={formData.release_date} onChange={e => setFormData({...formData, release_date: e.target.value})} required />
                  </div>
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Upload Poster Image</label>
                    <input type="file" accept="image/*" onChange={e => {
                      setImageFile(e.target.files[0]);
                      setFormData({...formData, poster_url: ''});
                    }} />
                  </div>
                  <div style={{color: 'var(--text-muted)'}}>OR</div>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Paste Poster Image URL</label>
                    <input type="url" value={formData.poster_url} onChange={e => {
                      setFormData({...formData, poster_url: e.target.value});
                      setImageFile(null);
                    }} placeholder="https://example.com/poster.jpg" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  {editingMovie ? 'Update Movie' : 'Save Movie'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
