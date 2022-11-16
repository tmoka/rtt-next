import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import memoizeOne from 'memoize-one'
import { GaihekiType, GenbaDataType, PointsType, LinkType } from '../../common/types'
import { ZUMEN_TYPE_TO_AS_XYZ, ZUMEN, MenuConfigType, ZumenRangeType } from '../constants'
import { pointToKey } from './point'
import { selectMinMaxSetsuZ } from './common'

/**
 * GenbaDataType から外壁の描画に必要なデータを取り出す。
 * @param genbaData
 * @param menuConfig
 * @param zumenType
 * @returns 外壁の描画に必要なデータ
 */
export const selectGaiheki = (
  genbaData: GenbaDataType,
  menuConfig: MenuConfigType,
  zumenType: ZUMEN.GAIHEKI1 | ZUMEN.GAIHEKI2,
): GaihekiType => {
  const { heimenList } = genbaData
  const { setsuList, gaihekiTorishin } = genbaData.zentai
  const { gaiheki1XKey, gaiheki2YKey } = menuConfig
  const { asX } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]

  let points: PointsType = {}
  const links: LinkType[] = []

  const key = zumenType === ZUMEN.GAIHEKI1 ? gaiheki1XKey : gaiheki2YKey
  if (!key) {
    const gaihekiData = { points, links }
    return gaihekiData
  }

  // 節ごとのループの中で、前回出現したポイントを所属する通りごとに記憶しておく
  let prevPointByTori: PointsType = {}

  sortBy(Object.keys(setsuList), (setsuName) => setsuList[setsuName]).forEach((setsuName) => {
    const heimen = heimenList[setsuName]
    if (!heimen) {
      return
    }

    const filteredPointNames = Object.keys(heimen.points).filter((name) => {
      // ポイントがメニューで選択されている通りに属しているか確認する
      return zumenType === ZUMEN.GAIHEKI1
        ? heimen.points[name].xTorishinName === gaihekiTorishin[key]
        : heimen.points[name].yTorishinName === gaihekiTorishin[key]
    })
    const sortedPointNames = sortBy(filteredPointNames, (name) => heimen.points[name][asX])

    sortedPointNames.forEach((pointName) => {
      const point = heimen.points[pointName]
      const pointKey = pointToKey(point)
      points = {
        ...points,
        [pointKey]: point,
      }

      // ポイントが属する通りのうち、メニューで選択されている通りと直交する方向の通りの名前
      const crossingToriName =
        zumenType === ZUMEN.GAIHEKI1 ? point.yTorishinName : point.xTorishinName

      if (crossingToriName) {
        if (prevPointByTori[crossingToriName]) {
          // 前の節のポイントとを結ぶ結線を追加
          const prevPoint = prevPointByTori[crossingToriName]
          links.push([pointToKey(prevPoint), pointKey])
        }
        prevPointByTori = {
          ...prevPointByTori,
          [crossingToriName]: point,
        }
      }
    })
  })

  const gaihekiData = { points, links }
  return gaihekiData
}

const selectGaihekiRangeRaw = (
  genbaData: GenbaDataType,
  zumenType: ZUMEN.GAIHEKI1 | ZUMEN.GAIHEKI2,
): ZumenRangeType => {
  const { asX } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  let minX = Infinity
  let maxX = -Infinity

  Object.keys(genbaData.heimenList).forEach((setsuName) => {
    const heimen = genbaData.heimenList[setsuName]
    if (!heimen || isEmpty(heimen.points)) {
      return
    }
    Object.keys(heimen.points).forEach((pointName) => {
      const point = heimen.points[pointName]
      minX = Math.min(minX, point[asX])
      maxX = Math.max(maxX, point[asX])
    })
  })

  const [minY, maxY] = selectMinMaxSetsuZ(genbaData.zentai.setsuList)

  return {
    minX,
    maxX,
    minY,
    maxY,
  }
}

/**
 * 外壁描画の際にSVGに描画するXY座標の範囲を計算する
 * @param genbaData
 * @param zumenType
 * @returns SVGに描画するXY座標の範囲
 */
export const selectGaihekiRange = memoizeOne(selectGaihekiRangeRaw)
