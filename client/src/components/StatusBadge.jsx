import React from 'react';
import { AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';

const StatusBadge = ({ status, reportType }) => {
  if (status === 'resolved') {
    return (
      <span className="badge badge-resolved">
        <CheckCircle size={12} /> Resolved / Recovered
      </span>
    );
  }

  if (status === 'claim_pending') {
    return (
      <span className="badge badge-claim-pending">
        <Clock size={12} /> Claim Pending
      </span>
    );
  }

  if (reportType === 'lost' || status === 'lost') {
    return (
      <span className="badge badge-lost">
        <AlertCircle size={12} /> Lost
      </span>
    );
  }

  return (
    <span className="badge badge-found">
      <Search size={12} /> Found
    </span>
  );
};

export default StatusBadge;
