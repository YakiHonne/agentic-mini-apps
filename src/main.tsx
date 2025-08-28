import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import SWHandler from 'smart-widget-handler';

// Initialize the root
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Render your app
root.render(<App />);

// Call ready() immediately after render
SWHandler.client.ready()
  .then(() => console.log('Successfully notified parent'))
  .catch((error) => console.error('Failed to notify parent:', error));