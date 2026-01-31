import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CustomPagesProvider } from './context/CustomPagesContext'
import 'antd/dist/reset.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomPagesProvider>
        <App />
      </CustomPagesProvider>
    </BrowserRouter>
  </React.StrictMode>
)