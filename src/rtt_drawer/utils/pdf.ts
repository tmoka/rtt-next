/**
 * PDF出力に関連する関数群
 */

import { format } from 'date-fns'
import { saveAs } from 'file-saver'
import pdfMake, {
  PageOrientation,
  PageSize,
  TDocumentDefinitions,
  TFontFamily,
} from 'pdfmake/build/pdfmake'
import { renderToStaticMarkup } from 'react-dom/server'
import pkg from '../../../package.json'
import { GenbaDataType } from '../../common/types'
import { FontsConfigType, MenuConfigType, ZUMEN, ZUMEN_TO_JA } from '../constants'
import { PDFError } from './errors'
import { getSetsuOrToriName } from './menu'
import { asyncLoadFonts } from './pdfFonts'

/**
 * SVG-to-PDFKit に渡す callback 関数の型。
 * どういうときにどの書体を利用するかを決める関数。
 */
type FontCallbackType = (
  family: string,
  isBold: boolean,
  isItalic: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fontOptions?: any,
) => string | undefined

const RTTAPP_VERSION =
  process.env.NODE_ENV === 'development' ? `${pkg.version} development` : pkg.version
const APP_NAME = process.env.TARGET === 'web' ? 'RTTWeb' : `RTTApp ${RTTAPP_VERSION}`
const A4_LANDSCAPE_PAGE_SIZE = {
  height: 595.28,
  width: 841.89,
}

/**
 * pdfmakeに渡すための、PDFファイルの内容を定義するデータを生成する
 * @param genba
 * @param rttwebGenba
 * @param genbaData
 * @param zumenType
 * @param menuConfig
 * @param fontCallback
 * @param defaultFontName - PDF出力に使用するフォント名
 * @returns PDFファイルの内容定義データ
 * @remarks https://pdfmake.github.io/docs/
 */
const createDocDefinition = (
  svgNode: React.ReactElement<SVGElement>,
  fontCallback: FontCallbackType,
  defaultFontName: string,
): TDocumentDefinitions => {
  const svgStr = renderToStaticMarkup(svgNode)

  const width = 680
  const pageMargin = 40
  const content = [
    {
      svg: svgStr,
      width,
      height: width * (3 / 4),
      margin: [(A4_LANDSCAPE_PAGE_SIZE.width - width - pageMargin * 2) / 2, 0],
      options: {
        fontCallback,
      },
    },
  ]

  const docDefinition = {
    content,
    footer: () => ({
      columns: [
        {
          text: `${APP_NAME} kangi ${format(new Date(), 'yyyy/MM/dd HH:mm')}`,
          alignment: 'center',
          fontSize: 8,
        },
      ],
    }),
    defaultStyle: {
      font: defaultFontName,
    },
    pageSize: 'A4' as PageSize,
    pageOrientation: 'LANDSCAPE' as PageOrientation,
    pageMargins: [pageMargin, pageMargin] as [number, number],
  }
  return docDefinition
}

/**
 * pdfmakeのドキュメント定義データをもとにpdfmakeのDocumentを生成する
 * @param docDefinition
 * @param fontConfig
 * @param fontsVfs
 * @returns pdfmakeのDocumentのBlob形式のデータ
 */
const asyncCreatePDFBlob = (
  docDefinition: TDocumentDefinitions,
  fontsConfig: FontsConfigType,
  fontsVfs: TFontFamily,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition, null, fontsConfig, fontsVfs)
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob)
      })
    } catch (err) {
      reject(err)
    }
  })

/**
 * 選択されている図面や通り芯から、pdfファイル名を決定する
 * @returns pdfファイル名
 */
const generateFileName = (
  genbaData: GenbaDataType,
  zumenType: ZUMEN,
  menuConfig: MenuConfigType,
  genbaName: string,
): string => {
  const setsuOrToriName = getSetsuOrToriName(genbaData, zumenType, menuConfig) || ''
  const basename = [genbaName, ZUMEN_TO_JA[zumenType], setsuOrToriName].join('_')
  return `${basename}.pdf`
}

/**
 * PDFダウンロード用オブジェクトの型
 */
export interface PDFDownloader {
  download: (
    svgNode: React.ReactElement<SVGElement>,
    genbaData: GenbaDataType,
    zumenType: ZUMEN,
    menuConfig: MenuConfigType,
    genbaName: string,
  ) => Promise<void>
}

export const createPDFDownloader = (fontsConfig: FontsConfigType): PDFDownloader => ({
  /**
   * PDFファイルを生成してダウンロードする
   * @param svgNode - PDFに変換したいsvg要素
   * @param genbaData
   * @param zumenType
   * @param menuConfig
   * @param genbaName
   */
  async download(svgNode, genbaData, zumenType, menuConfig, genbaName) {
    try {
      const fileName = generateFileName(genbaData, zumenType, menuConfig, genbaName)

      const defaultFontName = Object.keys(fontsConfig)[0]

      const fontCallback: FontCallbackType = (_family, bold, italic) => {
        // eslint-disable-next-line no-nested-ternary
        const styleKey = bold ? (italic ? 'bolditalics' : 'bold') : italic ? 'italics' : 'normal'
        return fontsConfig[defaultFontName][styleKey]
      }

      const docDefinition = createDocDefinition(svgNode, fontCallback, defaultFontName)

      const fontsVfs = await asyncLoadFonts(fontsConfig)
      const blob = await asyncCreatePDFBlob(docDefinition, fontsConfig, fontsVfs)

      if (process.env.E2E_BUILD) {
        // テスト時はダウンロードの代わりにpdfデータをconsoleに出力し、その内容をチェックする
        const dataUrl = URL.createObjectURL(blob)
        // eslint-disable-next-line no-console
        console.info(`RTT_DRAWER_PDF_DATA:${dataUrl}`)
      } else {
        saveAs(blob, fileName)
      }
    } catch (err) {
      console.error(err) // eslint-disable-line no-console
      if (/File '.*' not found in virtual file system/.test(err)) {
        throw new PDFError('フォントファイルの読み込みに失敗しました。')
      } else {
        throw new PDFError('pdfファイルの作成に失敗しました。')
      }
    }
  },
})
