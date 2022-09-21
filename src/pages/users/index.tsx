import axios from 'axios'
import { useSession } from 'next-auth/react'
import router from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'

const Users: NextPage = () => {
  type UserType = {
    id: number
    name: string
    kana: string
    email: string
  }

  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('/api/users', fetcher)
  if (!data) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>

  return (
    <>
      {data.map((user: UserType) => {
        return (
          <>
            <p>{user.name}</p>
            <p>{user.kana}</p>
            <p>{user.email}</p>
            <Link href={`users/${user.id}`}>
              <button>詳細</button>
            </Link>
            <Link href={`users/${user.id}/edit`}>
              <button>編集</button>
            </Link>
            <Link href={`users/${user.id}`}>
              <button>削除</button>
            </Link>
          </>
        )
      })}
    </>
  )
}

export default Users