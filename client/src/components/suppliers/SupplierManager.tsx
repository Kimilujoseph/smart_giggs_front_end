import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types/supplier';
import { createSupplier, getAllSuppliers, updateSupplier } from '../../api/supplier_manager';
import SuppliersTable from './SuppliersTable';
import SupplierForm from './SupplierForm';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';

const SupplierManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getAllSuppliers();
      if (res?.data.data) {
        setSuppliers(res.data.data);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching suppliers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (supplierData: any) => {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, supplierData);
        setMessage({ text: 'Supplier updated successfully', type: 'success' });
      } else {
        await createSupplier(supplierData);
        setMessage({ text: 'Supplier created successfully', type: 'success' });
      }
      fetchSuppliers();
      setIsModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      setMessage({ text: 'Error saving supplier', type: 'error' });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  return (
    <>
      {message && <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <Breadcrumb pageName="Suppliers" />
      <div className="flex justify-end mb-4">
        <button onClick={() => { setSelectedSupplier(null); setIsModalOpen(true); }} className="bg-primary text-white py-2 px-4 rounded">
          Add Supplier
        </button>
      </div>
      <SuppliersTable suppliers={suppliers} loading={loading} onEdit={handleEdit} />
      <SupplierForm
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSupplier(null); }}
        onSave={handleSave}
        supplier={selectedSupplier}
      />
    </>
  );
};

export default SupplierManager;
