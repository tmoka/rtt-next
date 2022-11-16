import React from 'react'
import { SetsuListType } from '../../../../common/types'
import { ZUMEN_WIDTH } from '../../../constants'
import { RTTDrawerError } from '../../../utils'
import DashLine from './DashLine'

type SetsuLinesProps = Readonly<{
  setsuList: SetsuListType
  // 節を表す点線の幅
  strokeWidth: number
  // 節を表す点線の間隔のスケール
  dashScale: number
  // 点線を延長するかどうか
  isInfinityLine?: boolean
}>

/**
 * 節を表す点線を描画するコンポーネント
 */
const SetsuLines: React.FC<SetsuLinesProps> = ({
  setsuList,
  strokeWidth,
  dashScale,
  isInfinityLine = true,
}) => {
  const x2 = isInfinityLine ? 1 : ZUMEN_WIDTH
  const setsuLines = Object.keys(setsuList).map((setsuName) => {
    const z = setsuList[setsuName]
    if (z === undefined) {
      throw new RTTDrawerError(`${setsuName}節のz座標が見つかりません。`)
    }
    return (
      <DashLine
        key={setsuName}
        x1={0}
        y1={z}
        x2={x2}
        y2={z}
        isInfinityLine={isInfinityLine}
        strokeWidth={strokeWidth}
        dashScale={dashScale}
      />
    )
  })
  return <g className='svg-setsu-lines'>{setsuLines}</g>
}

export default React.memo(SetsuLines)
