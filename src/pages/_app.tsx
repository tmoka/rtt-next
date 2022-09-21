import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import React from 'react'
import { SessionProvider } from "next-auth/react"

MyApp.getInitialProps = async () => ({ pageProps: {} })
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
