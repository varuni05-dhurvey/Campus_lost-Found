import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimService } from '../services/claimService';
import {
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Mail,
  AlertTriangle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const ClaimsPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Action Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approved' | 'rejected' | 'completed'
  const [feedback, setFeedback] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const [recRes, sentRes] = await Promise.all([
        claimService.getReceivedClaims(),
        claimService.getMyClaims()
      ]);
      setReceivedClaims(recRes.claims || []);
      setMyClaims(sentRes.claims || []);
    } catch (err) {
      setActionError(err.message || 'Failed to fetch claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const openActionModal = (claim, type) => {
    setSelectedClaim(claim);
    setActionType(type);
    setFeedback('');
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setSubmittingAction(true);
    setActionSuccess('');
    setActionError('');

    try {
      await claimService.updateStatus(selectedClaim._id, actionType, feedback);
      setActionSuccess(`Claim request successfully ${actionType}!`);
      setSelectedClaim(null);
      fetchClaims();
    } catch (err) {
      setActionError(err.message || 'Failed to update claim.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Claim &amp; Recovery Inquiries</h1>
        <p style={{ color: 'var(--color-slate-500)', fontSize: '1.05rem' }}>
          Review ownership evidence, approve handovers, and track your submitted item claims.
        </p>
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

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <Inbox size={18} /> Claims I Received ({receivedClaims.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <Send size={18} /> Claims I Submitted ({myClaims.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading claims data...</p>
        </div>
      ) : activeTab === 'received' ? (
        /* TAB 1: CLAIMS RECEIVED */
        <div>
          {receivedClaims.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {receivedClaims.map((claim) => (
                <div key={claim._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-category">{claim.item?.category}</span>
                        <span
                          className={`badge ${
                            claim.status === 'approved' || claim.status === 'completed'
                              ? 'badge-resolved'
                              : claim.status === 'rejected'
                              ? 'badge-lost'
                              : 'badge-claim-pending'
                          }`}
                        >
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                        <Link to={`/items/${claim.item?._id}`} style={{ color: 'var(--color-slate-900)' }}>
                          {claim.item?.title || 'Reported Item'}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', marginTop: '0.2rem' }}>
                        Submitted on {new Date(claim.createdAt).toLocaleDateString()} &bull; Campus Location: {claim.item?.campusLocation}
                      </p>
                    </div>

                    {/* Claimant Bio Badge */}
                    <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                        <User size={14} /> {claim.claimant?.name || 'Claimant'}
                      </div>
                      <div style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem' }}>
                        {claim.claimant?.department} &bull; {claim.claimant?.role}
                      </div>
                      <div style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <Mail size={12} /> {claim.claimant?.email}
                      </div>
                      {claim.claimantContact && (
                        <div style={{ color: 'var(--color-slate-700)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem' }}>
                          Contact: {claim.claimantContact}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message & Private Evidence */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--color-slate-700)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MessageSquare size={14} /> Claimant Explanation
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-800)', margin: 0 }}>
                        {claim.message}
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.88rem', color: '#854d0e', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={14} /> Submitted Identifying Evidence
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: '#713f12', margin: 0, fontWeight: 500 }}>
                        {claim.identifyingEvidence}
                      </p>
                    </div>
                  </div>

                  {claim.ownerFeedback && (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <strong>Your Review Note:</strong> {claim.ownerFeedback}
                    </div>
                  )}

                  {/* Actions for item finder */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-slate-100)', paddingTop: '1rem' }}>
                    <Link to={`/items/${claim.item?._id}`} className="btn btn-outline btn-sm">
                      View Listing
                    </Link>

                    {claim.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => openActionModal(claim, 'rejected')}
                        >
                          <XCircle size={15} /> Reject Claim
                        </button>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => openActionModal(claim, 'approved')}
                        >
                          <CheckCircle size={15} /> Approve &amp; Mark Recovered
                        </button>
                      </>
                    )}

                    {claim.status === 'approved' && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => openActionModal(claim, 'completed')}
                      >
                        <CheckCircle size={15} /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Inbox size={32} />
              </div>
              <h3>No Claims Received Yet</h3>
              <p>When other campus members claim items you reported found, their ownership evidence will appear here for your review.</p>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: MY SUBMITTED CLAIMS */
        <div>
          {myClaims.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myClaims.map((claim) => (
                <div key={claim._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-category">{claim.item?.category}</span>
                        <span
                          className={`badge ${
                            claim.status === 'approved' || claim.status === 'completed'
                              ? 'badge-resolved'
                              : claim.status === 'rejected'
                              ? 'badge-lost'
                              : 'badge-claim-pending'
                          }`}
                        >
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                        <Link to={`/items/${claim.item?._id}`} style={{ color: 'var(--color-slate-900)' }}>
                          {claim.item?.title || 'Claimed Item'}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', marginTop: '0.2rem' }}>
                        Claim submitted on {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Finder Info */}
                    <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-slate-800)' }}>
                        Finder: {claim.itemOwner?.name || 'Listing Owner'}
                      </div>
                      <div style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem' }}>
                        {claim.itemOwner?.department}
                      </div>
                      <div style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {claim.itemOwner?.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', margin: 0 }}>
                      <strong>Your Evidence Provided:</strong> {claim.identifyingEvidence}
                    </p>
                  </div>

                  {claim.ownerFeedback && (
                    <div style={{ padding: '0.85rem 1.25rem', backgroundColor: claim.status === 'approved' ? 'var(--color-success-50)' : 'var(--color-slate-100)', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 0.25rem', color: claim.status === 'approved' ? 'var(--color-success-700)' : 'var(--color-slate-800)' }}>
                        Finder Feedback:
                      </p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{claim.ownerFeedback}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link to={`/items/${claim.item?._id}`} className="btn btn-outline-primary btn-sm">
                      View Item Details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Send size={32} />
              </div>
              <h3>You Haven’t Claimed Any Items</h3>
              <p>Found your lost item in the directory? Open its listing and click "Claim This Item" to submit proof of ownership.</p>
              <Link to="/items/found" className="btn btn-primary btn-sm">
                Browse Found Belongings
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Review Action Modal */}
      {selectedClaim && (
        <div className="modal-overlay" onClick={() => setSelectedClaim(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, textTransform: 'capitalize' }}>
                {actionType === 'approved' ? 'Approve Claim Request' : 'Reject Claim Request'}
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedClaim(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleActionSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', marginBottom: '1rem' }}>
                  {actionType === 'approved'
                    ? 'Approving will confirm this person as the genuine owner and mark the item as Resolved / Recovered.'
                    : 'Rejecting will decline this claim request and allow other users to submit claims.'}
                </p>

                <div className="form-group">
                  <label className="form-label">Feedback / Handover Instructions</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={
                      actionType === 'approved'
                        ? 'e.g. Verified! You can pick it up from Room 302 or Central Security.'
                        : 'e.g. The identifying evidence does not match the actual item.'
                    }
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedClaim(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${actionType === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  disabled={submittingAction}
                >
                  {submittingAction
                    ? 'Processing...'
                    : actionType === 'approved'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
