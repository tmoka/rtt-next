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

const { store, persistor } = configureStore()

const rootId = 'rtt-drawer-root'

const genbaId = getCurrentGenbaIdFromURL()
const genbaKey = genbaIdToKey(genbaId)

const RTTWeb = () => {
  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR('/api/rttweb', fetcher)
  if (!data) return <div>Loading</div>
  if (error) return <div>エラーが発生しました</div>
  data.rttwebGenba = { id: 1, name: "テスト用現場", kana: "テストようげんば", motouke: "" }

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <div id={rootId} data-genba={JSON.stringify(data)}>
          <RTTDrawerPage genbaKey={genbaKey} />
        </div>
      </PersistGate>
    </Provider>
  )
}

export default RTTWeb