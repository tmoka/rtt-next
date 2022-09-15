import Head from 'next/head'
import { useSession, signIn, signOut } from "next-auth/react"
import { hash } from 'argon2'

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
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}
