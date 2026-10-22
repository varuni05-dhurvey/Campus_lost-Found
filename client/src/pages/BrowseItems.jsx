import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemService } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const BrowseItems = ({ forcedType }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states initialized from URL params or props
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [campusLocation, setCampusLocation] = useState(searchParams.get('location') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');

  const reportType = forcedType || searchParams.get('reportType') || 'all';

  // Fetch items whenever filters or page changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: 9,
          sortBy: 'newest'
        };

        if (search.trim()) queryParams.search = search.trim();
        if (category !== 'All') queryParams.category = category;
        if (campusLocation !== 'All') queryParams.campusLocation = campusLocation;
        if (status !== 'All') queryParams.status = status;
        if (reportType !== 'all') queryParams.reportType = reportType;

        const res = await itemService.getItems(queryParams);
        setItems(res.items || []);
        setTotalCount(res.total || 0);
        setTotalPages(res.pages || 1);
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [search, category, campusLocation, status, reportType, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCampusLocation('All');
    setStatus('All');
    setCurrentPage(1);
    setSearchParams({});
  };

  const getPageTitle = () => {
    if (reportType === 'lost') return 'Lost Belongings';
    if (reportType === 'found') return 'Found Belongings';
    return 'Browse All Campus Listings';
  };

  const getPageSubtitle = () => {
    if (reportType === 'lost') return 'Browse belongings reported lost by students and staff looking for help.';
    if (reportType === 'found') return 'Browse found items awaiting genuine owner verification and claim.';
    return 'Search and explore all lost, found, and recovered items on campus.';
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>{getPageTitle()}</h1>
        <p style={{ color: 'var(--color-slate-500)', fontSize: '1.05rem' }}>{getPageSubtitle()}</p>
      </div>

      {/* Filter Component */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        campusLocation={campusLocation}
        setLocation={setCampusLocation}
        status={status}
        setStatus={setStatus}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
          Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> listing{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Items Grid or Loading / Empty */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Filtering database records...</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="items-grid" style={{ marginBottom: '2.5rem' }}>
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span style={{ fontSize: '0.9rem', fontWeight: 600, padding: '0 0.75rem' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h3>No Matching Items Found</h3>
          <p>
            No listings matched your active search or filter criteria. Try adjusting your keywords, campus location, or resetting filters.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
