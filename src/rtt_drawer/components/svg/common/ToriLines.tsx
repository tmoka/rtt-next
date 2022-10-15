import React from 'react'
import { TorishinListType } from '../../../../common/types'
import { ZUMEN, ZUMEN_HEIGHT } from '../../../constants'
import { getTorishinEndPoints, RTTDrawerError } from '../../../utils'
import DashLine from './DashLine'

type ToriLinesProps = Readonly<{
  zumenType:
    | ZUMEN.HEIMEN
    | ZUMEN.RITSUMEN1
    | ZUMEN.RITSUMEN2
    | ZUMEN.GAIHEKI1
    | ZUMEN.GAIHEKI2
    | ZUMEN.SETSU_COMPARISON
  torishinList: TorishinListType
  // 線を指定された2点より外側へ延長して描画するかどうか
  isInfinityLink: boolean
  // 線の幅
  strokeWidth: number
  // 一点鎖線の間隔のスケール
  dashScale?: number
}>

/**
 * 通り芯を表す線を描画するコンポーネント
 */
const ToriLines: React.FC<ToriLinesProps> = ({
  zumenType,
  torishinList,
  isInfinityLink,
  strokeWidth,
  dashScale = undefined,
}) => {
  const toriLines = Object.keys(torishinList).map((toriName) => {
    const torishin = torishinList[toriName]
    if (!torishin) {
      throw new RTTDrawerError(`通り芯が存在しません。 torishin_name: ${toriName}`)
    }

    const torishinEndPoints = getTorishinEndPoints(torishin, zumenType)
    if (!torishinEndPoints) {
      // 平面以外では斜め通り芯を描画しない
      return null
    }
    const { x1, y1, x2, y2 } = torishinEndPoints
    const zumenHeimenOrSetsuComparison =
      zumenType === ZUMEN.HEIMEN || zumenType === ZUMEN.SETSU_COMPARISON

    if (zumenType === ZUMEN.GAIHEKI1 || zumenType === ZUMEN.GAIHEKI2) {
      return (
        <DashLine
          key={toriName}
          isInfinityLine={isInfinityLink}
          x1={x1}
          y1={0}
          x2={x2}
          y2={ZUMEN_HEIGHT}
          strokeWidth={strokeWidth}
          dashScale={dashScale}
        />
      )
    }

    return (
      <DashLine
        key={toriName}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        isInfinityLine={!zumenHeimenOrSetsuComparison || isInfinityLink}
        strokeWidth={strokeWidth}
        dashScale={dashScale}
      />
    )
  })

  return <g className='svg-zumen2d-tori-lines'>{toriLines}</g>
}

export default React.memo(ToriLines)
