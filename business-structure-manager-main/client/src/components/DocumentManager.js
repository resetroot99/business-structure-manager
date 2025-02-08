import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Description as DocumentIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const DocumentManager = ({ businessId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [businessId]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/businesses/${businessId}/documents`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDocuments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename without extension
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', documentTitle);
      formData.append('businessId', businessId);

      const response = await axios.post(
        'http://localhost:5000/api/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      setDocuments([...documents, response.data]);
      setUploadDialog(false);
      setSelectedFile(null);
      setDocumentTitle('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/documents/${documentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documents.find(d => d._id === documentId).title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/documents/${documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Business Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialog(true)}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <List>
        {documents.map((document) => (
          <ListItem
            key={document._id}
            secondaryAction={
              <Box>
                <IconButton onClick={() => handleDownload(document._id)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(document._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemIcon>
              <DocumentIcon />
            </ListItemIcon>
            <ListItemText
              primary={document.title}
              secondary={new Date(document.uploadDate).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Document Title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <input
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Select File
              </Button>
            </label>

            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}

            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setUploadDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || !documentTitle}
              >
                Upload
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default DocumentManager; 