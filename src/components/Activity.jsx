import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Activity.css'

export default function Activity({ onNavigate }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [user])

  const loadTransactions = async () => {
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

      const allTransactions = [...p2pTx, ...externalTx].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )

      setTransactions(allTransactions)
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
        note: tx.description,
        transactionType: tx.transaction_type
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
    <div className="activity-container">
      <header className="activity-header">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1>Aktivität</h1>
        <div style={{width: '40px'}}></div>
      </header>

      <div className="activity-content">
        {loading ? (
          <div className="loading">Lädt...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h2>Keine Aktivitäten</h2>
            <p>Deine Transaktionen werden hier angezeigt</p>
          </div>
        ) : (
          <>
            <div className="transactions-list">
              {transactions.map((tx) => {
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
                        {info.transactionType && (
                          <div className="transaction-note">{info.transactionType}</div>
                        )}
                        {info.note && <div className="transaction-note">{info.note}</div>}
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
            <div className="update-notice">
              Transaktionen werden aktualisiert.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
