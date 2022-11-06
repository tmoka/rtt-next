import React, { ReactNode } from 'react'
import { Container } from 'react-bootstrap'
import Footer from './Footer'
import Header from './Header'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <Container style={{ width: '1140px' }}>
        <Row>
          <Col sm={3}></Col>
          <Col sm={9} style={{ padding: '10px' }}>{children}</Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default Layout
