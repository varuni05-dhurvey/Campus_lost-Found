import React, { useState } from 'react';
import { claimService } from '../services/claimService';
import { ShieldCheck, X, AlertTriangle, Send } from 'lucide-react';

const ClaimModal = ({ item, isOpen, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [identifyingEvidence, setIdentifyingEvidence] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (message.trim().length < 10) {
      setError('Please provide a descriptive message explaining your claim (minimum 10 characters).');
      return;
    }

    if (identifyingEvidence.trim().length < 10) {
      setError('Please provide specific identifying evidence to prove ownership (minimum 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await claimService.createClaim({
        itemId: item._id,
        message,
        identifyingEvidence,
        claimantContact
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit claim request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="var(--color-primary-700)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Claim This Item</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--color-primary-100)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-800)', margin: 0 }}>
                <strong>Item:</strong> {item.title} &bull; <em>Found at {item.campusLocation}</em>
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ padding: '0.65rem 1rem' }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Claim Explanation <span style={{ color: 'var(--color-danger-600)' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Explain why you believe this is your belonging (e.g. lost it around 2 PM near table 3)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Private Identifying Evidence <span style={{ color: 'var(--color-danger-600)' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe specific unmentioned features (e.g. wallpaper picture, sticker, specific marks, internal contents)..."
                value={identifyingEvidence}
                onChange={(e) => setIdentifyingEvidence(e.target.value)}
                required
              />
              <p className="form-help">
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
                This information is private and will only be shared with the finder for verification.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone / Preferred Reaching Info</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91 98765 43210 or your hostel room"
                value={claimantContact}
                onChange={(e) => setClaimantContact(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={15} /> Submit Claim Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
