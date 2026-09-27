import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'vazirmatn/Vazirmatn-font-face.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
