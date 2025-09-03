import React, { useState, useEffect } from 'react';
import { Financer } from '../../types/financer';
import { createFinancer, getAllFinancers, updateFinancer } from '../../api/financer_manager';
import FinancersTable from './FinancersTable';
import FinancerForm from './FinancerForm';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';

const FinancerManager: React.FC = () => {
  const [financers, setFinancers] = useState<Financer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFinancer, setSelectedFinancer] = useState<Financer | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const fetchFinancers = async () => {
    try {
      setLoading(true);
      const res = await getAllFinancers();
      if (res?.data) {
        setFinancers(res.data);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching financers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancers();
  }, []);

  const handleSave = async (financerData: any) => {
    try {
      if (selectedFinancer) {
        await updateFinancer(selectedFinancer.id, financerData);
        setMessage({ text: 'Financer updated successfully', type: 'success' });
      } else {
        await createFinancer(financerData);
        setMessage({ text: 'Financer created successfully', type: 'success' });
      }
      fetchFinancers();
      setIsModalOpen(false);
      setSelectedFinancer(null);
    } catch (error) {
      setMessage({ text: 'Error saving financer', type: 'error' });
    }
  };

  const handleEdit = (financer: Financer) => {
    setSelectedFinancer(financer);
    setIsModalOpen(true);
  };

  return (
    <>
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <Breadcrumb pageName="Financers" />
      <div className="flex justify-end mb-4">
        <button onClick={() => { setSelectedFinancer(null); setIsModalOpen(true); }} className="bg-primary text-white py-2 px-4 rounded">
          Add Financer
        </button>
      </div>
      <FinancersTable financers={financers} loading={loading} onEdit={handleEdit} />
      <FinancerForm
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedFinancer(null); }}
        onSave={handleSave}
        financer={selectedFinancer}
      />
    </>
  );
};

export default FinancerManager;
