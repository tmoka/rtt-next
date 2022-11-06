import axios from 'axios'
import { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Button, Alert } from 'react-bootstrap'
import Link from 'next/link'

const Genba: NextPage = () => {
  const router = useRouter()
  const { id } = router.query

  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: genba, error } = useSWR('/api/genbas/' + id, fetcher)
  if (!id || !genba) return <Alert variant='warning'>データをロード中です</Alert>
  if (error) return <Alert variant='danger'>エラーが発生しました</Alert>

  const handleDelete = () => {
    axios
      .delete('/api/genbas/' + id, genba)
      .then((res) => {
        alert(JSON.stringify(res))
      })
      .catch((err) => console.error(err))
    alert(JSON.stringify(genba))
    router.push('/genbas')
  }

  return (
    <>
      <h1>現場詳細</h1>
      <p>現場ID：{genba.id}</p>
      <p>現場名：{genba.name}</p>
      <Link href={'/genbas/' + genba.id + '/edit'}>
        <Button variant='secondary'>編集</Button>
      </Link>{' '}
      <Button variant='danger' onClick={handleDelete}>
        削除
      </Button>
    </>
  )
}

export default Genba
