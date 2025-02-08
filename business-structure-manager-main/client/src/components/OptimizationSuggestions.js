import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const OptimizationSuggestions = ({ businessId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [businessId]);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/optimization/suggestions/${businessId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuggestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (type) => {
    switch (type) {
      case 'CRITICAL':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'OPPORTUNITY':
        return 'success';
      default:
        return 'info';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'STRUCTURE':
        return <AccountBalanceIcon />;
      case 'LEGAL':
        return <WarningIcon />;
      case 'TAX':
        return <TrendingUpIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Smart Optimization Suggestions
      </Typography>

      {suggestions.length === 0 ? (
        <Typography color="text.secondary">
          No optimization suggestions at this time. Your business structure looks optimal!
        </Typography>
      ) : (
        suggestions.map((suggestion, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemIcon>
                  {getIcon(suggestion.type)}
                </ListItemIcon>
                <Typography sx={{ flex: 1 }}>
                  {suggestion.recommendation}
                </Typography>
                <Chip 
                  label={suggestion.type}
                  color={getSeverityColor(suggestion.type)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary" paragraph>
                {suggestion.reason}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Recommended Steps:
              </Typography>
              <List dense>
                {suggestion.steps.map((step, stepIndex) => (
                  <ListItem key={stepIndex}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Typography color="text.secondary">
                        {stepIndex + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>

              {suggestion.resources && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Helpful Resources:
                  </Typography>
                  {suggestion.resources.map((resource, resourceIndex) => (
                    <Button
                      key={resourceIndex}
                      variant="outlined"
                      size="small"
                      href={resource.url}
                      target="_blank"
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {resource.title}
                    </Button>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

export default OptimizationSuggestions; 