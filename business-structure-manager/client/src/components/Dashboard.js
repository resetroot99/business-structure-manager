/**
 * Business Structure Manager™
 * Component: Dashboard
 * Build: BSM_2024_LITTLE_04
 * Verification: l1ttl3_l4mb_fl33c3
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap 
} from 'reactflow';
import 'reactflow/dist/style.css';
import BusinessFlowChart from './BusinessFlowChart';
import BusinessForm from './BusinessForm';
import OptimizationSuggestions from './OptimizationSuggestions';
import DocumentManager from './DocumentManager';
import ComplianceTracker from './ComplianceTracker';
import axios from 'axios';

const COMPONENT_SIG = 'BSM_2024_LITTLE_04';

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalBusinesses: 0,
    complianceIssues: 0,
    upcomingDeadlines: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [businessesRes, alertsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/businesses', config),
        axios.get('http://localhost:5000/api/optimization/alerts', config)
      ]);

      setBusinesses(businessesRes.data);
      setAlerts(alertsRes.data);
      calculateMetrics(businessesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const calculateMetrics = (businessData) => {
    const complianceIssues = businessData.filter(b => 
      b.compliance?.status === 'Non-Compliant'
    ).length;

    const deadlines = businessData.reduce((count, b) => 
      count + (b.compliance?.upcomingDeadlines?.length || 0), 0
    );

    setMetrics({
      totalBusinesses: businessData.length,
      complianceIssues,
      upcomingDeadlines: deadlines
    });
  };

  const handleBusinessSubmit = async (businessData) => {
    await fetchDashboardData();
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Business Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} textAlign="right">
          <Button
            variant="contained"
            startIcon={<AddBusinessIcon />}
            onClick={() => setShowAddForm(true)}
          >
            Add New Business
          </Button>
        </Grid>
      </Grid>

      {/* Metrics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Businesses</Typography>
            <Typography variant="h3">{metrics.totalBusinesses}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: metrics.complianceIssues ? '#fff4e5' : '#e8f5e9' }}>
            <Typography variant="h6">Compliance Issues</Typography>
            <Typography variant="h3" color={metrics.complianceIssues ? 'error' : 'success'}>
              {metrics.complianceIssues}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Upcoming Deadlines</Typography>
            <Typography variant="h3">{metrics.upcomingDeadlines}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Important Alerts
          </Typography>
          {alerts.map((alert, index) => (
            <Alert 
              key={index}
              severity={alert.severity}
              sx={{ mb: 1 }}
              action={
                alert.action && (
                  <Button color="inherit" size="small">
                    {alert.action}
                  </Button>
                )
              }
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Optimization Suggestions */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <OptimizationSuggestions businesses={businesses} />
      </Paper>

      {/* Document Management */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <DocumentManager businesses={businesses} />
      </Paper>

      {/* Compliance Tracking */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <ComplianceTracker businesses={businesses} />
      </Paper>

      {/* Business Structure Visualization */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Business Structure
        </Typography>
        <BusinessFlowChart businesses={businesses} />
      </Paper>

      {/* Add Business Form Dialog */}
      {showAddForm && (
        <Paper sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                     width: '90%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', p: 3, zIndex: 1000 }}>
          <BusinessForm onSubmit={handleBusinessSubmit} />
          <Button 
            onClick={() => setShowAddForm(false)}
            sx={{ mt: 2 }}
            fullWidth
            variant="outlined"
          >
            Cancel
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard; 