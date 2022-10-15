/**
 * lodash を import するまでもないような関数の自前実装。
 * 使用例はテストを参照。
 */

/**
 * 配列の平均値を求める
 *
 * @returns 配列内の数値の平均値。ただし、配列が空のときは NaN。
 */
export const mean = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

/**
 * 与えられた配列から重複する要素を取り除いた配列を返す
 */
export const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr))

/**
 * start 以上 end 未満の整数を start から step ごとに追加した配列を返す。
 * python の `list(range(start, end, step))` と同様の機能。
 */
export const range = (start: number, end: number, step = 1): number[] => {
  const ret = []
  for (let i = start; i < end; i += step) {
    ret.push(i)
  }
  return ret
}

/**
 * 配列を一定個数ごとに分割して、配列の配列を作成する
 *
 * @param arr もとの配列
 * @param size 何個ごとに分割するか
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  const ret = []
  for (let i = 0; i < arr.length; i += size) {
    ret.push(arr.slice(i, i + size))
  }
  return ret
}
