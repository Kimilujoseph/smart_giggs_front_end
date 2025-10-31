import React from 'react';

const EmployeeFilter: React.FC<{ users: any[], onEmployeeChange: (employeeId: string) => void; }> = ({ users, onEmployeeChange }) => (
    <select onChange={e => onEmployeeChange(e.target.value)} className="rounded-md border-gray-300 bg-white p-3 text-base dark:border-gray-600 dark:bg-meta-4">
      <option value="">All Employees</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
      ))}
    </select>
  );

export default EmployeeFilter;