import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import StatusBadge from '../components/StatusBadge';
import {
  User,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Inbox,
  FileText,
  Clock,
  Shield,
  Edit2,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateUserProfile } = useAuth();

  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    idNumber: user?.idNumber || ''
  });
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [itemsRes, claimsRes, recClaimsRes] = await Promise.all([
          itemService.getMyItems(),
          claimService.getMyClaims(),
          claimService.getReceivedClaims()
        ]);

        setMyItems(itemsRes.items || []);
        setMyClaims(claimsRes.claims || []);
        setReceivedClaims(recClaimsRes.claims || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(profileForm);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => {
        setEditingProfile(false);
        setProfileMsg('');
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const lostCount = myItems.filter((i) => i.reportType === 'lost' && i.status === 'lost').length;
  const foundCount = myItems.filter((i) => i.reportType === 'found' && i.status !== 'resolved').length;
  const resolvedCount = myItems.filter((i) => i.status === 'resolved').length;
  const pendingReceivedClaims = receivedClaims.filter((c) => c.status === 'pending').length;

  return (
    <div className="container">
      {/* Welcome Header */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-700)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>Hello, {user?.name}!</h1>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>
              {user?.department} &bull; <span style={{ textTransform: 'capitalize' }}>{user?.role}</span> &bull; {user?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setEditingProfile(true)} className="btn btn-outline btn-sm">
            <Edit2 size={14} /> Edit Profile
          </button>
          <Link to="/report-lost" className="btn btn-danger btn-sm">
            <AlertCircle size={14} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-primary btn-sm">
            <PlusCircle size={14} /> Report Found
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{myItems.length}</div>
            <div className="stat-label">My Total Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-danger-50)', color: 'var(--color-danger-600)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{lostCount}</div>
            <div className="stat-label">My Active Lost Items</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-50)', color: 'var(--color-warning-600)' }}>
            <Inbox size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{pendingReceivedClaims}</div>
            <div className="stat-label">Claims Awaiting My Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-600)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{resolvedCount}</div>
            <div className="stat-label">My Items Recovered</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: My Recent Reports */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>My Recent Listings</h3>
            <Link to="/my-reports" className="btn btn-outline-primary btn-sm">
              Manage All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-container" style={{ padding: '2rem 0' }}>
                <div className="spinner"></div>
              </div>
            ) : myItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myItems.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--color-slate-100)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-slate-50)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        <Link to={`/items/${item._id}`} style={{ color: 'var(--color-slate-900)' }}>
                          {item.title}
                        </Link>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', margin: 0 }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {item.campusLocation} &bull; {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <StatusBadge status={item.status} reportType={item.reportType} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--color-slate-500)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  You haven’t posted any lost or found items yet.
                </p>
                <Link to="/report-lost" className="btn btn-outline btn-sm">
                  Create First Report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Claims Overview */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Claims &amp; Inquiries</h3>
            <Link to="/claims" className="btn btn-outline-primary btn-sm">
              View All Claims <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--color-slate-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Inbox size={15} color="var(--color-warning-600)" /> Claims Received on My Items
              </h4>
              {receivedClaims.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {receivedClaims.slice(0, 3).map((claim) => (
                    <div
                      key={claim._id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        border: '1px solid var(--color-slate-200)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{claim.claimant?.name || 'Claimant'}</span>
                        <span style={{ textTransform: 'capitalize', color: claim.status === 'pending' ? 'var(--color-warning-600)' : 'var(--color-success-600)' }}>
                          {claim.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-slate-500)', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                        Item: {claim.item?.title || 'Reported item'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', margin: 0 }}>
                  No pending claims received yet.
                </p>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--color-slate-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="var(--color-primary-600)" /> Claims I Submitted
              </h4>
              {myClaims.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myClaims.slice(0, 3).map((claim) => (
                    <div
                      key={claim._id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        border: '1px solid var(--color-slate-200)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{claim.item?.title || 'Claimed item'}</span>
                        <span style={{ textTransform: 'capitalize', color: claim.status === 'approved' ? 'var(--color-success-600)' : 'var(--color-slate-600)' }}>
                          {claim.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-slate-500)', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                        Finder: {claim.itemOwner?.name || 'Listing Owner'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', margin: 0 }}>
                  You haven't submitted any claim requests yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="modal-overlay" onClick={() => setEditingProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Edit Campus Profile</h3>
              <button className="modal-close-btn" onClick={() => setEditingProfile(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="modal-body">
                {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number / Staff ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.idNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, idNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingProfile(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
