import { ListGroup } from 'react-bootstrap'
import Link from 'next/link'
import { PlusLg } from 'react-bootstrap-icons'

const SideMenu = () => {
  return (
    <ListGroup>
      <ListGroup.Item action href='/users'>ユーザーリスト</ListGroup.Item>
      <ListGroup.Item action href='/signup'><PlusLg></PlusLg> 新規アカウント登録</ListGroup.Item>
      <ListGroup.Item action href='/genbas'>現場リスト</ListGroup.Item>
      <ListGroup.Item action href='/genbas/create'><PlusLg></PlusLg> 新規現場作成</ListGroup.Item>
      <ListGroup.Item action href='/releases'>更新履歴</ListGroup.Item>
      <ListGroup.Item action href='/documents'>ヘルプ</ListGroup.Item>
    </ListGroup>
  )
}

export default SideMenu