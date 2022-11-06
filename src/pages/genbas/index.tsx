import axios from 'axios'
import { useSession } from 'next-auth/react'
import router from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { NextPage } from 'next'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import { PlusLg } from 'react-bootstrap-icons'
import { RTTWebGenbaType } from '../../common/types'

const Genbas: NextPage = () => {
  const session = useSession()

  if (session.status === 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: genbas, error } = useSWR('/api/genbas', fetcher)
  if (!genbas) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>

  return (
    <>
      <h1>現場リスト</h1>
      <Link href={'/genbas/create'}>
        <Button variant='primary'>
          <PlusLg></PlusLg>現場を新規作成する
        </Button>
      </Link>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>現場名</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {genbas.map((genba: RTTWebGenbaType) => {
            return (
              <tr>
                <td>{genba.id}</td>
                <td>{genba.name}</td>
                <td>
                  <Link href={'/genbas/' + genba.id + '/piles'}>
                    <Button variant='primary' id={'genba-pile-button-' + genba.id}>
                      描画
                    </Button>
                  </Link>{' '}
                  <Link href={'/genbas/' + genba.id}>
                    <Button variant='secondary' id={'genba-detail-button-' + genba.id}>
                      詳細
                    </Button>
                  </Link>{' '}
                  <Link href={'/genbas/' + genba.id + '/edit'}>
                    <Button variant='secondary' id={'genba-edit-button-' + genba.id}>
                      編集
                    </Button>
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
