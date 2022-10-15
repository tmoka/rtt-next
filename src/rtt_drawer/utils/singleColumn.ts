import sortBy from 'lodash/sortBy'
import { PointsType, GenbaDataType } from '../../common/types'
import { MenuConfigType } from '../constants'
import { RTTDrawerError } from './errors'

/**
 * GenbaDataType から柱単品の描画に必要なデータを取り出す。
 * @param genbaData
 * @param menuConfig
 * @returns 指定された柱に属するポイントのデータ
 */
export const selectSingleColumnPoints = (
  genbaData: GenbaDataType,
  menuConfig: MenuConfigType,
): PointsType => {
  const { heimenList } = genbaData
  const { setsuList } = genbaData.zentai
  const { singleColumnXToriName, singleColumnYToriName } = menuConfig

  let singleColumnPoints: PointsType = {}
  sortBy(Object.keys(setsuList), (setsuName) => setsuList[setsuName]).forEach((setsuName) => {
    const heimen = heimenList[setsuName]
    if (!heimen) {
      return
    }

    // メニューで指定されたX通り、Y通りに属するポイントを探す
    const targetPoints = Object.values(heimen.points).filter(
      (point) =>
        point.xTorishinName === singleColumnXToriName &&
        point.yTorishinName === singleColumnYToriName,
    )

    let point
    switch (targetPoints.length) {
      case 0:
        // メニューで指定されたX通り、Y通りに属するポイントが存在しない場合は
        // 無視する
        return
      case 1:
        ;[point] = targetPoints
        break
      default: {
        // メニューで指定されたX通り、Y通りに属するポイントが複数ある場合
        // X通り、Y通りの名前からポイント名を推測する
        const estimatedPointName = `${singleColumnXToriName}-${singleColumnYToriName}`
        const estimatedPoint = heimen.points[estimatedPointName]
        if (estimatedPoint) {
          // 推測したポイント名を持つポイントが存在した場合は、そのポイントを描画に使う
          point = estimatedPoint
        } else {
          throw new RTTDrawerError(
            `同じX通り、Y通りに属するポイントが同一節内に複数存在します。 setsu_name: ${setsuName}`,
          )
        }
      }
    }

    singleColumnPoints = {
      ...singleColumnPoints,
      [setsuName]: point,
    }
  })

  return singleColumnPoints
}
