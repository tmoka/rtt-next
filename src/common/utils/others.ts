/**
 * async/await に対応した forEach
 *
 * @param array
 * @param callback
 */
export const asyncForEach = async <T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<void>,
): Promise<void> => {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array)
  }
}

/** 配列の要素を置き換える */
export function arrayReplace<T>(arr: T[], index: number, item: T[]): T[] {
  return [...arr.slice(0, index), ...item, ...arr.slice(index + 1)]
}

/** 数字とアルファベットの数 */
const ID_RADIX = 36
/** ランダム id のデフォルトの長さ */
const DEFAULT_ID_LENGTH = 8

/**
 * 指定された長さのランダムid を生成する
 */
export const generateId = (length = DEFAULT_ID_LENGTH): string =>
  Math.floor(Math.random() * ID_RADIX ** length)
    .toString(ID_RADIX)
    .padStart(length, '0')
