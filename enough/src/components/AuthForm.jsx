import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AuthForm() {
  const { authError, signUpWithEmail, signInWithEmail } = useApp()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    if (mode === 'signup') {
      await signUpWithEmail(email, password)
    } else {
      await signInWithEmail(email, password)
    }
    setSubmitting(false)
  }

  return (
    <>
      <form className="settings-auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="settings-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="settings-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minLength={6}
          required
        />
        <button type="submit" className="btn btn-primary tap-target" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <button
        type="button"
        className="settings-auth-toggle tap-target"
        onClick={() => setMode((m) => (m === 'signup' ? 'login' : 'signup'))}
      >
        {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
      </button>
      {authError && <p className="settings-account-error">{authError}</p>}
    </>
  )
}
