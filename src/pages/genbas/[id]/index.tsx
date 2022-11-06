import axios from 'axios'
import { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Button, Alert, Table } from 'react-bootstrap'
import Link from 'next/link'
import { PlusLg } from 'react-bootstrap-icons'

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
      <h1>{genba.name} の詳細</h1>
      <Link href={genba.id + '/edit'}>
        <Button className='m-1' variant='primary'>編集</Button>
      </Link>
      <Link href={'/genbas'}>
        <Button className='m-1' variant='secondary'>現場リストに戻る</Button>
      </Link>
      <Table>
        <tbody>
          <tr>
            <th>ID</th>
            <td>{genba.id}</td>
          </tr>
          <tr>
            <th>現場名</th>
            <td>{genba.name}</td>
          </tr>
          <tr>
            <th>フリガナ</th>
            <td>{genba.kana}</td>
          </tr>
          <tr>
            <th>元請け</th>
            <td></td>
          </tr>
          <tr>
            <th>更新日時</th>
            <td>{genba.updateAt}</td>
          </tr>
          <tr>
            <th>通知先</th>
            <td>
              <Link href={''}>
                <Button variant='primary'>
                  <PlusLg></PlusLg>通知先を追加
                </Button>
              </Link>
            </td>
          </tr>
        </tbody>
      </Table>
      <h2>責任者</h2>
      <Link href={''}>
        <Button variant='primary'>
          <PlusLg></PlusLg>責任者を設定
        </Button>
      </Link>

      <h2>メンバー</h2>
      <Link href={''}>
        <Button variant='primary'>
          <PlusLg></PlusLg>メンバーを設定
        </Button>
      </Link>
      <br />

      <Button className='m-1' variant='danger' onClick={handleDelete}>
        現場を削除
      </Button><br />
      <Link href={'/genbas'}>
        <Button className='m-1' variant='secondary'>現場リストに戻る</Button>
      </Link>
    </>
  )
}

export default Genba
