import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

function AccountSection() {
  const { accountsEnabled, authReady, user, authError, syncing, signInWithGoogle, signOutUser } =
    useApp()

  if (!accountsEnabled) {
    return (
      <div className="settings-account settings-account-disabled">
        <p>
          Account sync isn't set up for this build. Your check-ins stay on this device, in this
          browser.
        </p>
      </div>
    )
  }

  if (!authReady) return null

  if (user) {
    return (
      <div className="settings-account">
        <div className="settings-account-row">
          {user.photoURL ? (
            <img className="settings-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="settings-avatar settings-avatar-fallback">
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="settings-account-info">
            <span className="settings-account-name">{user.displayName || user.email}</span>
            <span className="settings-account-status">{syncing ? 'Syncing…' : 'Synced to your account'}</span>
          </div>
        </div>
        <button type="button" className="btn btn-ghost tap-target" onClick={signOutUser}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="settings-account">
      <button type="button" className="settings-row tap-target" onClick={signInWithGoogle}>
        <span>Sign in with Google</span>
        <span className="settings-row-hint">sync</span>
      </button>
      {authError && <p className="settings-account-error">{authError}</p>}
    </div>
  )
}

export default function Settings({ onClose }) {
  const { resetAllData, seedTestData } = useApp()
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [seeded, setSeeded] = useState(false)

  function handleSeed() {
    seedTestData()
    setSeeded(true)
    setTimeout(() => setSeeded(false), 1800)
  }

  function handleReset() {
    resetAllData()
    onClose()
  }

  return (
    <motion.div
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <h2 className="sheet-title">Settings</h2>

        <AccountSection />

        <button type="button" className="settings-row tap-target" onClick={handleSeed}>
          <span>Fill in three months of test data</span>
          <span className="settings-row-hint">{seeded ? 'Done' : 'dev'}</span>
        </button>

        <AnimatePresence mode="wait">
          {!confirmingReset ? (
            <motion.button
              key="ask"
              type="button"
              className="settings-row settings-row-danger tap-target"
              onClick={() => setConfirmingReset(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>Reset all data</span>
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              className="settings-confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>This clears every check-in. There's no undo.</p>
              <div className="settings-confirm-actions">
                <button type="button" className="btn btn-ghost tap-target" onClick={() => setConfirmingReset(false)}>
                  Never mind
                </button>
                <button type="button" className="btn btn-danger tap-target" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="button" className="btn btn-ghost sheet-close tap-target" onClick={onClose}>
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
