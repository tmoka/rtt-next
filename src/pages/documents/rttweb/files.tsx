import { NextPage } from "next"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { Tab, Tabs } from 'react-bootstrap'
import RTTWebCSVDoc from '../../../components/RTTWebCSVDoc'
import RTTWebOldDoc from "../../../components/RTTWebOldDoc"

const RTTWebFileDocPage: NextPage = () => {
  const router = useRouter()
  const session = useSession()

  if (session.status == 'unauthenticated') {
    router.push('/api/auth/signin')
  }

  const [key, setKey] = useState<string>('csv');

  return (
    <>
      <h1>RTTWeb ヘルプ - 必要ファイル一覧</h1>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => k !== null ? setKey(k) : null}
        className="mb-3"
      >
        <Tab eventKey="csv" title="CSV">
          <RTTWebCSVDoc />
        </Tab>
        <Tab eventKey="profile" title="従来版">
          <RTTWebOldDoc />
        </Tab>
      </Tabs>
    </>
  )
}

export default RTTWebFileDocPage