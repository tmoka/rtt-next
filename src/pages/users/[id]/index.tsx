import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'
import { Alert, Button, Table } from 'react-bootstrap'
import { ArrowLeftCircle, Trash, Trash3Fill } from 'react-bootstrap-icons'

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
      <h1>{user.name} の詳細</h1>
      <Table>
        <tbody>
          <tr>
            <th>氏名</th>
            <td>{user.name}</td>
          </tr>
          <tr>
            <th>フリガナ</th>
            <td>{user.kana}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{user.email}</td>
          </tr>
          <tr>
            <th>会社</th>
            <td></td>
          </tr>
          <tr>
            <th>権限</th>
            <td></td>
          </tr>
        </tbody>
      </Table>
      <h2>所属している現場</h2>

      <Button className='m-1' variant='danger' onClick={handleDelete}><Trash3Fill /> ユーザを削除</Button><br />
      <Link href={`/users`}>
        <Button className='m-1' variant='secondary'><ArrowLeftCircle /> ユーザーリストに戻る</Button>
      </Link>
    </>
  )
}

export default User
