import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import useColorMode from '../../hooks/useColorMode';
import { Package } from '../../types/package';

interface SalaryPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (salaryData: any) => void;
  user: Package | null;
}

const SalaryPaymentModal: React.FC<SalaryPaymentModalProps> = ({ open, onClose, onSave, user }) => {
  const [colorMode] = useColorMode();
  const [formData, setFormData] = useState<any>({
    amount: 0,
    paymentDate: new Date().toISOString(),
    payPeriodMonth: new Date().getMonth() + 1,
    payPeriodYear: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        employeeId: user.id,
        amount: 0,
        paymentDate: new Date().toISOString(),
        payPeriodMonth: new Date().getMonth() + 1,
        payPeriodYear: new Date().getFullYear(),
      });
    } else {
      setFormData({
        employeeId: 0,
        amount: 0,
        paymentDate: new Date().toISOString(),
        payPeriodMonth: new Date().getMonth() + 1,
        payPeriodYear: new Date().getFullYear(),
      });
    }
    setErrors({});
  }, [user, open]);

  const validate = () => {
    let tempErrors: any = {};
    if (formData.amount <= 0) tempErrors.amount = "Amount must be greater than 0.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: colorMode === 'dark' ? '#1C2434' : 'background.paper',
    color: colorMode === 'dark' ? 'white' : 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <h2>Pay Salary to {user?.name}</h2>
        {errors.general && <Typography color="error" sx={{ mb: 2 }}>{errors.general}</Typography>}
        <TextField fullWidth label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} error={!!errors.amount} helperText={errors.amount} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Payment Date" type="datetime-local" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} error={!!errors.paymentDate} helperText={errors.paymentDate} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Pay Period Month" type="number" value={formData.payPeriodMonth} onChange={(e) => setFormData({ ...formData, payPeriodMonth: Number(e.target.value) })} error={!!errors.payPeriodMonth} helperText={errors.payPeriodMonth} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Pay Period Year" type="number" value={formData.payPeriodYear} onChange={(e) => setFormData({ ...formData, payPeriodYear: Number(e.target.value) })} error={!!errors.payPeriodYear} helperText={errors.payPeriodYear} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <Button variant="contained" onClick={handleSave}>Save</Button>
        <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default SalaryPaymentModal;
