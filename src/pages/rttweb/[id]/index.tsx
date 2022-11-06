import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configureStore from '../../../rtt_drawer/store/configureStore'
import { genbaIdToKey, getCurrentGenbaIdFromURL } from '../../../rtt_drawer/utils'
import Loading from '../../../rtt_drawer/components/common/Loading'
import RTTDrawerPage from '../../../rtt_drawer/containers/RTTDrawerPage'
import useSWR from 'swr'
import axios from 'axios'
import { useRouter } from 'next/router'
import { Alert } from 'react-bootstrap'

const { store, persistor } = configureStore()

const rootId = 'rtt-drawer-root'

const genbaId = getCurrentGenbaIdFromURL()
const genbaKey = genbaIdToKey(genbaId)

const RTTWeb = () => {
  const router = useRouter()
  const { id } = router.query

  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data: rttwebGenbaData, error: rttwebError } = useSWR('/api/rttweb/' + id, fetcher)
  const { data: genba, error: genbaError } = useSWR('/api/genbas/' + id, fetcher)
  if (!rttwebGenbaData || !genba) return <Alert variant='warning'>データをロード中です</Alert>
  if (rttwebError || genbaError) return <Alert variant='danger'>エラーが発生しました</Alert>
  rttwebGenbaData.rttwebGenba = { id: genba.id, name: genba.name, kana: genba.kana, motouke: genba.motouke }

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <div id={rootId} data-genba={JSON.stringify(rttwebGenbaData)}>
          <RTTDrawerPage genbaKey={genbaKey} />
        </div>
      </PersistGate>
    </Provider>
  )
}

export default RTTWeb
