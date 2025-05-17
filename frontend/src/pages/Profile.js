import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from "../utils/cookies";
import './Profile.css';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await updateUser({
        username: formData.username,
        email: formData.email
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`http://localhost:8000/auth/users/${user.id}/delete/`, {
          method: 'DELETE',
          headers: { 
            "Content-Type": "application/json",
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        logout();
        navigate('/login');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Tu Perfil</h2>
        <div className="user-info">
          <p><strong>Usuario:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <h3>Actualizar Información</h3>
        
        <div className="form-group">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>

      <div className="danger-zone">
        <h3>Zona Peligrosa</h3>
        <button 
          onClick={handleDelete} 
          className="delete-button"
        >
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
};

export default Profile;