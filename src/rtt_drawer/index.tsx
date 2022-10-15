import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configureStore from './store/configureStore'
import { genbaIdToKey, getCurrentGenbaIdFromURL } from './utils'
import '../common/vendor.scss'
import './app.global.scss'
import Loading from './components/common/Loading'
import RTTDrawerPage from './containers/RTTDrawerPage'

const { store, persistor } = configureStore()

const targetId = 'rtt-drawer-root'

document.addEventListener('turbolinks:load', () => {
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

document.addEventListener('turbolinks:visit', () => {
  const targetDOM = document.getElementById(targetId)
  if (targetDOM) {
    ReactDOM.unmountComponentAtNode(targetDOM)
  }
})
