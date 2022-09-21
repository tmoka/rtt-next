import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'

const User: NextPage = () => {
  const router = useRouter()
  const { id } = router.query

  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('/api/users/' + id, fetcher)
  if (!id) return <>Loading</>
  if (!data) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>

  const handleDelete = () => {
    axios
      .delete('/api/users/' + id, data)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(data))
    router.push('/users')
  }

  return (
    <>
      <p>{data.name}</p>
      <p>{data.kana}</p>
      <p>{data.email}</p>
      <Link href={`/users/${encodeURIComponent(data.id)}/edit`}>
        <button>編集</button>
      </Link>
      <button onClick={handleDelete}>削除</button>
    </>
  )
}

export default User
