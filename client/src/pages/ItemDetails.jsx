import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ClaimModal from '../components/ClaimModal';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Package,
  ArrowLeft,
  Share2,
  Lock,
  Edit,
  Building
} from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [userClaim, setUserClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await itemService.getItemById(id);
      setItem(res.item);
      setIsOwner(res.isOwner);
      setUserClaim(res.userClaim);
    } catch (err) {
      setError(err.message || 'Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleClaimSuccess = () => {
    setActionSuccess('Your claim request has been submitted successfully! The finder has been notified.');
    fetchItem();
  };

  const handleQuickResolve = async () => {
    if (!window.confirm('Are you sure you want to mark this item as Resolved / Recovered?')) return;
    try {
      await itemService.updateStatus(item._id, 'resolved');
      setActionSuccess('Item successfully marked as Resolved / Recovered.');
      fetchItem();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Retrieving item record...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container">
        <div className="empty-state">
          <AlertCircle size={36} color="var(--color-danger-600)" style={{ margin: '0 auto 1rem' }} />
          <h3>Item Not Found</h3>
          <p>{error || 'This listing does not exist or has been removed by the owner or administrator.'}</p>
          <Link to="/items" className="btn btn-primary btn-sm">
            <ArrowLeft size={16} /> Return to Browse
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(item.dateOfIncident || item.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="container">
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', gap: '0.4rem' }}
        >
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Media & Description */}
        <div>
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: 'var(--color-white)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.reportType === 'lost' ? '#fff1f2' : '#eff6ff',
                  color: item.reportType === 'lost' ? '#e11d48' : '#1e3a8a'
                }}
              >
                <Package size={72} strokeWidth={1.2} />
                <p style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>
                  No photo attached by reporter
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                  Category: {item.category}
                </span>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Description</h3>
            <p style={{ color: 'var(--color-slate-700)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {item.description}
            </p>

            {/* Private Identifying Details (Only visible to Owner or Admin) */}
            {item.identifyingDetails && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#854d0e', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <Lock size={16} /> Private Identifying Details (Only you and administrators can see this)
                </div>
                <p style={{ fontSize: '0.9rem', color: '#713f12', margin: 0 }}>
                  {item.identifyingDetails}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Meta, Actions, Handover details */}
        <div>
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <StatusBadge status={item.status} reportType={item.reportType} />
              <span className="badge badge-category">
                <Tag size={12} style={{ marginRight: '3px' }} /> {item.category}
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--color-slate-900)' }}>
              {item.title}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--color-slate-100)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} color="var(--color-primary-700)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Date {item.reportType === 'lost' ? 'Lost' : 'Found'}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>{formattedDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--color-primary-700)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Campus Location
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>
                    {item.campusLocation}
                    {item.locationDetails ? ` (${item.locationDetails})` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={18} color="var(--color-primary-700)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Reported By
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>
                    {item.reporter?.name || 'Campus Member'} &bull; <span style={{ textTransform: 'capitalize', color: 'var(--color-slate-500)', fontWeight: 500 }}>{item.reporter?.department || item.reporter?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact / Handover Details */}
            <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--color-slate-200)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={16} /> Handover &amp; Contact Preference
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)', marginBottom: '0.5rem' }}>
                {item.contactPreference === 'handover_security' && 'Finder deposited item with Campus Main Gate Security.'}
                {item.contactPreference === 'handover_admin' && 'Finder deposited item with the Administration / Student Affairs Office.'}
                {item.contactPreference === 'phone' && `Direct phone contact requested: ${item.contactPhone || 'Available upon claim'}.`}
                {item.contactPreference === 'email' && 'Contact via university email or in-app claim request.'}
              </p>
            </div>

            {/* Action Buttons */}
            {isOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-800)', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  You are the author of this report.
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/my-reports`} className="btn btn-outline" style={{ flex: 1 }}>
                    <Edit size={15} /> Edit in My Reports
                  </Link>
                  {item.status !== 'resolved' && (
                    <button onClick={handleQuickResolve} className="btn btn-success" style={{ flex: 1 }}>
                      <CheckCircle size={15} /> Mark Recovered
                    </button>
                  )}
                </div>
              </div>
            ) : item.status === 'resolved' ? (
              <div className="alert alert-success" style={{ margin: 0 }}>
                <CheckCircle size={18} /> This item has already been marked as recovered/resolved.
              </div>
            ) : userClaim ? (
              <div style={{ backgroundColor: 'var(--color-warning-50)', border: '1px solid var(--color-warning-100)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-warning-700)', marginBottom: '0.3rem' }}>
                  <ShieldCheck size={18} /> Claim Submitted
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-warning-700)', margin: 0 }}>
                  You submitted a claim on this item. Status: <strong>{userClaim.status.toUpperCase()}</strong>.
                </p>
                <Link to="/claims" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                  View in My Claims
                </Link>
              </div>
            ) : item.reportType === 'found' ? (
              isAuthenticated ? (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setClaimModalOpen(true)}
                >
                  <ShieldCheck size={18} /> Claim This Item
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Link to={`/login?redirect=/items/${item._id}`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Log In to Claim This Item
                  </Link>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', marginTop: '0.5rem' }}>
                    Requires a verified campus student or faculty account.
                  </p>
                </div>
              )
            ) : (
              // Lost item reported by someone else
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)', marginBottom: '1rem' }}>
                  Did you find this lost item? Reach out to the student or hand it in to campus security:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={`mailto:${item.reporter?.email}?subject=Found your lost ${encodeURIComponent(item.title)} on Campus`}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <Mail size={16} /> Email Reporter
                  </a>
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} className="btn btn-outline" style={{ flex: 1 }}>
                      <Phone size={16} /> Call Finder
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <ClaimModal
          item={item}
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
};

export default ItemDetails;
