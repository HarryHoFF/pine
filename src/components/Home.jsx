import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

export default function Home({ onNavigate }) {
  const { user, profile, signOut } = useAuth()
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentTransactions()
  }, [user])

  const loadRecentTransactions = async () => {
    try {
      const [p2pResult, externalResult] = await Promise.all([
        supabase
          .from('transactions')
          .select(`
            *,
            from_profile:from_user_id(name, email),
            to_profile:to_user_id(name, email)
          `)
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
          .order('created_at', { ascending: false }),
        supabase
          .from('external_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (p2pResult.error) throw p2pResult.error
      if (externalResult.error) throw externalResult.error

      const p2pTx = (p2pResult.data || []).map(tx => ({ ...tx, type: 'p2p' }))
      const externalTx = (externalResult.data || []).map(tx => ({ ...tx, type: 'external' }))

      const allTransactions = [...p2pTx, ...externalTx]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)

      setRecentTransactions(allTransactions)
    } catch (err) {
      console.error('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `vor ${diffMins} Min.`
    if (diffHours < 24) return `vor ${diffHours} Std.`
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`

    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getTransactionInfo = (tx) => {
    if (tx.type === 'external') {
      const isPositive = tx.amount > 0
      return {
        isReceived: isPositive,
        name: tx.merchant_name,
        amount: `${isPositive ? '+' : ''}${formatCurrency(tx.amount, tx.currency)}`,
        amountClass: isPositive ? 'amount-positive' : 'amount-negative',
        note: tx.description
      }
    }

    const isReceived = tx.to_user_id === user.id
    const otherUser = isReceived ? tx.from_profile : tx.to_profile

    return {
      isReceived,
      name: otherUser?.name || 'Unbekannt',
      amount: isReceived ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`,
      amountClass: isReceived ? 'amount-positive' : 'amount-negative',
      note: tx.note
    }
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-top">
          <div className="paypal-logo-small">
            <svg viewBox="0 0 124 33" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
              <path fill="#ffffff" d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"/>
              <path fill="#ffffff" d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z"/>
              <path fill="#ffffff" d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z"/>
            </svg>
          </div>
          <button className="logout-btn" onClick={signOut}>
            Abmelden
          </button>
        </div>
      </header>

      <div className="balance-card">
        <div className="balance-label">PayPal-Guthaben</div>
        <div className="balance-amount">{formatCurrency(profile?.balance || 0)}</div>
        <div className="user-name">{profile?.name}</div>
      </div>

      <div className="actions-grid">
        <button className="action-btn" onClick={() => onNavigate('send')}>
          <div className="action-icon send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
          <span>Senden</span>
        </button>

        <button className="action-btn" onClick={() => onNavigate('request')}>
          <div className="action-icon request">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </div>
          <span>Anfordern</span>
        </button>

        <button className="action-btn" onClick={() => onNavigate('wallet')}>
          <div className="action-icon wallet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <span>Wallet</span>
        </button>

        <button className="action-btn" onClick={() => onNavigate('activity')}>
          <div className="action-icon activity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span>Aktivität</span>
        </button>
      </div>

      <div className="info-banner">
        <div className="banner-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="banner-content">
          <div className="banner-title">PayPal-Käuferschutz aktiviert</div>
          <div className="banner-text">Ihre Einkäufe sind durch unseren Käuferschutz abgesichert</div>
        </div>
      </div>

      <div className="features-section">
        <div className="section-title">Entdecken Sie mehr</div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon crypto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <div className="feature-title">Kryptowährungen</div>
            <div className="feature-desc">Bitcoin, Ethereum und mehr kaufen, verkaufen und halten</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon cashback">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div className="feature-title">Cashback & Angebote</div>
            <div className="feature-desc">Bei Tausenden Shops Geld zurück erhalten</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon business">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="feature-title">PayPal Business</div>
            <div className="feature-desc">Tools für Ihr Unternehmen entdecken</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon charity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <div className="feature-title">Spenden sammeln</div>
            <div className="feature-desc">Geld für wohltätige Zwecke sammeln</div>
          </div>
        </div>
      </div>

      <div className="recent-activity-section">
        <div className="section-header">
          <h2>Letzte Aktivitäten</h2>
          <button className="view-all-btn" onClick={() => onNavigate('activity')}>
            Alle anzeigen
          </button>
        </div>

        {loading ? (
          <div className="loading">Lädt...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Keine Aktivitäten</p>
          </div>
        ) : (
          <div className="transactions-list">
            {recentTransactions.map((tx) => {
              const info = getTransactionInfo(tx)
              return (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-left">
                    <div className={`transaction-icon ${info.isReceived ? 'received' : 'sent'}`}>
                      {info.isReceived ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="19" x2="12" y2="5"/>
                          <polyline points="5 12 12 5 19 12"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <polyline points="19 12 12 19 5 12"/>
                        </svg>
                      )}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-name">{info.name}</div>
                      {tx.note && <div className="transaction-note">{tx.note}</div>}
                      <div className="transaction-date">{formatDate(tx.created_at)}</div>
                    </div>
                  </div>
                  <div className={`transaction-amount ${info.amountClass}`}>
                    {info.amount}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
