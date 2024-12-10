import React from 'react';
import { FaEdit } from 'react-icons/fa';

const StatusCell = ({ value, row, updateStatus, isEditing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'yellow';
      case 'Qualified':
        return 'green';
      case 'Not Qualified':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => updateStatus(row.original.applicationID, e.target.value)}
        >
          <option value="applied">Applied</option>
          <option value="qualified">Qualified</option>
          <option value="placed">Placed</option>
          <option value="not-placed">Not Placed</option>
          <option value="not-attended">Not Attended</option>
          <option value="not-interested">Not Interested</option>
          <option value="not-eligible">Not Eligible</option>
          <option value="eligible">Eligible/Profile Sent</option>
          <option value="under-progress">Yet to Receive Feedback</option>
          <option value="level-1">Level 1</option>
          <option value="level-2">Level 2</option>
          <option value="level-3">Level 3</option>
        </select>
      ) : (
        <>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(value),
              marginRight: '8px'
            }}
          ></span>
          {value}
        </>
      )}
      <button
        onClick={() => row.toggleEditing(row.original.applicationID)}
        style={{ marginLeft: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <FaEdit />
      </button>
    </div>
  );
};

export default StatusCell;
