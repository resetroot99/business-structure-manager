import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

const ComplianceTracker = ({ businessId }) => {
  const [compliance, setCompliance] = useState({
    licenses: [],
    taxes: [],
    permits: [],
    deadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchComplianceData();
  }, [businessId]);

  const fetchComplianceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/businesses/${businessId}/compliance`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCompliance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setError('Failed to load compliance data');
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/businesses/${businessId}/compliance/${editItem._id}`,
        editItem,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      fetchComplianceData();
      setEditDialog(false);
      setEditItem(null);
    } catch (error) {
      setError('Failed to update compliance item');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Compliance Tracker
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchComplianceData}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...compliance.licenses, ...compliance.taxes, ...compliance.permits]
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((item) => {
                const daysUntilDue = getDaysUntilDue(item.dueDate);
                return (
                  <TableRow key={item._id}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {new Date(item.dueDate).toLocaleDateString()}
                        {daysUntilDue <= 30 && (
                          <WarningIcon
                            color="warning"
                            fontSize="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(item)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Update Compliance Item</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Status"
              value={editItem?.status || ''}
              onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={editItem?.dueDate?.split('T')[0] || ''}
              onChange={(e) => setEditItem({ ...editItem, dueDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ComplianceTracker; 