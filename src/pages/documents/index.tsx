import { NextPage } from "next"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"

const Documents: NextPage = () => {
  const router = useRouter()
  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  return (
    <div className='row justify-content-center'>
      <div className='col col-lg-10'>
        <h1>ヘルプ</h1>
        <dl className='row'>
          <dt className='col-sm-3'><Link href='/documents/rttweb'>RTTWebヘルプ</Link></dt>
          <dd className='col-sm-9'>RTT web版のヘルプページ</dd>
          <dt className='col-sm-3'><Link href='/documents/rttapp'>RTTAppヘルプ</Link></dt>
          <dd className='col-sm-9'>RTT デスクトップ版のヘルプページ</dd>
        </dl>
      </div>
    </div>
  )
}

export default Documents