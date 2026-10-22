import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowRight, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ItemCard = ({ item }) => {
  const formattedDate = new Date(item.dateOfIncident || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="card item-card">
      <div className="item-card-image">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          style={{
            display: item.imageUrl ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: item.reportType === 'lost' ? '#fff1f2' : '#eff6ff',
            color: item.reportType === 'lost' ? '#e11d48' : '#1e3a8a'
          }}
        >
          <Package size={44} strokeWidth={1.5} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.4rem' }}>
            {item.category}
          </span>
        </div>

        <div className="item-card-badges">
          <StatusBadge status={item.status} reportType={item.reportType} />
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="badge badge-category">
            <Tag size={11} style={{ marginRight: '0.2rem' }} /> {item.category}
          </span>
          <span className="item-card-date">
            <Calendar size={13} /> {formattedDate}
          </span>
        </div>

        <h3 className="item-card-title">{item.title}</h3>
        <p className="item-card-desc">{item.description}</p>

        <div className="item-card-meta">
          <div className="meta-row">
            <MapPin size={14} color="var(--color-primary-700)" />
            <span style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>{item.campusLocation}</span>
            {item.locationDetails ? (
              <span style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem' }}>
                ({item.locationDetails})
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card-footer">
        <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
          By {item.reporter?.name ? item.reporter.name.split(' ')[0] : 'Campus Member'}
        </span>
        <Link to={`/items/${item._id}`} className="btn btn-outline-primary btn-sm">
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

export default ItemCard;
