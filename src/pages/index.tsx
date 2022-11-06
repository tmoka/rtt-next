import Head from 'next/head'
import { useSession, signIn, signOut } from 'next-auth/react'
import router, { Router } from 'next/router'
import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Alert } from 'react-bootstrap'
import { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>RTTWeb</title>
      </Head>
      <SessionComponent />
    </div>
  )
}

export const SessionComponent = () => {
  const [showAlert, setShowAlert] = useState(true);
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session?.user?.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>{' '}
        <Link href='/users'>
          <Button>ユーザ一覧</Button>
        </Link>
      </>
    )
  }
  return (
    <>
      {showAlert ?
        <Alert variant='warning' onClose={() => setShowAlert(false)} dismissible>ログインもしくはアカウント登録してください。</Alert> : null
      }
      <Button onClick={() => signIn()}>ログイン</Button>{' '}
      <Button onClick={() => router.push('signup')}>アカウント登録</Button>
    </>
  )
}

export default Home