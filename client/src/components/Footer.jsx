import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Search size={18} />
              </div>
              <h3 style={{ margin: 0 }}>Campus Lost &amp; Found</h3>
            </div>
            <p>
              The official centralized platform for students, faculty, and campus staff to report, identify,
              and safely claim misplaced belongings across our university campus.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/items">Browse All Listings</Link></li>
              <li><Link to="/items/lost">Recently Lost Items</Link></li>
              <li><Link to="/items/found">Recently Found Items</Link></li>
              <li><Link to="/report-lost">Report a Lost Item</Link></li>
              <li><Link to="/report-found">Report a Found Item</Link></li>
            </ul>
          </div>

          {/* Safety & Protocol */}
          <div className="footer-col">
            <h4>Campus Handover Hubs</h4>
            <ul className="footer-links">
              <li>Central Security Main Gate</li>
              <li>Library Circulation Desk</li>
              <li>Student Affairs Office</li>
              <li>Cafeteria Lost Desk</li>
              <li>Sports Complex Guard Station</li>
            </ul>
          </div>

          {/* Contact / Emergency */}
          <div className="footer-col">
            <h4>Security &amp; Support</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} /> +91 (0) 1234 567890
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} /> lostfound@campus.edu
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} /> Main Campus Admin Block
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={14} /> 24/7 Security Hotline
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Campus Lost &amp; Found Portal &bull; Full Stack Development Mini-Project.
          </p>
          <p>
            Designed &amp; Built for University Belongings Recovery.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
