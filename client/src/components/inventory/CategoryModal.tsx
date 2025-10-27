import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { Modal, Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import useColorMode from '../../hooks/useColorMode';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: any) => void;
  category: Product | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ open, onClose, onSave, category }) => {
  const [colorMode] = useColorMode();
  const [formData, setFormData] = useState<any>({
    itemName: '',
    itemModel: '',
    brand: '',
    minPrice: 0,
    maxPrice: 0,
    itemType: 'accessories',
    category: 'accessories',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (category) {
      setFormData({
        itemName: category.itemName,
        itemModel: category.itemModel,
        brand: category.brand,
        minPrice: category.minPrice,
        maxPrice: category.maxPrice,
        itemType: category.itemType,
        category: category.category,
      });
    } else {
      setFormData({
        itemName: '',
        itemModel: '',
        brand: '',
        minPrice: 0,
        maxPrice: 0,
        itemType: 'accessories',
        category: 'accessories',
      });
    }
    setErrors({});
  }, [category, open]);

  const validate = () => {
    let tempErrors: any = {};
    if (!formData.itemName) tempErrors.itemName = "Item name is required.";
    if (!formData.itemModel) tempErrors.itemModel = "Item model is required.";
    if (!formData.brand) tempErrors.brand = "Brand is required.";
    if (formData.minPrice <= 0) tempErrors.minPrice = "Min price must be greater than 0.";
    if (formData.maxPrice <= formData.minPrice) tempErrors.maxPrice = "Max price must be greater than min price.";
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
        <h2>{category ? 'Edit Category' : 'Add Category'}</h2>
        {errors.general && <Typography color="error" sx={{ mb: 2 }}>{errors.general}</Typography>}
        <TextField fullWidth label="Item Name" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} error={!!errors.itemName} helperText={errors.itemName} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Item Model" value={formData.itemModel} onChange={(e) => setFormData({ ...formData, itemModel: e.target.value })} error={!!errors.itemModel} helperText={errors.itemModel} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} error={!!errors.brand} helperText={errors.brand} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Min Price" type="number" value={formData.minPrice} onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })} error={!!errors.minPrice} helperText={errors.minPrice} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <TextField fullWidth label="Max Price" type="number" value={formData.maxPrice} onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })} error={!!errors.maxPrice} helperText={errors.maxPrice} sx={{ mb: 2, input: { color: colorMode === 'dark' ? 'white' : 'black' }, label: { color: colorMode === 'dark' ? 'white' : 'black' } }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="item-type-label" sx={{ color: colorMode === 'dark' ? 'white' : 'black' }}>Item Type</InputLabel>
          <Select
            labelId="item-type-label"
            value={formData.itemType}
            label="Item Type"
            onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
            sx={{
              color: colorMode === 'dark' ? 'white' : 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colorMode === 'dark' ? 'white' : 'black',
              },
              '& .MuiSvgIcon-root': {
                color: colorMode === 'dark' ? 'white' : 'inherit',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colorMode === 'dark' ? '#1C2434' : 'background.paper',
                  color: colorMode === 'dark' ? 'white' : 'black',
                },
              },
            }}
          >
            <MenuItem value="mobiles">Mobiles</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="category-label" sx={{ color: colorMode === 'dark' ? 'white' : 'black' }}>Category</InputLabel>
          <Select
            labelId="category-label"
            value={formData.category}
            label="Category"
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            sx={{
              color: colorMode === 'dark' ? 'white' : 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colorMode === 'dark' ? 'white' : 'black',
              },
              '& .MuiSvgIcon-root': {
                color: colorMode === 'dark' ? 'white' : 'inherit',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: colorMode === 'dark' ? '#1C2434' : 'background.paper',
                  color: colorMode === 'dark' ? 'white' : 'black',
                },
              },
            }}
          >
            <MenuItem value="mobiles">Mobiles</MenuItem>
            <MenuItem value="accessories">Accessories</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSave}>Save</Button>
        <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default CategoryModal;
