import { createAsyncAction } from 'typesafe-actions'
import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { GenbaKeyType, GenbaType } from '../../common/types'

export const GET_GENBA_BY_KEY_REQUEST = '@@rtt-drawer/GET_GENBA_BY_KEY_REQUEST'
export const GET_GENBA_BY_KEY_SUCCESS = '@@rtt-drawer/GET_GENBA_BY_KEY_SUCCESS'
export const GET_GENBA_BY_KEY_FAILURE = '@@rtt-drawer/GET_GENBA_BY_KEY_FAILURE'

const getGenbaByKeyAsyncActionCreator = createAsyncAction(
  GET_GENBA_BY_KEY_REQUEST,
  GET_GENBA_BY_KEY_SUCCESS,
  GET_GENBA_BY_KEY_FAILURE,
)<
  { genbaKey: GenbaKeyType },
  { genbaKey: GenbaKeyType; genba: GenbaType },
  { genbaKey: GenbaKeyType; error: Error }
>()

export const getGenbaByKeyRequest = getGenbaByKeyAsyncActionCreator.request
export const getGenbaByKeySuccess = getGenbaByKeyAsyncActionCreator.success
export const getGenbaByKeyFailure = getGenbaByKeyAsyncActionCreator.failure

/**
 * rails側で生成した現場のデータをhtmlのdata属性を通して受け取る
 * @returns 現場データ
 */
const loadGenba = (): GenbaType => {
  const rttDrawerRootDom = document.getElementById('rtt-drawer-root')
  if (!rttDrawerRootDom) {
    throw new Error()
  }
  const genbaJsonStr = rttDrawerRootDom.dataset.genba || ''
  const genba = JSON.parse(genbaJsonStr) as GenbaType

  return genba
}

/**
 * 指定した `genbaKey` に対応する現場のデータを取得する
 * @param genbaKey
 */
export const getGenbaByKey =
  (
    genbaKey: GenbaKeyType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ThunkAction<void, any, undefined, AnyAction> =>
  (dispatch) => {
    dispatch(getGenbaByKeyRequest({ genbaKey }))

    try {
      const genba = loadGenba()
      dispatch(getGenbaByKeySuccess({ genbaKey, genba }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error(err)
      dispatch(getGenbaByKeyFailure({ genbaKey, error }))
    }
  }

/**
 * 現場データを取得する async action creator の型
 */
export type GetGenbaByKeyAACType = (...params: Parameters<typeof getGenbaByKey>) => void
