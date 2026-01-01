import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './SendMoney.css'

export default function SendMoney({ onNavigate }) {
  const { profile, user, refreshProfile } = useAuth()
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientUser, setRecipientUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const amountNum = parseFloat(amount)

      if (!recipientEmail.trim()) {
        throw new Error('Bitte gib eine E-Mail-Adresse ein')
      }

      if (recipientEmail.toLowerCase() === user.email.toLowerCase()) {
        throw new Error('Du kannst kein Geld an dich selbst senden')
      }

      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Bitte gib einen gültigen Betrag ein')
      }

      if (amountNum > profile.balance) {
        throw new Error('Nicht genügend Guthaben')
      }

      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .ilike('email', recipientEmail.trim())
        .maybeSingle()

      if (recipientError) throw recipientError

      if (!recipient) {
        throw new Error('Empfänger nicht gefunden')
      }

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          from_user_id: user.id,
          to_user_id: recipient.id,
          amount: amountNum,
          note: note.trim() || null
        })

      if (txError) throw txError

      setRecipientUser(recipient)
      setSuccess(true)
      await refreshProfile()

      setTimeout(() => {
        onNavigate('home')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Transaktion fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (success) {
    return (
      <div className="send-container">
        <header className="send-header">
          <button className="back-btn" onClick={() => onNavigate('home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1>Geld senden</h1>
          <div style={{width: '40px'}}></div>
        </header>

        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Erfolgreich gesendet!</h2>
          <p>{formatCurrency(parseFloat(amount))} an {recipientUser.name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="send-container">
      <header className="send-header">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1>Geld senden</h1>
        <div style={{width: '40px'}}></div>
      </header>

      <div className="send-content">
        <div className="balance-info">
          Verfügbar: {formatCurrency(profile?.balance || 0)}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label>An</label>
            <input
              type="email"
              placeholder="E-Mail-Adresse des Empfängers"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Betrag</label>
            <div className="amount-input">
              <span className="currency-symbol">€</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notiz (optional)</label>
            <input
              type="text"
              placeholder="Wofür ist diese Zahlung?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength="100"
            />
          </div>

          <button type="submit" className="btn-send" disabled={loading}>
            {loading ? 'Wird gesendet...' : 'Jetzt senden'}
          </button>
        </form>
      </div>
    </div>
  )
}
