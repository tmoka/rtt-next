import { format } from 'date-fns'
import sortBy from 'lodash/sortBy'
import { SetsuListType, SetsuZValueType, KGPointType } from '../../common/types'
import { ZUMEN } from '../constants'

/**
 * `setsuList` に含まれる節のz座標の最小値と最大値を求める
 * @param setsuList
 * @returns [z座標最小値, z座標最大値]
 */
export const selectMinMaxSetsuZ = (
  setsuList: SetsuListType,
): [SetsuZValueType, SetsuZValueType] => {
  const setsuValues = sortBy(Object.values(setsuList))
  return [setsuValues[0] || 0, setsuValues[setsuValues.length - 1] || 0]
}

/**
 * Date オブジェクトを yyyy/MM/dd 形式の文字列にフォーマットする
 */
export const getYyyymmdd = (date: Date): string => format(date, 'yyyy/MM/dd')

/**
 * pointからangleを取得する。
 * ただしzumenTypeが平面以外の時は0を返す。
 * @param zumenType
 * @param point
 * @return
 */
export const getAngle = (zumenType: ZUMEN, point?: KGPointType): number => {
  const zumenHeimenOrSetsuComparison =
    zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON
  const deg = point && point.angle && zumenHeimenOrSetsuComparison ? -point.angle : 0
  return deg
}
