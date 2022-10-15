import fs from 'fs'
import { orderBy } from 'natural-orderby'
import path from 'path'
import readline from 'readline'
import { RTTCommonError } from './errors'

/**
 * ディレクトリ下のファイル名のリストを返す
 * @param dir - 対象ディレクトリ
 * @param filterFunc - ファイル名一覧を絞り込むための関数
 * @returns ファイル名のリスト
 */
export const asyncListFiles = async (
  dir: string,
  filterFunc: (fileName: string) => boolean,
): Promise<string[]> => {
  try {
    const fileNames = await fs.promises.readdir(dir)
    return fileNames.filter(
      (fileName) => fs.statSync(path.join(dir, fileName)).isFile() && filterFunc(fileName),
    )
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new RTTCommonError(`フォルダを開けませんでした: ${dir} 。`)
  }
}

/**
 * 現場ディレクトリに含まれる特定の拡張子のファイルの一覧を取得する
 * @param genbaDirPath - ファイルを含むディレクトリ
 * @param ext - 拡張子。 例: kih
 * @returns ファイル名の配列
 * @detail 大文字小文字を区別しない
 */
export const listFilesByExt = async (genbaDirPath: string, ext: string): Promise<string[]> => {
  const regexp = new RegExp(`.*\\.${ext.toLowerCase().replace('.', '\\.')}$`)
  const filenames = await asyncListFiles(genbaDirPath, (filename) =>
    regexp.test(filename.toLowerCase()),
  )
  return orderBy(filenames)
}

/**
 * ファイルを読み込み、行ごとの文字列の配列を返す
 * @throws ファイルが読み込めない場合はエラー
 */
export const asyncReadLines = (
  filePath: string,
  encoding: BufferEncoding = 'utf-8',
): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, encoding).on('error', (err) => {
      console.error(err) // eslint-disable-line no-console
      reject(new Error('ファイルの内容を読み込めませんでした。'))
    })
    const reader = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    })

    const lines: string[] = []
    reader
      .on('line', (line) => {
        lines.push(line)
      })
      .on('close', () => {
        resolve(lines)
      })
  })
