import React, { useState, useEffect } from 'react';
import { SalaryPayment } from '../../types/salary';
import { getSalaries, voidSalary } from '../../api/salary_manager';
import SalariesTable from './SalariesTable';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';

const SalaryManager: React.FC = () => {
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSalaries = async (page: number) => {
    try {
      setLoading(true);
      const res = await getSalaries(page, 10);
      if (res?.data) {
        setSalaries(res.data.payments);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching salaries', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries(currentPage);
  }, [currentPage]);

  const handleVoid = async (salaryId: number) => {
    try {
      await voidSalary(salaryId);
      setMessage({ text: 'Salary voided successfully', type: 'success' });
      fetchSalaries(currentPage);
    } catch (error) {
      setMessage({ text: 'Error voiding salary', type: 'error' });
    }
  };

  return (
    <>
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <Breadcrumb pageName="Salaries" />
      <SalariesTable salaries={salaries} loading={loading} onVoid={handleVoid} />
    </>
  );
};

export default SalaryManager;
