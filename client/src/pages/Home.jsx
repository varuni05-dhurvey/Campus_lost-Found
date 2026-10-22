import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemService } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import {
  Search,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSearch,
  MessageSquare,
  Award
} from 'lucide-react';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    lostCount: 0,
    foundCount: 0,
    resolvedCount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch latest 6 items
        const res = await itemService.getItems({ limit: 6, sortBy: 'newest' });
        setRecentItems(res.items || []);

        // Also fetch count for calculating real database stats
        const allRes = await itemService.getItems({ limit: 50 });
        const items = allRes.items || [];
        const lostCount = items.filter((i) => i.reportType === 'lost' && i.status === 'lost').length;
        const foundCount = items.filter((i) => i.reportType === 'found' && i.status !== 'resolved').length;
        const resolvedCount = items.filter((i) => i.status === 'resolved').length;

        setStats({
          total: allRes.total || items.length,
          lostCount,
          foundCount,
          resolvedCount
        });
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/items');
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tagline">
              <ShieldCheck size={16} /> University Campus Recovery Network
            </div>
            <h1 className="hero-title">
              Lost something on campus? <br />
              Let’s help you get it back.
            </h1>
            <p className="hero-subtitle">
              A secure, student-focused portal to report misplaced ID cards, electronics, notes,
              keys, and personal items. Connect safely with finders across all campus departments.
            </p>

            <div className="hero-actions">
              <Link to="/report-lost" className="btn btn-danger btn-lg">
                <AlertCircle size={18} /> Report Lost Item
              </Link>
              <Link to="/report-found" className="btn btn-success btn-lg">
                <PlusCircle size={18} /> Report Found Item
              </Link>
            </div>

            {/* Quick Search Box */}
            <div className="hero-search-wrapper">
              <form onSubmit={handleSearchSubmit} className="search-box">
                <Search size={20} color="var(--color-slate-400)" style={{ marginRight: '0.6rem' }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by item name, e.g. 'AirPods', 'Casio Calculator', 'Blue Wallet'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.55rem 1.25rem' }}>
                  Search Portal
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Real Live Database Statistics */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
            <TrendingUp size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Listings Logged</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-danger-50)', color: 'var(--color-danger-600)' }}>
            <AlertCircle size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.lostCount}</div>
            <div className="stat-label">Active Lost Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-50)', color: 'var(--color-warning-600)' }}>
            <FileSearch size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.foundCount}</div>
            <div className="stat-label">Items Awaiting Claim</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-600)' }}>
            <CheckCircle size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.resolvedCount}</div>
            <div className="stat-label">Recovered Belongings</div>
          </div>
        </div>
      </section>

      {/* Recent Listings Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Recent Campus Listings</h2>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>
              Latest belongings reported across campus facilities and classrooms.
            </p>
          </div>
          <Link to="/items" className="btn btn-outline-primary btn-sm">
            Browse All Items <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner spinner-lg"></div>
            <p>Loading campus listings from database...</p>
          </div>
        ) : recentItems.length > 0 ? (
          <div className="items-grid">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h3>No Active Listings Found</h3>
            <p>There are currently no items reported in the portal database. Be the first to report an item!</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/report-lost" className="btn btn-danger btn-sm">
                Report Lost Item
              </Link>
              <Link to="/report-found" className="btn btn-primary btn-sm">
                Report Found Item
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How The Recovery Process Works</h2>
          <p>Four easy, secure steps designed to quickly reunite students with their lost property.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon-wrap">
              <FileSearch size={28} />
            </div>
            <h3>Report or Search</h3>
            <p>
              Submit details of your lost or found item with category, date, and campus location. Or search live listings.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon-wrap">
              <ShieldCheck size={28} />
            </div>
            <h3>Submit Proof of Claim</h3>
            <p>
              Found your item? Submit a claim with unique private identifying evidence that only the genuine owner knows.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon-wrap">
              <Award size={28} />
            </div>
            <h3>Verify &amp; Handover</h3>
            <p>
              The reporter reviews your claim. Once verified, pick up your item at a designated campus security or faculty hub!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
