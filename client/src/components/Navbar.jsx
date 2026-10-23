import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  FileText,
  Inbox
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMobile}>
          <div className="brand-icon">
            <Search size={22} strokeWidth={2.5} />
          </div>
          <span>Lost &amp; Found</span>
        </Link>

        {/* Navigation Links */}
        <nav className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            Home
          </NavLink>
          <NavLink to="/items" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            Browse All
          </NavLink>
          <NavLink to="/items/lost" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            Lost Items
          </NavLink>
          <NavLink to="/items/found" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            Found Items
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                Dashboard
              </NavLink>
              <NavLink to="/my-reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                My Reports
              </NavLink>
              <NavLink to="/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                Claims
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobile}
                  style={{ color: 'var(--color-primary-700)', fontWeight: 700 }}
                >
                  <ShieldAlert size={15} style={{ display: 'inline', marginRight: '4px' }} />
                  Admin
                </NavLink>
              )}
            </>
          )}

          {/* Mobile-only action buttons */}
          <div style={{ display: mobileOpen ? 'flex' : 'none', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <Link to="/report-lost" className="btn btn-danger btn-sm" onClick={closeMobile}>
              <AlertCircle size={15} /> Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-primary btn-sm" onClick={closeMobile}>
              <PlusCircle size={15} /> Report Found Item
            </Link>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut size={15} /> Sign Out ({user.name.split(' ')[0]})
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={closeMobile}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={closeMobile}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="nav-actions">
          <Link to="/report-lost" className="btn btn-danger btn-sm" style={{ display: 'inline-flex' }}>
            <AlertCircle size={14} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
            <PlusCircle size={14} /> Report Found
          </Link>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{ gap: '0.4rem' }}
              >
                <User size={15} />
                <span>{user.name.split(' ')[0]}</span>
                {isAdmin && <span className="badge badge-found" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Admin</span>}
              </button>

              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-slate-200)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '200px',
                    padding: '0.5rem 0',
                    zIndex: 200
                  }}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--color-slate-100)' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-slate-900)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>{user.email}</p>
                    <span className="badge badge-category" style={{ marginTop: '0.3rem' }}>{user.role.toUpperCase()}</span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="nav-link"
                    style={{ display: 'block', borderRadius: 0, padding: '0.5rem 1rem' }}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    User Dashboard
                  </Link>
                  <Link
                    to="/my-reports"
                    className="nav-link"
                    style={{ display: 'block', borderRadius: 0, padding: '0.5rem 1rem' }}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    My Listings &amp; Reports
                  </Link>
                  <Link
                    to="/claims"
                    className="nav-link"
                    style={{ display: 'block', borderRadius: 0, padding: '0.5rem 1rem' }}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Claim Requests
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="nav-link"
                      style={{ display: 'block', borderRadius: 0, padding: '0.5rem 1rem', color: 'var(--color-primary-700)', fontWeight: 700 }}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-slate-100)', marginTop: '0.3rem' }}>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: '0.6rem 1rem',
                        color: 'var(--color-danger-600)',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: 600
                      }}
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
