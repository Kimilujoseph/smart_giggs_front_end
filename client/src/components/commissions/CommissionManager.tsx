import React, { useState, useEffect, useMemo } from 'react';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import { getCommissions, voidCommission } from '../../api/commission_manager';
import { getAllUsers } from '../../api/user_manager';
import CommissionsTable from './CommissionsTable';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';
import { CommissionPayment } from '../../types/commission';
import DateFilter from '../filters/DateFilter';
import EmployeeFilter from '../filters/EmployeeFilter';
import { User } from '../../types/user';

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 'Ksh 0';
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return `Ksh ${numericValue.toLocaleString()}`;
};

const CommissionManager: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionPayment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
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
    const fetchCommissions = async () => {
      setLoading(true);
      try {
        const params = [dateFilter, employeeFilter].filter(Boolean).join('&');
        const res = await getCommissions(params, currentPage, 10);
        if (res && !res.error) {
          setCommissions(res.data.payments || []);
          setTotalPages(res.data.pagination.totalPages || 1);
          setSummary(res.data.summary || {});
          
        } else {
          setMessage({ text: res.data?.message || 'Error fetching commissions', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'An unexpected error occurred', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, [currentPage, dateFilter, employeeFilter]);

  const handleVoid = async (commissionId: number) => {
    try {
      await voidCommission(commissionId);
      setMessage({ text: 'Commission voided successfully', type: 'success' });
      const params = [dateFilter, employeeFilter].filter(Boolean).join('&');
      const res = await getCommissions(params, currentPage, 10);
      if (res && !res.error) setCommissions(res.data.payments || []);
    } catch (error) {
      setMessage({ text: 'Error voiding commission', type: 'error' });
    }
  };

  const paymentCount = useMemo(() => {
    return commissions.length;
  }, [commissions]);

  const averagePayment = useMemo(() => {
    if (!summary?.totalPaid || !commissions?.length) return 0;
    return parseFloat(summary.totalPaid) / commissions.length;
  }, [summary, commissions]);

  return (
    <>
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <Breadcrumb pageName="Commission Expense Center" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <DateFilter onDateChange={setDateFilter} />
        {currentUser?.role === 'superuser' && (
          <EmployeeFilter users={users} onEmployeeChange={(id) => setEmployeeFilter(id ? `employeeId=${id}` : '')} />
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-boxdark">
          <h4 className="text-lg font-semibold">Total Commissions Paid</h4>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.totalPaid)}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-boxdark">
          <h4 className="text-lg font-semibold">Payments Made (on page)</h4>
          <p className="text-2xl font-bold">{summary?.paymentCount || paymentCount}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-boxdark">
          <h4 className="text-lg font-semibold">Average Payment (on page)</h4>
          <p className="text-2xl font-bold">{formatCurrency(averagePayment)}</p>
        </div>
      </div>

      

      <CommissionsTable commissions={commissions} loading={loading} onVoid={handleVoid} />
    </>
  );
};

export default CommissionManager;
