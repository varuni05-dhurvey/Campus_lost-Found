import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Books & Stationery',
  'IDs & Cards',
  'Wallets & Bags',
  'Keys',
  'Clothing & Accessories',
  'Other'
];

const LOCATIONS = [
  'All',
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

const FilterBar = ({
  search,
  setSearch,
  category,
  setCategory,
  campusLocation,
  setLocation,
  status,
  setStatus,
  onReset
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-grid">
        {/* Search Input */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Search size={14} /> Search Listings
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search keywords, items, or spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="form-label">Category</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Campus Location */}
        <div>
          <label className="form-label">Campus Location</label>
          <select
            className="form-control"
            value={campusLocation}
            onChange={(e) => setLocation(e.target.value)}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="form-label">Item Status</label>
          <select
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claim_pending">Claim Pending</option>
            <option value="resolved">Resolved / Recovered</option>
          </select>
        </div>

        {/* Reset Action */}
        <div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', height: '42px' }}
            onClick={onReset}
            title="Reset All Filters"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
