// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuthHook';
import { RoleGuard } from './components/RoleGuard';

const DashboardContent = () => {
  const { user, token, login, logout } = useAuth();
  const [email, setEmail] = useState('viewer@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  useEffect(() => {
    if (!user) {
      setMetrics([]);
      setError('');
      return;
    }
    if (!token) return;

    setError('');
    let isMounted = true;

    axios.get('http://localhost:4000/api/metrics', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      if (!isMounted) return;
      if (response.data && Array.isArray(response.data.data)) {
        setMetrics(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setMetrics(response.data);
      } else {
        setError('Received unexpected data format from system.');
      }
    })
    .catch(err => {
      if (!isMounted) return;
      console.error("API Gateway Connection Error:", err.response || err);
      setError('Failed to load metrics data records.');
    });

    return () => {
      isMounted = false;
    };
  }, [user, token]);

  // Styles Object for Clean, Minimalist UI Design
  const styles = {
    canvas: {
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#212529',
      padding: '40px 20px',
      boxSizing: 'border-box'
    },
    authContainer: {
      maxWidth: '400px',
      margin: '80px auto',
      backgroundColor: '#ffffff',
      padding: '32px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      border: '1px solid #eaeaea'
    },
    inputField: {
      width: '100%',
      padding: '10px 12px',
      marginTop: '6px',
      marginBottom: '16px',
      border: '1px solid #dcdcdc',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#fefefe',
      boxSizing: 'border-box',
      outline: 'none'
    },
    primaryBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#111111',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      letterSpacing: '-0.2px'
    },
    workspaceWrapper: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e5e5',
      paddingBottom: '24px',
      marginBottom: '32px'
    },
    badge: {
      backgroundColor: '#e9ecef',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      color: '#495057',
      textTransform: 'uppercase'
    },
    secondaryBtn: {
      padding: '8px 14px',
      backgroundColor: '#ffffff',
      color: '#dc3545',
      border: '1px solid #f8d7da',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer'
    },
    card: {
      backgroundColor: '#ffffff',
      border: '1px solid #eaeaea',
      borderRadius: '10px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
      fontSize: '14px'
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '2px solid #eaeaea',
      color: '#6c757d',
      fontWeight: '500',
      fontSize: '13px'
    },
    td: {
      padding: '14px 16px',
      borderBottom: '1px solid #f1f1f1',
      color: '#333333'
    },
    actionBtn: {
      padding: '8px 16px',
      backgroundColor: '#f1f3f5',
      color: '#212529',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '12px'
    },
    adminBtn: {
      padding: '8px 16px',
      backgroundColor: '#111111',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer'
    }
  };

  // --- RENDERING INTERFACE 1: MINIMAL LOGIN CARD ---
  if (!user) {
    return (
      <div style={styles.canvas}>
        <div style={styles.authContainer}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '600', letterSpacing: '-0.5px' }}>SecureDash</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6c757d' }}>Access infrastructure services panel.</p>
          
          {error && <p style={{ color: '#dc3545', fontSize: '13px', margin: '0 0 16px 0' }}>{error}</p>}
          
          <form onSubmit={handleLoginSubmit}>
            <label style={{ fontSize: '13px', fontWeight: '500' }}>Identity Profile</label>
            <select value={email} onChange={(e) => setEmail(e.target.value)} style={styles.inputField}>
              <option value="viewer@demo.com">Viewer Clearance</option>
              <option value="analyst@demo.com">Analyst Clearance</option>
              <option value="admin@demo.com">Root Administrator</option>
            </select>

            <label style={{ fontSize: '13px', fontWeight: '500' }}>Secret Phrase Key</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.inputField} />

            <button type="submit" style={styles.primaryBtn}>Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDERING INTERFACE 2: PREMIUM WORKSPACE ---
  return (
    <div style={styles.canvas}>
      <div style={styles.workspaceWrapper}>
        
        <header style={styles.header}>
          <div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px' }}>Workspace Operations</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>
              Identity token issued to: <span style={{ color: '#111', fontWeight: '500' }}>{user.email}</span> 
              &nbsp;•&nbsp; Security Authorization: <span style={styles.badge}>{user.role}</span>
            </p>
          </div>
          <button onClick={logout} style={styles.secondaryBtn}>Revoke Key</button>
        </header>

        {error && <p style={{ color: '#dc3545', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        {/* COMPONENT MODULE 1: Metrics Analytics Board */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Operational Telemetry</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>Secure cryptographically verified data pipeline.</p>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Data Indicator</th>
                <th style={styles.th}>Value</th>
                <th style={styles.th}>Scope Mapping</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>{item.metric_name}</td>
                  <td style={styles.td, { ...styles.td, fontWeight: '600', color: '#111' }}>{item.value}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, fontSize: '10px', backgroundColor: '#f1f3f5' }}>{item.scope || 'summary'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COMPONENT MODULE 2: Analyst Suite Container */}
        <RoleGuard allowedRoles={['Analyst', 'Admin']}>
          <div style={{ ...styles.card, borderLeft: '3px solid #007bff' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#0056b3' }}>Intelligence & Advanced Reports</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>Compile extended network structures and tracking arrays.</p>
            <button onClick={() => alert('Data compiled successfully.')} style={styles.actionBtn}>
              Compile Report Data
            </button>
          </div>
        </RoleGuard>

        {/* COMPONENT MODULE 3: Core Infrastructure Root Controls */}
        <RoleGuard allowedRoles={['Admin']} fallbackMode={true}>
          <div style={{ ...styles.card, borderLeft: '3px solid #212529' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>System Administration Controls</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6c757d' }}>High-privilege tracking zones. All transactions write to immutable terminal trails.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => alert('Opening System Audit Trail Logs...')} style={styles.adminBtn}>
                Audit Trails
              </button>
              <button onClick={() => alert('Opening Role Revision Panel...')} style={{ ...styles.adminBtn, backgroundColor: '#ffffff', color: '#111111', border: '1px solid #111111' }}>
                Privilege Scopes
              </button>
            </div>
          </div>
        </RoleGuard>

      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;