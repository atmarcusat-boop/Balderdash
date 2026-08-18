import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

export default function Settings({ onClose }) {
  const { apiKey, setApiKey } = useGame()
  const [value, setValue] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setApiKey(value.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  function handleClear() {
    setValue('')
    setApiKey('')
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

        <div className="settings-account">
          <p className="settings-account-status">
            Spaces uses an LLM to generate fresh words each round. Without a key, it plays from a
            small built-in word list instead.
          </p>
          <form className="settings-auth-form" onSubmit={handleSubmit}>
            <input
              type="password"
              className="settings-input"
              placeholder="Anthropic API key"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="btn btn-primary tap-target">
              {saved ? 'Saved' : 'Save key'}
            </button>
          </form>
          {apiKey && (
            <button type="button" className="settings-auth-toggle tap-target" onClick={handleClear}>
              Remove key, use the built-in word list
            </button>
          )}
        </div>

        <button type="button" className="btn btn-ghost sheet-close tap-target" onClick={onClose}>
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
