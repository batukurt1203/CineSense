import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from '@store/store'
import App from './App'
import '@styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#17171f',
              color: '#f0ece4',
              border: '1px solid rgba(255,255,255,0.07)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#e8c47a', secondary: '#0a0a0f' } },
            error:   { iconTheme: { primary: '#c0392b', secondary: '#f0ece4' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
