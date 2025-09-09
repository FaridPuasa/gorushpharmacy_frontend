import { useState } from 'react';
import axios from 'axios';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    minWidth: '350px',
    maxWidth: '90%',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    textAlign: 'center'
  },
  header: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  subtext: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '1rem'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  accessInfo: {
    marginTop: '1rem',
    backgroundColor: '#f9fafb',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#4b5563',
    textAlign: 'left'
  }
};

const PasswordModal = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('https://gorushpharmacy-server.onrender.com/api/auth/login', { username, password });
      const { role, subrole } = res.data;

      console.log('Login response:', res.data);
      console.log('Role received:', role, 'Type:', typeof role);

      // Ensure we're storing strings, not objects
      const roleString = typeof role === 'string' ? role.toLowerCase().trim() : String(role).toLowerCase().trim();
      const subroleString = typeof subrole === 'string' ? subrole.toLowerCase().trim() : String(subrole).toLowerCase().trim();

      console.log('Processing role:', roleString, 'Type:', typeof roleString);
      console.log('Processing subrole:', subroleString, 'Type:', typeof subroleString);
      
      // Store in sessionStorage
      sessionStorage.setItem('userRole', roleString);
      sessionStorage.setItem('userSubRole', subroleString);

      console.log('Stored in sessionStorage:');
      console.log('- userRole:', sessionStorage.getItem('userRole'));
      console.log('- userSubRole:', sessionStorage.getItem('userSubRole'));

      // Pass just the role string to onSuccess (not an object)
      onSuccess(roleString);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>Welcome</div>
        <p style={styles.subtext}>Sign in to continue</p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;