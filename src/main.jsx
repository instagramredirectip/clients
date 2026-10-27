import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

window.addEventListener('error', (e) => {
  console.error('RUNTIME ERROR:', e.error || e.message);
  const el = document.getElementById('debug-err') || document.createElement('div');
  el.id = 'debug-err';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#b91c1c;color:#fff;padding:16px;font-family:monospace;font-size:12px;white-space:pre-wrap;';
  el.textContent = 'Runtime Error:\n' + (e.error?.stack || e.message || String(e));
  document.body.appendChild(el);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);

