import Head from 'next/head'
import { useSession, signIn, signOut } from 'next-auth/react'
import router, { Router } from 'next/router'
import React from 'react'
import Link from 'next/link'
import { Button } from 'react-bootstrap'

export default function Home() {
  return (
    <div>
      <Head>
        <title>POC</title>
      </Head>
      <SessionComponent />
    </div>
  )
}

export function SessionComponent() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session?.user?.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
        <Link href='/users'>
          <Button>ユーザ一覧</Button>
        </Link>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <Button onClick={() => signIn()}>Sign in</Button>
      <Button onClick={() => router.push('signup')}>アカウント登録</Button>
    </>
  )
}
