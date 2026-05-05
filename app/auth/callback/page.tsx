'use client'

/**
 * /auth/callback
 * Supabase redirects here after Google OAuth.
 * Exchanges the PKCE code for a session, sets the auth cookie, redirects to /dashboard.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Supabase sends ?error=... when the OAuth or PKCE step fails on its side.
    // Previously this was silently swallowed — user saw "Sign in with Google" with no explanation.
    const oauthError = params.get('error')
    const oauthDesc  = params.get('error_description')
    if (oauthError) {
      const msg = oauthDesc ? decodeURIComponent(oauthDesc.replace(/\+/g, ' ')) : oauthError
      console.error('[auth/callback] OAuth error from Supabase:', msg)
      setAuthError(msg)
      return
    }

    const code = params.get('code')
    if (!code) {
      // No code and no error — unexpected state, send home.
      router.replace('/')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error) {
        console.error('[auth/callback] exchange failed:', error.message)
        setAuthError(error.message)
        return // do NOT redirect — show the error instead
      }
      if (data.session?.access_token) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`
      }
      router.replace('/dashboard')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (authError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem' }}>
        <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderLeft: '4px solid #c62828', padding: '1rem 1.4rem', maxWidth: 480, fontSize: '.75rem', color: '#c62828', lineHeight: 1.6 }}>
          <strong style={{ display: 'block', marginBottom: '.4rem' }}>Sign-in failed</strong>
          {authError}
        </div>
        <a href="/" style={{ fontSize: '.7rem', color: '#1a3557', fontWeight: 700 }}>Try again</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', fontSize: '.8rem', color: '#888' }}>
      Signing in…
    </div>
  )
}
