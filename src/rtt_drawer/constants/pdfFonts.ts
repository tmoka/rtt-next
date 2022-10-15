/**
 * PDF出力に使用するフォントに関する設定
 */

import axios from 'axios'
import { TFontFamilyTypes } from 'pdfmake/build/pdfmake'

/**
 * バックエンドのホスト名
 */
const remoteHost =
  process.env.NODE_ENV === 'production' ? 'https://app.kangi3d.com' : 'http://localhost:3000'

/**
 * フォントをダウンロードするホスト名
 */
export const KANGI3D_HOST = process.env.TARGET === 'web' ? window.location.origin : remoteHost

/**
 * 日本語用のフォント名
 */
const jpFontName = 'NotoSansCJKjp'

const [notoSansCJKjpRegularMin, notoSansCJKjpBoldMin] =
  process.env.NODE_ENV === 'test' || process.env.TARGET === 'node'
    ? ['DUMMY_PATH', 'DUMMY_PATH']
    : [
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
        require('../../../assets/fonts/NotoSansCJKjp-Regular.min.ttf').default as string,
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
        require('../../../assets/fonts/NotoSansCJKjp-Bold.min.ttf').default as string,
      ]

const notoSansCJKjpRegularMinURL = `${KANGI3D_HOST}${notoSansCJKjpRegularMin}`
const notoSansCJKjpBoldMinURL = `${KANGI3D_HOST}${notoSansCJKjpBoldMin}`

/**
 * pdfMake に渡すフォント設定の型
 */
export interface FontsConfigType {
  readonly [fontName: string]: FontConfigType
}

/**
 * pdfMake に渡すフォント設定のうちの1フォント分の型
 */
export type FontConfigType = TFontFamilyTypes

/**
 * web用のフォント設定
 */
export const fontsConfigOnWeb: FontsConfigType = {
  [jpFontName]: {
    normal: notoSansCJKjpRegularMinURL,
    bold: notoSansCJKjpBoldMinURL,
    italics: notoSansCJKjpRegularMinURL,
    bolditalics: notoSansCJKjpBoldMinURL,
  },
}

/**
 * ArrayBufferをbase64形式の文字列に変換する
 * @param arrayBuffer
 * @returns base64文字列
 */
const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer): string => {
  let binary = ''
  const bytes = new Uint8Array(arrayBuffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * フォントファイルのデータの型。
 * フォントファイルのバイナリデータをbase64形式の文字列に変換して保存する。
 */
export type FileContentType = string

/**
 * フォントファイルを読み込む関数の型
 */
export type LoadFontFileType = (filePath: string) => Promise<FileContentType>

/**
 * urlからファイルをダウンロードして、ファイルの内容をbase64文字列に変換する
 * @param url - ファイルのURL
 * @returns ファイルの内容をbase64形式に変換した文字列
 */
export const asyncDownloadBase64: LoadFontFileType = async (url) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })
  const base64Str = arrayBufferToBase64(response.data)
  return base64Str
}
