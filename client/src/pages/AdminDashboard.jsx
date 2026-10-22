import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Flag,
  Search,
  Eye,
  ArrowRight,
  TrendingUp,
  MapPin,
  X,
  Save
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'items' | 'users'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Moderation Modal
  const [moderatingItem, setModeratingItem] = useState(null);
  const [modNote, setModNote] = useState('');
  const [isModFlagged, setIsModFlagged] = useState(false);
  const [savingMod, setSavingMod] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, itemsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getItems({ limit: 50 }),
        adminService.getUsers()
      ]);

      setStats(statsRes.stats);
      setItems(itemsRes.items || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      setActionError(err.message || 'Failed to load administrator records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openModerateModal = (item) => {
    setModeratingItem(item);
    setModNote(item.moderationNote || '');
    setIsModFlagged(item.isModerated || false);
  };

  const handleModerationSubmit = async (e) => {
    e.preventDefault();
    if (!moderatingItem) return;
    setSavingMod(true);
    try {
      await adminService.moderateItem(moderatingItem._id, {
        isModerated: isModFlagged,
        moderationNote: modNote
      });
      setActionSuccess('Item moderation status successfully updated.');
      setModeratingItem(null);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update moderation status.');
    } finally {
      setSavingMod(false);
    }
  };

  const handleDeleteItem = async (itemId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the listing "${title}" as an Administrator?`)) {
      return;
    }
    try {
      await adminService.deleteItem(itemId);
      setActionSuccess('Listing and associated records removed by Administrator.');
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.campusLocation.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-700)', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            <ShieldAlert size={16} /> Campus Moderator Panel
          </div>
          <h1 style={{ fontSize: '2.25rem', margin: 0 }}>Administrator Dashboard</h1>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '1rem', marginTop: '0.2rem' }}>
            System-wide analytics, listings moderation, user registries, and claim oversight.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} /> {actionError}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={17} /> Campus Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          <FileText size={17} /> Listings &amp; Moderation ({items.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={17} /> Registered Users ({users.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Gathering system aggregates...</p>
        </div>
      ) : activeTab === 'overview' && stats ? (
        /* TAB 1: OVERVIEW & ANALYTICS */
        <div>
          <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalItems}</div>
                <div className="stat-label">Total Listings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-600)' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.resolvedItems}</div>
                <div className="stat-label">Items Recovered ({stats.recoveryRate}%)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-50)', color: 'var(--color-warning-600)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Registered Accounts</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalClaims}</div>
                <div className="stat-label">Total Claims Handled</div>
              </div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Category Breakdown */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Listings by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {stats.categoryStats?.map((cat) => (
                  <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.92rem', color: 'var(--color-slate-700)', fontWeight: 600 }}>{cat._id}</span>
                    <span className="badge badge-category">{cat.count} items</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Breakdown */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Hotspots by Campus Location</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {stats.locationStats?.map((loc) => (
                  <div key={loc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.92rem', color: 'var(--color-slate-700)', fontWeight: 600 }}>{loc._id}</span>
                    <span className="badge badge-category">{loc.count} reports</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'items' ? (
        /* TAB 2: ALL ITEMS & MODERATION TABLE */
        <div>
          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search listings by title, location, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="claim_pending">Claim Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Item Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th>Moderation</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                      <Link to={`/items/${item._id}`} style={{ color: 'inherit' }}>
                        {item.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${item.reportType === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                        {item.reportType.toUpperCase()}
                      </span>
                    </td>
                    <td><span className="badge badge-category">{item.category}</span></td>
                    <td>{item.campusLocation}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.reporter?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>{item.reporter?.email}</div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} reportType={item.reportType} />
                    </td>
                    <td>
                      {item.isModerated ? (
                        <span className="badge badge-lost" title={item.moderationNote}>
                          <Flag size={11} /> Flagged
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)' }}>Normal</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm" title="View Details">
                          <Eye size={13} />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openModerateModal(item)}
                          title="Moderate / Flag"
                        >
                          <Flag size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteItem(item._id, item.title)}
                          title="Permanently Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 3: REGISTERED USERS */
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Roll / Staff ID</th>
                <th>Reports Created</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-slate-900)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-lost' : 'badge-found'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.idNumber || '—'}</td>
                  <td><strong>{u.reportsCount || 0}</strong></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Moderation Modal */}
      {moderatingItem && (
        <div className="modal-overlay" onClick={() => setModeratingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Moderate Listing</h3>
              <button className="modal-close-btn" onClick={() => setModeratingItem(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleModerationSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', marginBottom: '1rem' }}>
                  Item: <strong>{moderatingItem.title}</strong>
                </p>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isModFlagged}
                      onChange={(e) => setIsModFlagged(e.target.checked)}
                    />
                    Flag as Suspicious / Inappropriate Content
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Moderator Note / Reason</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter reason for flag or moderation comments..."
                    value={modNote}
                    onChange={(e) => setModNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModeratingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingMod}>
                  <Save size={15} /> Save Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
