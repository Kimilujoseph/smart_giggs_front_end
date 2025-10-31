import React, { useState, useEffect, useMemo, useCallback } from 'react';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { getSalaries, voidSalary } from '../../api/salary_manager';
import { getAllUsers } from '../../api/user_manager';
import SalariesTable from './SalariesTable';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';
import { SalaryPayment } from '../../types/salary';

// Helper to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Ksh 0';
  return `Ksh ${value.toLocaleString()}`;
};

import DateFilter from '../filters/DateFilter';
import EmployeeFilter from '../filters/EmployeeFilter';

// --- Main Component ---
const SalaryManager: React.FC = () => {
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [dateFilter, setDateFilter] = useState('period=month');
  const [employeeFilter, setEmployeeFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('tk');
    if (token) {
      const decodedToken: DecodedToken = jwt_decode(token);
      setCurrentUser(decodedToken);
      if (decodedToken.role !== 'superuser') {
        setEmployeeFilter(`employeeId=${decodedToken.id}`);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'superuser') {
      const fetchUsers = async () => {
        const res = await getAllUsers();
        if (res && !res.error) {
          setUsers(res.data || []);
        }
      };
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const params = [dateFilter, employeeFilter].filter(Boolean).join('&');
        const res = await getSalaries(params, currentPage, 10);
        if (res && !res.error) {
          setSalaries(res.data.payments || []);
          setTotalPages(res.data.totalPages || 1);
          setSummary(res.data.summary || {});
        } else {
          setMessage({ text: res.data?.message || 'Error fetching salaries', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'An unexpected error occurred', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSalaries();
  }, [currentPage, dateFilter, employeeFilter]);

  const handleVoid = async (salaryId: number) => {
    try {
      await voidSalary(salaryId);
      setMessage({ text: 'Salary voided successfully', type: 'success' });
      const params = [dateFilter, employeeFilter].filter(Boolean).join('&');
      const res = await getSalaries(params, currentPage, 10);
      if (res && !res.error) setSalaries(res.data.payments || []);
    } catch (error) {
      setMessage({ text: 'Error voiding salary', type: 'error' });
    }
  };

  // Frontend fallback calculations for KPIs
  const employeesPaidCount = useMemo(() => {
    if (!salaries) return 0;
    const employeeIds = new Set(salaries.map(s => s.employeeId));
    return employeeIds.size;
  }, [salaries]);

  const averagePayment = useMemo(() => {
    if (!summary?.totalPaid || !salaries?.length) return 0;
    // Note: This is the average for the current page of payments
    return summary.totalPaid / salaries.length;
  }, [summary, salaries]);

  return (
    <>
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <Breadcrumb pageName="Salary Expense Center" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <DateFilter onDateChange={setDateFilter} />
        {currentUser?.role === 'superuser' && (
          <EmployeeFilter users={users} onEmployeeChange={(id) => setEmployeeFilter(id ? `employeeId=${id}` : '')} />
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-boxdark">
          <h4 className="text-lg font-semibold">Total Salaries Paid</h4>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.totalPaid)}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-boxdark">
          <h4 className="text-lg font-semibold">Employees Paid</h4>
          <p className="text-2xl font-bold">{summary?.employeesPaidCount || employeesPaidCount}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-boxdark">
          <h4 className="text-lg font-semibold">Average Payment (on page)</h4>
          <p className="text-2xl font-bold">{formatCurrency(summary?.averagePayment || averagePayment)}</p>
        </div>
      </div>



      <SalariesTable salaries={salaries} loading={loading} onVoid={handleVoid} />
      {/* You can add pagination controls here if needed */}
    </>
  );
};

export default SalaryManager;
