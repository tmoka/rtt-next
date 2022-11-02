import { createAsyncAction } from 'typesafe-actions'
import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { GenbaDataType } from '../../common/types'
import { ZUMEN, MenuConfigType, FontsConfigType, LoadFontFileType } from '../constants'
import { asyncShouldLoadFonts, createPDFDownloader } from '../utils'
import { loadAndCacheFonts } from './fonts'

export const DOWNLOAD_PDF_REQUEST = '@@rtt-drawer/DOWNLOAD_PDF_REQUEST'
export const DOWNLOAD_PDF_SUCCESS = '@@rtt-drawer/DOWNLOAD_PDF_SUCCESS'
export const DOWNLOAD_PDF_FAILURE = '@@rtt-drawer/DOWNLOAD_PDF_FAILURE'

const downloadPDFAsyncActionCreator = createAsyncAction(
  DOWNLOAD_PDF_REQUEST,
  DOWNLOAD_PDF_SUCCESS,
  DOWNLOAD_PDF_FAILURE,
)<undefined, undefined, { error: Error }>()

export const downloadPDFRequest = downloadPDFAsyncActionCreator.request
export const downloadPDFSuccess = downloadPDFAsyncActionCreator.success
export const downloadPDFFailure = downloadPDFAsyncActionCreator.failure

/**
 * PDFファイルを生成してダウンロードする
 * @param svgNode - PDFファイルに含めるsvg要素
 * @param genbaData
 * @param zumenType
 * @param menuConfig
 * @param genbaName
 * @param fontsConfig - フォント設定。web と electron で異なる
 * @param loadFontFile - フォントファイル読み込み関数。web と electron で異なる
 */
export const downloadPDF =
  (
    svgNode: React.ReactElement<SVGElement>,
    genbaData: GenbaDataType,
    zumenType: ZUMEN,
    menuConfig: MenuConfigType,
    genbaName: string,
    fontsConfig: FontsConfigType,
    loadFontFile: LoadFontFileType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ThunkAction<void, any, undefined, AnyAction> =>
  async (dispatch) => {
    dispatch(downloadPDFRequest())

    try {
      const shouldDownloadFonts = await asyncShouldLoadFonts(fontsConfig)
      if (shouldDownloadFonts) {
        // フォントファイルがロードされていない場合は、まずロードする
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await dispatch(loadAndCacheFonts(fontsConfig, loadFontFile))
      }

      const downloader = createPDFDownloader(fontsConfig)
      await downloader.download(svgNode, genbaData, zumenType, menuConfig, genbaName)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(err)
      dispatch(downloadPDFFailure({ error }))
      throw error
    }
    dispatch(downloadPDFSuccess())
  }

/**
 * PDFファイルを生成してダウンロードする async action creator の型
 */
export type DownloadPDFAACType = (
  svgNode: React.ReactElement<SVGElement>,
  genbaData: GenbaDataType,
  zumenType: ZUMEN,
  menuConfig: MenuConfigType,
  genbaName: string,
) => void
