import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PostBounty from './components/PostBounty';
import Homepage from './components/Homepage';
import NostrLogin from './components/NostrLogin';
import Dashboard from './components/Dashboard';
import ClaimBounty from './components/ClaimBounty';
import Nearby from './components/Nearby';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<NostrLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post" element={<PostBounty />} />
        <Route path="/claimbounty" element={<ClaimBounty />} />
        <Route path="/nearby" element={<Nearby />}/>
      </Routes>
    </Router>
  );
}

export default App;
