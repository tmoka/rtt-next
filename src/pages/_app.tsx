import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import Layout from '../components/Layout'
import 'bootstrap/dist/css/bootstrap.css'
import { SSRProvider } from 'react-bootstrap'

MyApp.getInitialProps = async () => ({ pageProps: {} })
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SSRProvider>
    </SessionProvider>
  )
}

export default MyApp
