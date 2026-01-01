import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Home from './components/Home'
import SendMoney from './components/SendMoney'
import RequestMoney from './components/RequestMoney'
import Wallet from './components/Wallet'
import Activity from './components/Activity'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState('home')

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <>
      {currentView === 'home' && <Home onNavigate={setCurrentView} />}
      {currentView === 'send' && <SendMoney onNavigate={setCurrentView} />}
      {currentView === 'request' && <RequestMoney onNavigate={setCurrentView} />}
      {currentView === 'wallet' && <Wallet onNavigate={setCurrentView} />}
      {currentView === 'activity' && <Activity onNavigate={setCurrentView} />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
