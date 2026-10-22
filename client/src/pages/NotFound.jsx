import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}
      >
        <HelpCircle size={44} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
        Oops! Page Lost on Campus
      </h2>
      <p style={{ color: 'var(--color-slate-500)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
        We couldn’t find the page or listing you were searching for. It might have been moved, resolved, or deleted.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} /> Return to Homepage
        </Link>
        <Link to="/items" className="btn btn-outline btn-lg">
          <Search size={18} /> Browse Directory
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
