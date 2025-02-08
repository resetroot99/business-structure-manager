import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap 
} from 'react-flow-renderer';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const BusinessFlowChart = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/businesses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      transformDataToFlow(response.data);
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  const transformDataToFlow = (businesses) => {
    const flowNodes = [];
    const flowEdges = [];
    
    businesses.forEach((business, index) => {
      // Create node
      flowNodes.push({
        id: business._id,
        type: 'businessNode',
        position: { x: index * 250, y: 0 },
        data: { 
          label: business.name,
          type: business.entityType,
          business: business 
        }
      });

      // Create edges for parent-subsidiary relationships
      if (business.parentCompany) {
        flowEdges.push({
          id: `e-${business.parentCompany}-${business._id}`,
          source: business.parentCompany,
          target: business._id,
          type: 'smoothstep',
          animated: true
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const onNodeClick = (event, node) => {
    setSelectedNode(node.data.business);
  };

  const customNodeStyles = {
    background: '#fff',
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: 180
  };

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedNode && (
        <Paper
          sx={{
            position: 'absolute',
            right: 20,
            top: 20,
            padding: 2,
            width: 300,
            zIndex: 1000
          }}
        >
          <Typography variant="h6">{selectedNode.name}</Typography>
          <Typography>Type: {selectedNode.entityType}</Typography>
          <Typography>License: {selectedNode.licenseInfo?.number}</Typography>
          <Typography>Tax ID: {selectedNode.taxId?.ein}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default BusinessFlowChart; 