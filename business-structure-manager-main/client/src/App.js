import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';

/**
 * Business Structure Manager™
 * Copyright © 2024 [Your Name/Company Name]. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App; 