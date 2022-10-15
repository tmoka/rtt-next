import fs from 'fs'
import path from 'path'
import { GenbaType, GenbaFormat } from '../common/types'
import {
  RTTLoader,
  LoaderAllContentType,
  emptyGenbaWithUnknownError,
  LoaderContentType,
  detectGenbaFormat,
} from './loader'
import { RTTLoaderError, CSVKind } from './loader/errors'
import { oldGenbaToCsv, OldGenbaToCsvError } from './oldGenbaToCsv'

/**
 * 現場フォルダ内のある1つのcsvファイルを開いて文字列として読み込む
 * @param genbaDir
 * @param csvKind - 読み込むcsvの種類
 * @returns LoaderContentType
 */
const getLoaderContent = async (genbaDir: string, csvKind: CSVKind): Promise<LoaderContentType> => {
  const csvPath = path.join(genbaDir, `${csvKind}.csv`)
  try {
    const buffer = await fs.promises.readFile(csvPath)
    return buffer.toString()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    throw new RTTLoaderError(`csvファイルを開けませんでした: ${csvKind}.csv`)
  }
}

/**
 * 現場フォルダ内の4つのcsvファイルを開いて文字列として読み込む
 * @param genbaDir
 * @returns LoaderAllContentType
 */
export const getLoaderAllContent = async (genbaDir: string): Promise<LoaderAllContentType> => {
  const [link, point, setsu, torishin] = await Promise.all(
    Object.values(CSVKind).map((csvKind) => getLoaderContent(genbaDir, csvKind)),
  )
  const loaderAllContent = { link, point, setsu, torishin }
  return loaderAllContent
}

/**
 * 指定された現場フォルダをCSV形式として読み込んで描画用のデータを返す
 */
const loadCsvGenbaFiles = async (genbaDir: string): Promise<GenbaType> => {
  const loaderAllContent = await getLoaderAllContent(genbaDir)
  const loader = new RTTLoader()
  const genba = await loader.loadGenba(loaderAllContent, GenbaFormat.CSV)
  return genba
}

/**
 * 指定された現場フォルダを従来版形式として読み込んで描画用のデータを返す
 */
const loadOldGenbaFiles = async (genbaDir: string): Promise<GenbaType> => {
  const allCsvRows = await oldGenbaToCsv(genbaDir)
  const genba = RTTLoader.convert(allCsvRows, GenbaFormat.OLD_GENBA)
  return genba
}

/**
 * 指定された現場フォルダを読み込んで描画用のデータを返す
 * @param genbaDir
 * @returns GenbaType
 */
export const loadGenbaFiles = async (genbaDir: string): Promise<GenbaType> => {
  let genba: GenbaType
  try {
    const format = await detectGenbaFormat(genbaDir)
    genba =
      format === GenbaFormat.CSV
        ? await loadCsvGenbaFiles(genbaDir)
        : await loadOldGenbaFiles(genbaDir)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    genba =
      err instanceof RTTLoaderError || err instanceof OldGenbaToCsvError
        ? {
            rttwebGenba: null,
            genbaData: null,
            errors: err.toKGExceptions(),
          }
        : emptyGenbaWithUnknownError
  }
  return genba
}

/**
 * 現場のデータを json としてファイルに出力する
 * @param genba
 * @param outputPath - 出力する json ファイルのパス
 */
export const dumpGenbaJson = async (genba: GenbaType, outputPath: string): Promise<void> => {
  const genbaJson = JSON.stringify(genba)
  await fs.promises.writeFile(outputPath, genbaJson)
}
