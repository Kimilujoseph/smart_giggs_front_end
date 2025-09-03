import React, { useState, useEffect } from 'react';
import { CommissionPayment } from '../../types/commission';
import { getCommissions, voidCommission } from '../../api/commission_manager';
import CommissionsTable from './CommissionsTable';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';

const CommissionManager: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCommissions = async (page: number) => {
    try {
      setLoading(true);
      const res = await getCommissions(page, 10);
      if (res?.data) {
        setCommissions(res.data.payments);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching commissions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions(currentPage);
  }, [currentPage]);

  const handleVoid = async (commissionId: number) => {
    try {
      await voidCommission(commissionId);
      setMessage({ text: 'Commission voided successfully', type: 'success' });
      fetchCommissions(currentPage);
    } catch (error) {
      setMessage({ text: 'Error voiding commission', type: 'error' });
    }
  };

  return (
    <>
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <Breadcrumb pageName="Commissions" />
      <CommissionsTable commissions={commissions} loading={loading} onVoid={handleVoid} />
    </>
  );
};

export default CommissionManager;
