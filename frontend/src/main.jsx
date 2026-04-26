import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store.js';
import './index.css';
import App from './App.jsx';
import GSAPProvider from './components/GSAPProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GSAPProvider>
          <App />
      </GSAPProvider>
    </Provider>
  </StrictMode>,
);
