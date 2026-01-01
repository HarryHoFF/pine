import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Wallet.css'

export default function Wallet({ onNavigate }) {
  const { profile } = useAuth()
  const [showAddCard, setShowAddCard] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="wallet-container">
      <header className="wallet-header">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1>Wallet</h1>
        <div style={{width: '40px'}}></div>
      </header>

      <div className="wallet-content">
        <div className="balance-section">
          <div className="balance-label">PayPal-Guthaben</div>
          <div className="balance-amount">{formatCurrency(profile?.balance || 0)}</div>
        </div>

        <div className="section">
          <div className="section-title">Zahlungsmethoden</div>

          <div className="payment-methods">
            <div className="payment-card">
              <div className="card-info">
                <div className="card-type-icon bank">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="card-details">
                  <div className="card-name">Union-Bank</div>
                  <div className="card-number">Konto ••••••••</div>
                </div>
              </div>
              <div className="card-badge primary">Primär</div>
            </div>

            <button className="add-payment-btn" onClick={() => setShowAddCard(true)}>
              <div className="add-icon">+</div>
              <span>Zahlungsmethode hinzufügen</span>
            </button>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Aktionen</div>

          <div className="wallet-actions">
            <button className="action-item">
              <div className="action-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
              </div>
              <div className="action-item-text">
                <div className="action-item-title">Geld einzahlen</div>
                <div className="action-item-desc">Von Bankkonto auf PayPal</div>
              </div>
              <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button className="action-item">
              <div className="action-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              </div>
              <div className="action-item-text">
                <div className="action-item-title">Geld abheben</div>
                <div className="action-item-desc">Auf Bankkonto übertragen</div>
              </div>
              <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button className="action-item">
              <div className="action-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div className="action-item-text">
                <div className="action-item-title">Währungen verwalten</div>
                <div className="action-item-desc">Guthaben in verschiedenen Währungen</div>
              </div>
              <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showAddCard && (
        <div className="modal-overlay" onClick={() => setShowAddCard(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Zahlungsmethode hinzufügen</h2>
              <button className="modal-close" onClick={() => setShowAddCard(false)}>×</button>
            </div>
            <div className="modal-content">
              <button className="modal-option">
                <div className="modal-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="modal-option-text">
                  <div className="modal-option-title">Bankkonto</div>
                  <div className="modal-option-desc">Konto per Überweisung verifizieren</div>
                </div>
              </button>
              <button className="modal-option">
                <div className="modal-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div className="modal-option-text">
                  <div className="modal-option-title">Kredit- oder Debitkarte</div>
                  <div className="modal-option-desc">Visa, Mastercard, Amex</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
