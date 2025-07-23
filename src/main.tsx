import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SWHandler } from 'smart-widget-handler'; // Import the SDK

// Initialize your app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Notify host application that the widget is ready
SWHandler.client.ready().catch(error => {
  console.error('Failed to notify host application:', error);
});