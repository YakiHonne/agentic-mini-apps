import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SWHandler } from 'smart-widget-handler';

// Initialize the SDK first
SWHandler.init({
  // Add any required configuration here
}).then(() => {
  // Render the app
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
  
  // Send ready state immediately after first render
  SWHandler.client.ready()
    .then(() => console.debug('Ready state sent successfully'))
    .catch(error => console.error('Failed to send ready state:', error));
}).catch(error => {
  console.error('SDK initialization failed:', error);
});