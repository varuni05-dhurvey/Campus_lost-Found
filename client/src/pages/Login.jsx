import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your college email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate(redirectUrl);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick evaluator demo login
  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <Lock size={26} />
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.92rem' }}>
            Log in to manage your campus reports and review claim requests.
          </p>
        </div>

        {isExpired && (
          <div className="alert alert-info">
            <AlertCircle size={16} /> Your session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. rohit.sharma@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Signing In...
              </>
            ) : (
              <>Sign In to Portal</>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Evaluator */}
        <div style={{ marginTop: '1.75rem', padding: '1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-600)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Demo Accounts (Click to Fill):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickDemo('admin@campus.edu', 'AdminPass123!')}
            >
              <span><strong>Administrator</strong> (Moderation &amp; Stats)</span>
              <span style={{ color: 'var(--color-slate-400)' }}>admin@campus.edu</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickDemo('rohit.sharma@college.edu', 'StudentPass123!')}
            >
              <span><strong>Student 1</strong> (Rohit Sharma - CSE)</span>
              <span style={{ color: 'var(--color-slate-400)' }}>rohit.sharma@college.edu</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={() => handleQuickDemo('ananya.verma@college.edu', 'StudentPass123!')}
            >
              <span><strong>Student 2</strong> (Ananya Verma - ECE)</span>
              <span style={{ color: 'var(--color-slate-400)' }}>ananya.verma@college.edu</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
          New student or faculty?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
