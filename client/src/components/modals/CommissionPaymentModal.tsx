import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DollarSign } from 'lucide-react';

interface CommissionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmit: (phone: string, amount: number) => void;
}

const CommissionPaymentModal: React.FC<CommissionPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSubmit,
}) => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(0);

  const handleSubmit = () => {
    onPaymentSubmit(phone, amount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Pay Commission</DialogTitle>
      <DialogContent>
        <div className="grid gap-4 py-4">
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="standard"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            margin="dense"
            id="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="standard"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Pay</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommissionPaymentModal;