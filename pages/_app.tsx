import { Inter as FontSans } from '@next/font/google'
import { createBrowserSupabaseClient, Session } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import React, { useState } from 'react'
import CommandMenu from '~/components/CommandMenu'
import { AnalyticsProvider } from '~/components/context/analytics'
import { useSignInModal } from '~/components/sign-in-modal'
import { TailwindIndicator } from '~/components/tailwind-indicator'
import { Toaster } from '~/components/ui/toaster'
import { TooltipProvider } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import Footer from '../components/Footer'
import Header from '../components/Header'
import '../styles/globals.css'
import '../styles/markdown.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  const { SignInModal, setShowSignInModal: showSingIn } = useSignInModal()

  return (
    <AnalyticsProvider>
      <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <div className={cn('mx-auto flex min-h-screen flex-col justify-center font-sans', fontSans.variable)}>
              <Header showSingIn={showSingIn} />
              <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
                <Component {...pageProps} showSingIn={showSingIn} />
                <Analytics />
                <CommandMenu />
              </main>
              <Footer />
            </div>
            <TailwindIndicator />
            <Toaster />
            <SignInModal />
          </TooltipProvider>
        </ThemeProvider>
      </SessionContextProvider>
    </AnalyticsProvider>
  )
}

export default MyApp
