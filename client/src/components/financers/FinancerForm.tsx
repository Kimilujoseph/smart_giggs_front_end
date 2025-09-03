import React, { useState, useEffect } from 'react';
import { Financer } from '../../types/financer';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import useColorMode from '../../hooks/useColorMode';

interface FinancerFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (financer: any) => void;
  financer: Financer | null;
}

const FinancerForm: React.FC<FinancerFormProps> = ({ open, onClose, onSave, financer }) => {
  const [colorMode] = useColorMode();
  const [formData, setFormData] = useState<any>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (financer) {
      setFormData({
        name: financer.name,
        contactName: financer.contactName,
        phone: financer.phone,
        email: financer.email,
        address: financer.address,
      });
    } else {
      setFormData({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
      });
    }
    setErrors({});
  }, [financer, open]);

  const validate = () => {
    let tempErrors: any = {};
    if (!formData.name) tempErrors.name = "Name is required.";
    if (!formData.contactName) tempErrors.contactName = "Contact name is required.";
    if (!formData.phone) tempErrors.phone = "Phone is required.";
    if (!formData.email) tempErrors.email = "Email is required.";
    if (!formData.address) tempErrors.address = "Address is required.";
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
        <h2>{financer ? 'Edit Financer' : 'Add Financer'}</h2>
        {errors.general && <Typography color="error" sx={{ mb: 2 }}>{errors.general}</Typography>}
        <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={!!errors.name} helperText={errors.name} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Contact Name" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} error={!!errors.contactName} helperText={errors.contactName} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} error={!!errors.phone} helperText={errors.phone} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={!!errors.email} helperText={errors.email} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} error={!!errors.address} helperText={errors.address} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <Button variant="contained" onClick={handleSave}>Save</Button>
        <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default FinancerForm;
