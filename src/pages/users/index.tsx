import axios from 'axios'
import { useSession } from 'next-auth/react'
import router from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'
import { Alert, Button, Table } from 'react-bootstrap'

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
  const { data: users, error } = useSWR('/api/users', fetcher)
  if (!users) return <Alert variant='warning'>データをロード中です</Alert>
  if (error) return <Alert variant='danger'>エラーが発生しました</Alert>

  return (
    <>
      <h1>ユーザーリスト</h1>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>氏名</th>
            <th>フリガナ</th>
            <th>メールアドレス</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: UserType) => {
            return (
              <Link href={`users/${user.id}`} >
                <tr style={{ cursor: 'pointer' }}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.kana}</td>
                  <td>{user.email}</td>
                  <td></td>
                </tr>
              </Link>
            )
          })}
        </tbody>
      </Table>
    </>
  )
}

export default Users
