import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { DAppProvider, Kovan } from '@usedapp/core';

ReactDOM.render(
  <DAppProvider
    config={{
      networks: [Kovan],
      notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000,
      },
    }}
  >
    <App />
  </DAppProvider>,
  document.getElementById('root'),
);
