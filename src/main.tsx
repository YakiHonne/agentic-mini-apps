import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import SWHandler from 'path-to-your-sw-handler'; // Make sure to import SWHandler

const root = createRoot(document.getElementById("root")!);

root.render(<App />);

// Call ready() after render
SWHandler.client.ready();