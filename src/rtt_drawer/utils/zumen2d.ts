import isEmpty from 'lodash/isEmpty'
import sortBy from 'lodash/sortBy'
import memoizeOne from 'memoize-one'
import {
  STAGE_ORDER,
  GenbaDataType,
  HeimenType,
  Zumen2dType,
  PointsType,
  LinkType,
  Stage,
  AXIS,
} from '../../common/types'
import { ZUMEN, ZUMEN_TYPE_TO_AS_XYZ, MenuConfigType, ZumenRangeType } from '../constants'
import { pointToKey } from './point'

/**
 * GenbaDataType から平面の描画に必要なデータを取り出す
 * @param genbaData
 * @param menuConfig
 * @returns 平面の描画に必要なデータ
 */
const selectHeimen = memoizeOne(
  (genbaData: GenbaDataType, menuConfig: MenuConfigType): HeimenType => {
    const { heimenSetsuName } = menuConfig
    const heimen = genbaData.heimenList[heimenSetsuName]
    return heimen
  },
)

const selectRitsumen1Or2Raw = (
  genbaData: GenbaDataType,
  menuConfig: MenuConfigType,
  zumenType: ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2,
): Zumen2dType => {
  const { setsuList } = genbaData.zentai
  const { ritsumen1XToriName, ritsumen2YToriName } = menuConfig
  const { asX } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]

  // 節ごとのループの中で、前回出現したポイントを所属する通りごとに記憶しておく
  let prevPointByTori: PointsType = {}

  // heimen と同じ形式の points と links を設定する
  let points: PointsType = {}
  const links: LinkType[] = []
  const sortedSetsuNames = sortBy(Object.keys(setsuList), (setsuName) => setsuList[setsuName])
  sortedSetsuNames.forEach((setsuName) => {
    const heimen = genbaData.heimenList[setsuName]
    if (!heimen) {
      return
    }

    const filteredPointNames = Object.keys(heimen.points).filter((name) => {
      // ポイントがメニューで選択されている通りに属しているか確認する
      return zumenType === ZUMEN.RITSUMEN1
        ? heimen.points[name].xTorishinName === ritsumen1XToriName
        : heimen.points[name].yTorishinName === ritsumen2YToriName
    })
    const sortedPointNames = sortBy(filteredPointNames, (name) => heimen.points[name][asX])
    sortedPointNames.forEach((pointName, i) => {
      const point = heimen.points[pointName]
      const pointKey = pointToKey(point)
      points = {
        ...points,
        [pointKey]: point,
      }

      if (i > 0) {
        // 同じ節内のポイントとを結ぶ結線を追加
        const prevPoint = heimen.points[sortedPointNames[i - 1]]
        links.push([pointToKey(prevPoint), pointKey])
      }

      // ポイントが属する通りのうち、メニューで選択されている通りと直交する方向の通りの名前
      const crossingToriName =
        zumenType === ZUMEN.RITSUMEN1 ? point.yTorishinName : point.xTorishinName

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

  const ritsumen1Or2 = { points, links } // heimenと同じ形式
  return ritsumen1Or2
}

/**
 * GenbaDataType から立面の描画に必要なデータを取り出す
 * @param genbaData
 * @param menuConfig
 * @param zumenType
 * @returns 立面の描画に必要なデータ
 */
const selectRitsumen1Or2 = memoizeOne(selectRitsumen1Or2Raw)

/**
 * GenbaDataType から平面もしくは立面の描画に必要なデータを取り出す
 * @param genbaData
 * @param menuConfig
 * @param zumenType
 * @returns 平面もしくは立面の描画に必要なデータ
 */
export const selectZumen2d = (
  genbaData: GenbaDataType,
  menuConfig: MenuConfigType,
  zumenType: ZUMEN,
): Zumen2dType => {
  switch (zumenType) {
    case ZUMEN.HEIMEN:
      return selectHeimen(genbaData, menuConfig)
    case ZUMEN.RITSUMEN1:
    case ZUMEN.RITSUMEN2:
      return selectRitsumen1Or2(genbaData, menuConfig, zumenType)
    default:
      throw new Error(`変数の値が不正です。 zumenType: ${zumenType}`)
  }
}

/**
 * 平面もしくは立面で描画すべきステージを求める
 * @param menuConfig
 * @returns 描画すべきステージの配列
 */
export const selectZumen2dStagesToRender = (menuConfig: MenuConfigType): Stage[] => {
  const { stageSrc, stagesDst, isShowColumnAll, isShowColumnStageSrc, isShowColumnStageDst } =
    menuConfig
  if (isShowColumnAll) {
    return STAGE_ORDER
  }

  const isShowStages: { [stage: string]: boolean } = {}
  if (isShowColumnStageSrc) {
    // 比較元柱データ表示 がチェックされているときは、比較元のステージを描画する
    isShowStages[stageSrc] = true
  }
  if (isShowColumnStageDst) {
    // 比較先柱データ表示 がチェックされているときは、比較先のステージを描画する
    stagesDst.forEach((stage) => {
      isShowStages[stage] = true
    })
  }

  const stagesToRender = STAGE_ORDER.filter((stage) => isShowStages[stage])
  return stagesToRender
}

/**
 * 誤差の比較元と比較先を表すデータの型
 */
export interface GosaStageSrcDstType {
  gosaStageSrc: Stage // 比較元
  gosaStageDst: Stage // 比較先
}

/**
 * 平面もしくは立面において誤差の比較元, 比較先とすべきステージを求める
 * @param menuConfig
 * @returns 誤差の比較元と比較先
 */
export const selectZumen2dGosaStageSrcDst = (menuConfig: MenuConfigType): GosaStageSrcDstType => {
  const { stageSrc, stagesDst } = menuConfig
  // 描画対象となっている比較先のステージのうち、最新のものを誤差の比較先とする
  const gosaStageDst = stagesDst[stagesDst.length - 1]
  return {
    gosaStageSrc: stageSrc,
    gosaStageDst,
  }
}

const selectZumen2dRangeRaw = (
  genbaData: GenbaDataType,
  zumenType: ZUMEN.HEIMEN | ZUMEN.RITSUMEN1 | ZUMEN.RITSUMEN2 | ZUMEN.SETSU_COMPARISON,
): ZumenRangeType => {
  const { asX, asY } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  // ポイントの座標の最小値と最大値を求める
  Object.keys(genbaData.heimenList).forEach((setsuName) => {
    const heimen = genbaData.heimenList[setsuName]
    if (!heimen || isEmpty(heimen.points)) {
      return
    }
    Object.values(heimen.points).forEach((point) => {
      minX = Math.min(minX, point[asX])
      maxX = Math.max(maxX, point[asX])
      minY = Math.min(minY, point[asY])
      maxY = Math.max(maxY, point[asY])
    })
  })

  // 通り芯の座標の最小値と最大値を求める
  const { torishinList } = genbaData.zentai
  Object.values(torishinList).forEach((torishin) => {
    if (!torishin) {
      return
    }
    const [p1, p2] = torishin
    if (asX !== AXIS.Z && p1[asX] === p2[asX]) {
      // X通り芯
      minX = Math.min(minX, p1[asX])
      maxX = Math.max(maxX, p1[asX])
    }
    if (asY !== AXIS.Z && p1[asY] === p2[asY]) {
      // Y通り芯
      minY = Math.min(minY, p1[asY])
      maxY = Math.max(maxY, p1[asY])
    }
  })

  return {
    minX,
    maxX,
    minY,
    maxY,
  }
}

/**
 * `genbaData` に含まれるポイントと通り芯の座標の最小値と最大値を、SVGのx方向, y方向それぞれについて求める
 * @param genbaData
 * @param zumenType
 * @returns
 */
export const selectZumen2dRange = memoizeOne(selectZumen2dRangeRaw)
