import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import {
  AlertCircle,
  PlusCircle,
  Upload,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Calendar,
  Lock,
  Tag
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

const ReportItem = ({ mode = 'lost' }) => {
  const isLost = mode === 'lost';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    dateOfIncident: new Date().toISOString().split('T')[0],
    campusLocation: 'Central Library',
    locationDetails: '',
    identifyingDetails: '',
    contactPreference: isLost ? 'email' : 'handover_security',
    contactPhone: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected image exceeds the 5MB size limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('description', formData.description.trim());
      data.append('reportType', isLost ? 'lost' : 'found');
      data.append('dateOfIncident', formData.dateOfIncident);
      data.append('campusLocation', formData.campusLocation);
      data.append('locationDetails', formData.locationDetails.trim());
      data.append('identifyingDetails', formData.identifyingDetails.trim());
      data.append('contactPreference', formData.contactPreference);
      data.append('contactPhone', formData.contactPhone.trim());

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await itemService.createItem(data);
      setSuccess(`${isLost ? 'Lost' : 'Found'} item reported successfully! Redirecting...`);
      setTimeout(() => {
        navigate(`/items/${res.item._id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isLost ? 'var(--color-danger-50)' : 'var(--color-primary-50)',
              color: isLost ? 'var(--color-danger-600)' : 'var(--color-primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            {isLost ? <AlertCircle size={28} /> : <PlusCircle size={28} />}
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
            Report {isLost ? 'Lost' : 'Found'} Item
          </h1>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>
            {isLost
              ? 'Provide clear details to help the campus community identify and return your belonging.'
              : 'Help return a found item to its rightful student or staff owner.'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Item Title */}
          <div className="form-group">
            <label className="form-label">
              Item Name / Title <span style={{ color: 'var(--color-danger-600)' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder={isLost ? "e.g. Apple AirPods Pro (2nd Gen) in white case" : "e.g. Casio fx-991EX Scientific Calculator"}
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category & Date Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Approximate Date {isLost ? 'Lost' : 'Found'} *</label>
              <input
                type="date"
                name="dateOfIncident"
                className="form-control"
                value={formData.dateOfIncident}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Campus Location & Specific Spot */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Campus Location *</label>
              <select name="campusLocation" className="form-control" value={formData.campusLocation} onChange={handleChange}>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exact Spot / Room Details</label>
              <input
                type="text"
                name="locationDetails"
                className="form-control"
                placeholder="e.g. 2nd Floor, Quiet Cubicle #14"
                value={formData.locationDetails}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Description <span style={{ color: 'var(--color-danger-600)' }}>*</span>
            </label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              placeholder="Describe color, brand, model, exterior condition, where you were sitting, etc..."
              value={formData.description}
              onChange={handleChange}
              required
            />
            <p className="form-help">Minimum 10 characters.</p>
          </div>

          {/* Private Identifying Details */}
          <div className="form-group" style={{ backgroundColor: '#fefce8', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
            <label className="form-label" style={{ color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={15} /> Secret Identifying Details (Kept Strictly Private)
            </label>
            <textarea
              name="identifyingDetails"
              className="form-control"
              rows={2}
              placeholder="e.g. Lock screen photo, specific sticker on the bottom, secret engraving, inner card IDs..."
              value={formData.identifyingDetails}
              onChange={handleChange}
              style={{ backgroundColor: 'white' }}
            />
            <p className="form-help" style={{ color: '#713f12' }}>
              This will NOT be shown publicly on the website. You will use this to verify the genuine owner during claim review.
            </p>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Optional Item Photograph</label>
            <div
              style={{
                border: '2px dashed var(--color-slate-300)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                backgroundColor: 'var(--color-slate-50)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('image-input').click()}
            >
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <Upload size={24} color="var(--color-slate-400)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate-700)', margin: 0 }}>
                {imageFile ? imageFile.name : 'Click to select or upload an image file'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.25rem' }}>
                Supports JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>

            {imagePreview && (
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  style={{ maxHeight: '180px', borderRadius: 'var(--radius-md)', margin: '0 auto', border: '1px solid var(--color-slate-200)' }}
                />
              </div>
            )}
          </div>

          {/* Handover & Contact Preference */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact / Handover Preference</label>
              <select name="contactPreference" className="form-control" value={formData.contactPreference} onChange={handleChange}>
                <option value="email">University Email</option>
                <option value="phone">Direct Phone</option>
                <option value="handover_security">Deposited at Campus Main Gate Security</option>
                <option value="handover_admin">Deposited at Student Affairs / Admin Office</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                name="contactPhone"
                className="form-control"
                placeholder="e.g. +91 98765 43210"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className={`btn ${isLost ? 'btn-danger' : 'btn-primary'} btn-lg`}
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                  Publishing Report...
                </>
              ) : (
                <>
                  {isLost ? <AlertCircle size={18} /> : <PlusCircle size={18} />} Publish {isLost ? 'Lost' : 'Found'} Item Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
