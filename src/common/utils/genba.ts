import { GENBA_KEY_LENGTH, GenbaIdType, GenbaKeyType } from '../types'

/**
 * 数値をゼロ埋めした文字列を返す
 * @param num - 数値
 * @param length - 桁数
 * @returns ゼロ埋めされた文字列
 */
export const padZero = (num: number, length: number): string => `${num}`.padStart(length, '0')

/**
 * サーバ側で使われる現場idをfrontend側で使う現場keyに変換する
 * @param genbaId - サーバ側の現場id
 * @returns frontend側の現場key
 */
export const genbaIdToKey = (genbaId: GenbaIdType): GenbaKeyType =>
  padZero(genbaId, GENBA_KEY_LENGTH)

/**
 * genbaIdToKey の逆の処理
 * @param genbaKey
 * @returns 現場id
 */
export const genbaKeyToId = (genbaKey: GenbaKeyType): GenbaIdType => Number(genbaKey)

/**
 * URLから閲覧中の現場のidを取得する
 */
export const getCurrentGenbaIdFromURL = (): GenbaIdType => {
  if (typeof window === 'object') {
    return Number(window.location.pathname.split('/')[2])
  }
  return 0
}
