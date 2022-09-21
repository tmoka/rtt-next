import axios from 'axios'
import { useSession } from 'next-auth/react'
import router from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

const Genbas: NextPage = () => {
  type GenbaType = {
    id: number
    name: string
    motouke?: string
  }

  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  /*
  const { data, error } = useSWR('/api/genbas', fetcher)
  if (!data) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>

  */

  const data = [
    {
      id: 1,
      name: 'テスト現場',
      motouke: '竹中工務店',
    },
    {
      id: 2,
      name: '現場現場',
      motouke: '',
    },
  ]

  return (
    <>
      <h1>現場リスト</h1>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>現場名</th>
            <th>元請け</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((genba: GenbaType) => {
            return (
              <tr>
                <td>{genba.id}</td>
                <td>{genba.name}</td>
                <td>{genba?.motouke}</td>
                <td>
                  <Link href={'/'}>
                    <Button variant='primary'>描画</Button>
                  </Link>
                  <Link href={'/'}>
                    <Button variant='secondary'>詳細</Button>
                  </Link>
                  <Link href={'/'}>
                    <Button variant='secondary'>フォルダ</Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </>
  )
}

export default Genbas
