import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configureStore from '../../../rtt_drawer/store/configureStore'
import { genbaIdToKey, getCurrentGenbaIdFromURL } from '../../../rtt_drawer/utils'
import Loading from '../../../rtt_drawer/components/common/Loading'
import RTTDrawerPage from '../../../rtt_drawer/containers/RTTDrawerPage'

const { store, persistor } = configureStore()

const targetId = 'rtt-drawer-root'

typeof window === 'object' && document.addEventListener('turbolinks:load', () => {
  const targetDOM = document.getElementById(targetId)
  const genbaId = getCurrentGenbaIdFromURL()
  const genbaKey = genbaIdToKey(genbaId)
  if (targetDOM) {
    ReactDOM.render(
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <RTTDrawerPage genbaKey={genbaKey} />
        </PersistGate>
      </Provider>,
      targetDOM,
    )
  }
})

typeof window === 'object' && document.addEventListener('turbolinks:visit', () => {
  const targetDOM = document.getElementById(targetId)
  if (targetDOM) {
    ReactDOM.unmountComponentAtNode(targetDOM)
  }
})

const genbaId = getCurrentGenbaIdFromURL()
const genbaKey = genbaIdToKey(genbaId)

const RTT = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <RTTDrawerPage genbaKey={genbaKey} />
      </PersistGate>
    </Provider>
  )
}

export default RTT