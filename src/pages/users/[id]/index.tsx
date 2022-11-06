import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'
import { Alert } from 'react-bootstrap'

const User: NextPage = () => {
  const router = useRouter()
  const { id } = router.query

  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: user, error } = useSWR('/api/users/' + id, fetcher)
  if (!id || !user) return <Alert variant='warning'>データをロード中です</Alert>
  if (error) return <Alert variant='danger'>エラーが発生しました</Alert>

  const handleDelete = () => {
    axios
      .delete('/api/users/' + id, user)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(user))
    router.push('/users')
  }

  return (
    <>
      <p>{user.name}</p>
      <p>{user.kana}</p>
      <p>{user.email}</p>
      <Link href={`/users/${encodeURIComponent(user.id)}/edit`}>
        <button>編集</button>
      </Link>
      <button onClick={handleDelete}>削除</button>
    </>
  )
}

export default User
