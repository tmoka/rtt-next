import memoizeOne from 'memoize-one'
import { applyToPoint, rotateDEG } from 'transformation-matrix'
import {
  GenbaDataType,
  GosaVectorType,
  KGPointType,
  Stage,
  STAGE_ORDER,
  TwoHeimensType,
} from '../../common/types'
import { MenuConfigType, ZUMEN } from '../constants'
import { getAngle } from './common'
import { RTTDrawerError } from './errors'
import { getGosaVector } from './point'

/**
 * GenbaDataType から比較する2つの平面の描画に必要なデータを取り出す
 * @param genbaData
 * @param menuConfig
 * @returns 2つの平面の描画に必要なデータ
 */
export const selectTwoHeimens = memoizeOne(
  (genbaData: GenbaDataType, menuConfig: MenuConfigType): TwoHeimensType => {
    const { setsuComparisonSrcName, setsuComparisonDstName } = menuConfig
    const heimenSrc = genbaData.heimenList[setsuComparisonSrcName]
    const heimenDst = genbaData.heimenList[setsuComparisonDstName]
    return { heimenSrc, heimenDst }
  },
)

/**
 * 節比較の比較先で描画すべきステージを求める
 * @param menuConfig
 * @returns 描画すべきステージの配列
 */
export const selectSetsuComparisonDstStagesToRender = (menuConfig: MenuConfigType): Stage[] => {
  const { stagesDst, isShowColumnAll, isShowColumnStageDst } = menuConfig
  if (isShowColumnAll) {
    return STAGE_ORDER
  }

  const isShowStages: { [stage: string]: boolean } = {}
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
 * 節比較で、比較元のポイントに対応するポイントを比較先の平面から探す
 * @param pointSrc
 * @param twoHeimens
 * @returns 対応するポイントのデータ
 */
export const selectComparedPoint = (
  pointSrc: KGPointType,
  twoHeimens: TwoHeimensType,
): KGPointType | undefined => {
  const { heimenDst } = twoHeimens
  const targetPoints = Object.values(heimenDst.points).filter(
    (pointDst) =>
      pointDst.xTorishinName === pointSrc.xTorishinName &&
      pointDst.yTorishinName === pointSrc.yTorishinName,
  )
  let point: KGPointType | undefined
  switch (targetPoints.length) {
    case 0:
      point = undefined
      break
    case 1:
      ;[point] = targetPoints
      break
    default: {
      // メニューで指定されたX通り、Y通りに属するポイントが複数ある場合
      // 比較先のポイント名と同じ名前のポイントを探す
      const estimatedPoint = targetPoints.filter(
        (targetPoint) => targetPoint.name === pointSrc.name,
      )
      if (estimatedPoint.length === 1) {
        // 比較先と同じ名前のポイントが1つだけ存在した場合は、そのポイントを誤差計算に使う
        ;[point] = estimatedPoint
      } else {
        throw new RTTDrawerError(`同じX通り、Y通りに属するポイントが同一節内に複数存在します。`)
      }
    }
  }
  return point
}

/**
 * 2つのポイントのKIHでの座標の差を計算する
 * 節比較において、同じ通り名であるがKIHのXY座標が異なるケースに対応するため
 * @param pointSrc - 比較元ポイント
 * @param pointDst - 比較先ポイント
 * @returns gosaVector
 */
const getGosaVectorTwoKihPoints = (
  pointSrc: KGPointType,
  pointDst: KGPointType,
): GosaVectorType => {
  return {
    x: pointDst.x - pointSrc.x,
    y: pointDst.y - pointSrc.y,
    z: pointDst.z - pointSrc.z,
  }
}

/**
 * 異なる2平面上にある比較元のポイントと比較先のポイントの誤差を計算する
 * @param pointSrc - 比較元ポイント
 * @param pointDst - 比較先ポイント
 * @param stageSrc - 比較元ステージ
 * @param stageDst - 比較先ステージ
 * @returns gosaVector。該当するステージのデータがない場合、比較元と比較先ステージが同じ場合はnull。
 */
export const getGosaVectorDiffTwoHeimens = (
  pointSrc: KGPointType,
  pointDst: KGPointType,
  stageSrc: Stage,
  stageDst: Stage,
  zumenType: ZUMEN.SETSU_COMPARISON,
): GosaVectorType | null => {
  const gvSrc = getGosaVector(pointSrc, stageSrc)
  const gvDst = getGosaVector(pointDst, stageDst)
  const gvKih = getGosaVectorTwoKihPoints(pointSrc, pointDst)
  if (!gvSrc || !gvDst) {
    // 該当するステージのデータがない場合
    return null
  }
  const deg = getAngle(zumenType, pointDst)
  const rotatedXY = applyToPoint(rotateDEG(deg), {
    x: gvDst.x + gvKih.x - gvSrc.x,
    y: gvDst.y + gvKih.y - gvSrc.y,
  })
  return {
    x: rotatedXY.x,
    y: rotatedXY.y,
    // 節比較ではz座標の差は使用しないが、計算しておく
    z: gvDst.z + gvKih.z - gvSrc.z,
  }
}
