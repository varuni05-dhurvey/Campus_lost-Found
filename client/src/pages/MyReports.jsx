import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService } from '../services/itemService';
import StatusBadge from '../components/StatusBadge';
import {
  FileText,
  PlusCircle,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  Inbox,
  X,
  Save,
  Lock,
  MapPin
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'IDs & Cards',
  'Wallets & Bags',
  'Keys',
  'Clothing & Accessories',
  'Other'
];

const LOCATIONS = [
  'Central Library',
  'Main Cafeteria',
  'Auditorium',
  'Science Block / Labs',
  'Sports Complex',
  'Engineering Wing',
  'Hostel Block',
  'Campus Parking',
  'Administration Office',
  'Other'
];

const MyReports = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    campusLocation: '',
    locationDetails: '',
    identifyingDetails: '',
    status: '',
    contactPreference: '',
    contactPhone: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await itemService.getMyItems();
      setItems(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      category: item.category,
      description: item.description,
      campusLocation: item.campusLocation,
      locationDetails: item.locationDetails || '',
      identifyingDetails: item.identifyingDetails || '',
      status: item.status,
      contactPreference: item.contactPreference || 'email',
      contactPhone: item.contactPhone || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await itemService.updateItem(editingItem._id, JSON.stringify(editForm));
      setSuccess('Item report updated successfully.');
      setEditingItem(null);
      fetchMyReports();
    } catch (err) {
      alert(err.message || 'Failed to update report.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickStatusChange = async (itemId, newStatus) => {
    try {
      await itemService.updateStatus(itemId, newStatus);
      setSuccess(`Item marked as ${newStatus === 'resolved' ? 'Resolved / Recovered' : newStatus}.`);
      fetchMyReports();
    } catch (err) {
      alert(err.message || 'Failed to change status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await itemService.deleteItem(itemToDelete._id);
      setSuccess('Item report deleted successfully.');
      setItemToDelete(null);
      fetchMyReports();
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>My Campus Reports</h1>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '1.05rem' }}>
            Manage, update, or mark your lost and found listings as recovered.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report-lost" className="btn btn-danger btn-sm">
            <AlertCircle size={15} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Report Found
          </Link>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Reports Table / List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading your reports from database...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Listing Details</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Inquiries</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {/* Title & Date */}
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-slate-900)', fontSize: '0.98rem' }}>
                      <Link to={`/items/${item._id}`} style={{ color: 'inherit' }}>
                        {item.title}
                      </Link>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', marginTop: '0.15rem' }}>
                      Reported on {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="badge badge-category">{item.category}</span>
                  </td>

                  {/* Location */}
                  <td>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.campusLocation}</div>
                    {item.locationDetails && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                        {item.locationDetails}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={item.status} reportType={item.reportType} />
                  </td>

                  {/* Claims received */}
                  <td>
                    {item.pendingClaimsCount > 0 ? (
                      <Link to="/claims" className="badge badge-claim-pending" style={{ textDecoration: 'none' }}>
                        <Inbox size={12} /> {item.pendingClaimsCount} Pending
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-400)' }}>None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm" title="View Public Listing">
                        <Eye size={14} />
                      </Link>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(item)}
                        title="Edit Details"
                      >
                        <Edit size={14} />
                      </button>

                      {item.status !== 'resolved' && (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleQuickStatusChange(item._id, 'resolved')}
                          title="Mark Resolved / Recovered"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setItemToDelete(item)}
                        title="Delete Report"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={32} />
          </div>
          <h3>You Haven't Submitted Any Reports Yet</h3>
          <p>Report misplaced belongings or items you have found on campus to help our community.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/report-lost" className="btn btn-danger btn-sm">
              <AlertCircle size={15} /> Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Report Found Item
            </Link>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Edit Item Report</h3>
              <button className="modal-close-btn" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                      <option value="claim_pending">Claim Pending</option>
                      <option value="resolved">Resolved / Recovered</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Campus Location</label>
                    <select
                      className="form-control"
                      value={editForm.campusLocation}
                      onChange={(e) => setEditForm({ ...editForm, campusLocation: e.target.value })}
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location Spot Details</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.locationDetails}
                      onChange={(e) => setEditForm({ ...editForm, locationDetails: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ backgroundColor: '#fefce8', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
                  <label className="form-label" style={{ color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={14} /> Private Identifying Details
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editForm.identifyingDetails}
                    onChange={(e) => setEditForm({ ...editForm, identifyingDetails: e.target.value })}
                    style={{ backgroundColor: 'white' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-danger-600)' }}>
                Confirm Report Deletion
              </h3>
              <button className="modal-close-btn" onClick={() => setItemToDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-slate-700)', fontSize: '0.95rem' }}>
                Are you sure you want to permanently delete your listing for:
              </p>
              <p style={{ fontWeight: 700, color: 'var(--color-slate-900)', marginTop: '0.5rem' }}>
                "{itemToDelete.title}"?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', marginTop: '0.5rem' }}>
                This action cannot be undone. Any active claim inquiries associated with this item will also be removed.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setItemToDelete(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
