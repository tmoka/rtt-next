import { createStore, applyMiddleware, Middleware, Store } from 'redux'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import {
  persistStore,
  persistReducer,
  PersistConfig,
  DEFAULT_VERSION,
  Persistor,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import rootReducer, { RootState } from '../reducers'
import { RootAction } from '../actions'

const middleware: Middleware[] = [thunk]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

/**
 * ブラウザのLocalStorageに保存するデータのバージョン。
 * MenuConfigTypeなどのLocalStorageに保存されるデータの構造を変更するときは、この値を更新する必要がある。
 * もしユーザのLocalStorageのバージョンがこの値より古い場合は、LocalStorageに保存されているデータは無視される。
 * こうすることで、古いデータと新しいコードの不整合を防ぐことができる。
 */
const PERSISTED_STORE_VERSION = 20200810

/**
 * store をブラウザの localStorage に保存する設定
 */
export const persistConfig: PersistConfig<RootState> = {
  key: 'rttDrawerStore',
  version: PERSISTED_STORE_VERSION,
  storage,
  whitelist: ['zumenTypes', 'editorSets', 'form'],
  // eslint-disable-next-line @typescript-eslint/require-await
  migrate: async (restoredState, currentVersion) => {
    const inboundVersion =
      restoredState &&
      restoredState._persist && // eslint-disable-line no-underscore-dangle
      restoredState._persist.version !== undefined // eslint-disable-line no-underscore-dangle
        ? restoredState._persist.version // eslint-disable-line no-underscore-dangle
        : DEFAULT_VERSION
    if (inboundVersion < currentVersion) {
      // localStorage から復元したバージョンが現バージョンより古いときは、復元したデータを破棄する
      return undefined
    }
    return restoredState
  },
}
const persistedRootReducer = persistReducer(persistConfig, rootReducer)

const configureStore = (
  preloadedState?: RootState,
): { store: Store<RootState, RootAction>; persistor: Persistor } => {
  const store = createStore(persistedRootReducer, preloadedState, applyMiddleware(...middleware))
  const persistor = persistStore(store)
  return { store, persistor }
}

export default configureStore
