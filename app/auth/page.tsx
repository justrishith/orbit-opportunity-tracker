"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup"); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { if (mode === "signup") await createUserWithEmailAndPassword(auth, email, password); else await signInWithEmailAndPassword(auth, email, password); window.location.href = "/onboarding"; } catch (err) { setError(friendlyAuthError(err)); } finally { setBusy(false); } }
  async function provider(provider: "google" | "github") { setError(""); try { await signInWithPopup(auth, provider === "google" ? new GoogleAuthProvider() : new GithubAuthProvider()); window.location.href = "/onboarding"; } catch (err) { setError(friendlyAuthError(err)); } }
  return <main className="auth-page"><div className="auth-top"><Link href="/" className="app-brand">orbit<span>.</span></Link><Link href="/" className="back-link"><ArrowLeft size={14} /> back home</Link></div><section className="auth-layout"><div className="auth-aside"><span className="app-eyebrow"><span className="eyebrow-line" /> your space, kept simple</span><h1>Make a little<br /><em>room to move.</em></h1><p>Orbit keeps internships, programs, and your next applications in one place.</p><div className="auth-aside-note">who i am · what i do · what we do</div></div><div className="auth-card"><div className="auth-card-head"><span className="app-eyebrow">{mode === "signup" ? "first time here" : "welcome back"}</span><h2>{mode === "signup" ? "Create your orbit." : "Return to orbit."}</h2><p>{mode === "signup" ? "Your account starts with an email and password." : "Pick up where you left off."}</p></div><div className="provider-row"><button onClick={() => provider("google")}><GoogleMark /> continue with Google</button><button onClick={() => provider("github")}><Github size={17} /> continue with GitHub</button></div><div className="or-divider"><span>or use email + password</span></div><form onSubmit={submit}><label>email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>password<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="at least 6 characters" /></label>{error && <p className="form-error">{error}</p>}<button className="app-button dark auth-submit" disabled={busy}>{busy ? "one moment…" : mode === "signup" ? "create account" : "sign in"}<ArrowUpRight size={15} /></button></form><p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to orbit?"} <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>{mode === "signup" ? "sign in" : "create one"}</button></p></div></section></main>;
}

function friendlyAuthError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code === "auth/operation-not-allowed") return "GitHub sign-in is not enabled in Firebase yet. Enable GitHub under Authentication → Sign-in method.";
  if (code === "auth/popup-closed-by-user") return "The sign-in window was closed before it finished.";
  if (code === "auth/account-exists-with-different-credential") return "An account already exists with this email. Sign in using its original method.";
  return error instanceof Error ? error.message.replace("Firebase: ", "") : "Could not complete that request.";
}

function GoogleMark() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 12.27c0-.73-.07-1.43-.2-2.1H12v3.98h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.27Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.53 13.68a5.85 5.85 0 0 1 0-3.36V7.79H3.28a9.75 9.75 0 0 0 0 8.42l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8.01 9.46 6.29 12 6.29Z"/></svg>;
}
