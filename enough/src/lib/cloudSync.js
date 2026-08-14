// Thin wrapper around the Firestore calls the app needs. Each signed-in
// user's check-ins live in a single document at users/{uid}, shaped exactly
// like the local checkins object: { "2026-08-14": { sleep: true, ... } }.
//
// Merges are last-write-wins per item, not per whole day — so if the same
// date has different items ticked on two devices, both sets survive.

import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'

function userDoc(uid) {
  return doc(db, 'users', uid)
}

export function mergeCheckins(a, b) {
  const merged = { ...a }
  for (const [day, entry] of Object.entries(b)) {
    merged[day] = { ...merged[day], ...entry }
  }
  return merged
}

export async function fetchRemoteCheckins(uid) {
  const snap = await getDoc(userDoc(uid))
  return snap.exists() ? snap.data().checkins || {} : {}
}

export async function writeRemoteCheckins(uid, checkins) {
  await setDoc(userDoc(uid), { checkins }, { merge: true })
}

export function subscribeRemoteCheckins(uid, onChange) {
  return onSnapshot(userDoc(uid), (snap) => {
    if (snap.exists()) onChange(snap.data().checkins || {})
  })
}
