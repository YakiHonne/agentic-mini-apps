import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { SwipeZapAgent } from '../../shared/components/SwipeZapAgent';
import SwipeZapAgent from './shared/components/SwipeZapAgent';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SwipeZapAgent />
  </StrictMode>,
);
