import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Paper
} from '@mui/material';
import axios from 'axios';

const BusinessForm = ({ onSubmit, existingBusiness = null }) => {
  const [formData, setFormData] = useState({
    name: existingBusiness?.name || '',
    entityType: existingBusiness?.entityType || 'LLC',
    licenseNumber: existingBusiness?.licenseInfo?.number || '',
    taxId: existingBusiness?.taxId?.ein || '',
    parentCompany: existingBusiness?.parentCompany || '',
    address: existingBusiness?.address || '',
    registrationDate: existingBusiness?.registrationDate || ''
  });

  const entityTypes = [
    'LLC',
    'Corporation',
    'Partnership',
    'Sole Proprietorship',
    'Holding Company'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (existingBusiness) {
        response = await axios.patch(
          `http://localhost:5000/api/businesses/${existingBusiness._id}`,
          formData,
          config
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/businesses',
          formData,
          config
        );
      }

      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error saving business:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {existingBusiness ? 'Edit Business' : 'Add New Business'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Entity Type"
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              required
            >
              {entityTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tax ID (EIN)"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              {existingBusiness ? 'Update Business' : 'Add Business'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BusinessForm; 