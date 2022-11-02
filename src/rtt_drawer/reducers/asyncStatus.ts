import { Reducer } from 'redux'
import {
  GenbaAction,
  FontsAction,
  PDFAction,
  GET_GENBA_BY_KEY_REQUEST,
  GET_GENBA_BY_KEY_SUCCESS,
  GET_GENBA_BY_KEY_FAILURE,
  LOAD_AND_CACHE_FONTS_REQUEST,
  LOAD_AND_CACHE_FONTS_SUCCESS,
  LOAD_AND_CACHE_FONTS_FAILURE,
  DOWNLOAD_PDF_REQUEST,
  DOWNLOAD_PDF_SUCCESS,
  DOWNLOAD_PDF_FAILURE,
} from '../actions'

/**
 * async action の発行の状態（request/success/failure）を記録するstate。
 * async action の種類ごとに発行中のaction（require/success/failure）をまるごと保持する。
 */
export interface AsyncStatusState {
  /**
   *  現場データ取得の async action の状態
   */
  readonly statusGetGenbaByKey?: GenbaAction
  /**
   * フォントをダウンロードする async action の状態
   */
  readonly statusDownloadAndCacheFonts?: FontsAction
  /**
   * PDFファイルをダウンロードする async action の状態
   */
  readonly statusDownloadPDF?: PDFAction
}

const initialAsyncStatus: AsyncStatusState = {}

const asyncStatusReducer: Reducer<AsyncStatusState, GenbaAction | FontsAction | PDFAction> = (
  state = initialAsyncStatus,
  action,
) => {
  switch (action.type) {
    case GET_GENBA_BY_KEY_REQUEST:
      return {
        // ...state, // <- getGenbaByKeyRequest 時 (= ページ読み込み時) には、
        // ほかの async status をリセットする
        statusGetGenbaByKey: action,
      }
    case GET_GENBA_BY_KEY_SUCCESS:
    case GET_GENBA_BY_KEY_FAILURE:
      return {
        ...state,
        statusGetGenbaByKey: action,
      }
    case LOAD_AND_CACHE_FONTS_REQUEST:
    case LOAD_AND_CACHE_FONTS_SUCCESS:
    case LOAD_AND_CACHE_FONTS_FAILURE:
      return {
        ...state,
        statusDownloadAndCacheFonts: action,
      }
    case DOWNLOAD_PDF_REQUEST:
    case DOWNLOAD_PDF_SUCCESS:
    case DOWNLOAD_PDF_FAILURE:
      return {
        ...state,
        statusDownloadPDF: action,
      }
    default:
      return state
  }
}

export default asyncStatusReducer
