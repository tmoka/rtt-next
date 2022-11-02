/**
 * PDF出力に使用するフォントに関する関数群。
 *
 * RTTDrawerでは、PDF出力の際に使用する日本語フォントファィルのデータををブラウザのIndexedDBにキャッシュしている。
 * 初回はダウンロードを行い、ダウンロードしたフォントをファイルのデータをIndexedDBに保存しておく。
 * 2回目以降はIndexedDBに保存されたフォントデータを読み込んでPDFを出力する。
 * これは、日本語フォントファイルが10MB以上のサイズであり毎回サーバからダウンロードするのは時間が無駄になるため。
 */

import { DBSchema, openDB, IDBPDatabase } from 'idb'
import flatten from 'lodash/flatten'
import { pdfMakeStatic, TFontFamily } from 'pdfmake/build/pdfmake'
import { asyncForEach, uniq } from '../../common/utils'
import { FileContentType, FontsConfigType, LoadFontFileType } from '../constants'
import { PDFError } from './errors'

/**
 * 取得すべきフォントのVFSPathのリストをfontsConfigから取り出す
 * @param fontsConfig
 * @returns 取得すべきフォントのVFSPathのリスト
 */
const getUniqueFontVFSPaths = (fontsConfig: FontsConfigType): string[] => {
  const fontPathsList = Object.keys(fontsConfig).map(
    (fontName) => Object.values(fontsConfig[fontName]) as VFSPathType[],
  )
  return uniq(flatten(fontPathsList))
}

/**
 * pdfmakeの仮想ファイルシステムのvfsPathにデータが存在するかどうかを調べる
 * @param pdfMakeLib - pdfMakeライブラリのオブジェクト
 * @param vfsPath
 * @returns
 */
const hasVFSPath = (pdfMakeLib: pdfMakeStatic, vfsPath: VFSPathType): boolean =>
  !!pdfMakeLib.vfs && !!pdfMakeLib.vfs[vfsPath]

/**
 * PDF出力に使用する全てのフォントの読み込みが完了しているかどうかを調べる
 * @param pdfMakeLib - pdfMakeライブラリのオブジェクト
 * @param fontsConfig
 * @returns
 */
export const isFontLoaded = (pdfMakeLib: pdfMakeStatic, fontsConfig: FontsConfigType): boolean =>
  getUniqueFontVFSPaths(fontsConfig).every((vfsPath) => hasVFSPath(pdfMakeLib, vfsPath))

/**
 * ブラウザのIndexedDBに保存するデータのバージョン。
 * IndexedDBに保存されるデータの構造を変更するときは、この値を更新する必要がある。
 * IndexedDBに保存されている古いバージョンのデータは無視される。
 */
const FONTS_DB_VERSION = 20190330

/**
 * IndexedDBにフォントを保存する際に使用するdbの名前
 */
const FONTS_DB_NAME = 'fonts-db'

/**
 * IndexedDBにフォントを保存する際に使用するテーブルの名前
 */
const FONTS_TABLE_NAME = 'fonts-table'

/**
 * PDF生成に使用するフォントを保存する仮想ファイルシステム（Virtual File System, VFS）のパスの型
 */
type VFSPathType = string

/**
 * フォントを保存するIndexedDBのスキーマ
 */
interface FontsDB extends DBSchema {
  // VfSPath -> FileContent の key/value 形式でフォントファイルのデータを保存する
  [FONTS_TABLE_NAME]: {
    key: VFSPathType
    value: FileContentType
  }
}

/**
 * フォントを保存するdbにアクセスするためのPromise
 */
const openFontsDB = async (): Promise<IDBPDatabase<FontsDB>> =>
  openDB<FontsDB>(FONTS_DB_NAME, FONTS_DB_VERSION, {
    upgrade(db) {
      try {
        db.createObjectStore(FONTS_TABLE_NAME)
      } catch (err) {
        // すでに object store が作成されている場合
        console.info(err) // eslint-disable-line no-console
      }
    },
  })

const fontsTable = {
  /**
   * VFSPathに対応するフォントのデータがテーブルに保存されているかどうかを調べる
   * @param key - テーブルのkey
   * @returns
   */
  async hasKey(key: VFSPathType): Promise<boolean> {
    try {
      const count = await (await openFontsDB()).count(FONTS_TABLE_NAME, key)
      return count > 0
    } catch (err) {
      console.error(err) // eslint-disable-line no-console
      throw new PDFError('フォントファイルの読み込みに失敗しました。')
    }
  },
  /**
   * VFSPathに対応するフォントのデータをテーブルから取得する
   * @param key - テーブルのkey
   * @returns フォントデータ。keyが存在しなかった場合はundefined。
   */
  async get(key: VFSPathType): Promise<FileContentType | undefined> {
    try {
      return (await openFontsDB()).get(FONTS_TABLE_NAME, key)
    } catch (err) {
      console.error(err) // eslint-disable-line no-console
      throw new PDFError('フォントファイルの読み込みに失敗しました。')
    }
  },
  /**
   * VFSPathに対応するフォントのデータをテーブルに保存する
   * @param key - テーブルのkey
   * @param val - フォントデータ
   * @returns 挿入したkey
   */
  async set(key: VFSPathType, val: FileContentType): Promise<VFSPathType> {
    try {
      return (await openFontsDB()).put(FONTS_TABLE_NAME, val, key)
    } catch (err) {
      console.error(err) // eslint-disable-line no-console
      throw new PDFError('フォントファイルの保存に失敗しました。')
    }
  },
}

/**
 * URLからファイルをロードしてfontsTableに保存する
 * @param fileVFSPath - fontsTableのkey
 * @param filePath - ロードするファイルのパス
 * @param loadFontFile - フォントファイルを読み込むための関数
 * @returns ロードしたファイルの内容
 */
const asyncLoadAndCacheFile = async (
  fileVFSPath: VFSPathType,
  filePath: string,
  loadFontFile: LoadFontFileType,
): Promise<FileContentType> => {
  let loadedFileContent
  try {
    loadedFileContent = await loadFontFile(filePath)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new PDFError('フォントファイルのロードに失敗しました。')
  }
  await fontsTable.set(fileVFSPath, loadedFileContent)
  return loadedFileContent
}

/**
 * PDF出力に必要なフォントファイルを全てロードしてfontsTableにキャッシュする
 * @param fontsConfig
 * @param loadFontFile
 * @returns ロードしたフォントファイルのデータの配列
 */
export const asyncLoadAndCacheFonts = async (
  fontsConfig: FontsConfigType,
  loadFontFile: LoadFontFileType,
): Promise<FileContentType[]> =>
  Promise.all(
    getUniqueFontVFSPaths(fontsConfig).map((vfsPath) =>
      asyncLoadAndCacheFile(vfsPath, vfsPath, loadFontFile),
    ),
  )

/**
 * fontsTableのキャッシュを調べて、フォントをロードする必要があるかどうか判断する
 * @param fontsConfig
 * @return フォントをロードするべきかどうか
 */
export const asyncShouldLoadFonts = async (fontsConfig: FontsConfigType): Promise<boolean> => {
  const hasKeys = await Promise.all(
    getUniqueFontVFSPaths(fontsConfig).map((vfsPath) => fontsTable.hasKey(vfsPath)),
  )
  return !hasKeys.every((x) => x)
}

/**
 * fontsTableから `vfsPath` に対応するフォントのデータを読み込む
 * @param vfsPath - fontsTableのkey
 * @returns フォントファイルのデータ
 */
const asyncLoadFont = async (vfsPath: VFSPathType): Promise<FileContentType> => {
  const fontFileContent = await fontsTable.get(vfsPath)
  if (!fontFileContent) {
    throw new PDFError('フォントファイルがダウンロードされていません。')
  }
  return fontFileContent
}

/**
 * https://github.com/bpampuch/pdfmake/blob/0.1.60/src/browser-extensions/virtual-fs.js
 * からコピー
 */
const fixFilename = (filename: string): string => {
  /* eslint-disable no-param-reassign */
  if (filename.indexOf(__dirname) === 0) {
    filename = filename.substring(__dirname.length)
  }

  if (filename.indexOf('/') === 0) {
    filename = filename.substring(1)
  }
  /* eslint-enable no-param-reassign */

  return filename
}

/**
 * fontsTableのキャッシュからフォントを読み込んでpdfmakeにセットするデータを構築する
 * @param fontsConfig
 * @returns pdfmakeにセットするためのデータ
 */
export const asyncLoadFonts = async (fontsConfig: FontsConfigType): Promise<TFontFamily> => {
  const uniqueFontVFSPaths = getUniqueFontVFSPaths(fontsConfig)
  const vfs: TFontFamily = {}
  await asyncForEach(uniqueFontVFSPaths, async (vfsPath) => {
    vfs[fixFilename(vfsPath)] = await asyncLoadFont(vfsPath)
  })
  return vfs
}
