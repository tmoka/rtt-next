import Image from 'next/image'
import kglogo from '../public/kglogo.bmp'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { useSession } from 'next-auth/react'
import { signIn, signOut } from 'next-auth/react'
import { PersonFill } from 'react-bootstrap-icons'

const Header = () => {
  const { status, data: session } = useSession()

  return (
    <>
      <Navbar bg='white' expand='lg' style={{ borderBottom: '5px solid #517480' }}>
        <Container>
          <Navbar.Brand href='/'>
            <Image
              src={kglogo}
              width='100'
              height='50'
              className='d-inline-block align-top'
              alt='RTTWebのロゴ'
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
              {status === 'unauthenticated' ? (
                <>
                  <Nav.Link href='/'>RTTWeb</Nav.Link>
                  <Nav.Link href='/signup'>新規登録</Nav.Link>
                  <Nav.Link onClick={() => signIn()}>ログイン</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href='/'>RTTWeb</Nav.Link>
                  <NavDropdown title='サポート' id='basic-nav-dropdown'>
                    <NavDropdown.Item href='/releases'>更新履歴</NavDropdown.Item>
                    <NavDropdown.Item href='/documents'>ヘルプ</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title='管理画面' id='basic-nav-dropdown'>
                    <NavDropdown.Item href='/users'>ユーザリスト</NavDropdown.Item>
                    <NavDropdown.Item href='/genbas'>現場リスト</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown
                    title={
                      <span>
                        <PersonFill></PersonFill>
                        {session?.user?.name}
                      </span>
                    }
                    id='basic-nav-dropdown'
                  >
                    <NavDropdown.Item>マイページ</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => signOut()}>ログアウト</NavDropdown.Item>
                  </NavDropdown>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default Header
