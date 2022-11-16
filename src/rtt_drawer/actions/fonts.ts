import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { createAsyncAction } from 'typesafe-actions'
import { FontsConfigType, LoadFontFileType } from '../constants'
import { asyncLoadAndCacheFonts } from '../utils'

export const LOAD_AND_CACHE_FONTS_REQUEST = '@@rtt-drawer/LOAD_AND_CACHE_FONT_REQUEST'
export const LOAD_AND_CACHE_FONTS_SUCCESS = '@@rtt-drawer/LOAD_AND_CACHE_FONT_SUCCESS'
export const LOAD_AND_CACHE_FONTS_FAILURE = '@@rtt-drawer/LOAD_AND_CACHE_FONT_FAILURE'

const loadAndCacheFontsAsyncActionCreator = createAsyncAction(
  LOAD_AND_CACHE_FONTS_REQUEST,
  LOAD_AND_CACHE_FONTS_SUCCESS,
  LOAD_AND_CACHE_FONTS_FAILURE,
)<undefined, undefined, { error: Error }>()

export const loadAndCacheFontsRequest = loadAndCacheFontsAsyncActionCreator.request
export const loadAndCacheFontsSuccess = loadAndCacheFontsAsyncActionCreator.success
export const loadAndCacheFontsFailure = loadAndCacheFontsAsyncActionCreator.failure

/**
 * `fontsConfig` で設定されたフォントをダウンロードしてブラウザにキャッシュする
 * @param fontsConfig
 */
export const loadAndCacheFonts =
  (
    fontsConfig: FontsConfigType,
    loadFontFile: LoadFontFileType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ThunkAction<void, any, undefined, AnyAction> =>
  async (dispatch) => {
    dispatch(loadAndCacheFontsRequest())

    try {
      await asyncLoadAndCacheFonts(fontsConfig, loadFontFile)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(err)
      dispatch(loadAndCacheFontsFailure({ error }))
      throw error
    }
    dispatch(loadAndCacheFontsSuccess())
  }
