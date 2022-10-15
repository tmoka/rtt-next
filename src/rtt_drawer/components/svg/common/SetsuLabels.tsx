import React from 'react'
import { Matrix } from 'transformation-matrix'
import { SetsuListType } from '../../../../common/types'
import SVGLayer from './SVGLayer'

type SetsuLabelsProps = Readonly<{
  setsuList: SetsuListType
  // 節ラベルの横幅
  zAxisWidth: number
  // 節のz座標を表示するかどうか
  isShowSetsuZValues: boolean
  clearTrans: Matrix
}>

/**
 * 節ラベル（ = 節名と節のz座標）を描画するコンポーネント
 */
const SetsuLabels: React.FC<SetsuLabelsProps> = ({
  setsuList,
  zAxisWidth,
  isShowSetsuZValues,
  clearTrans,
}) => {
  const labels = Object.keys(setsuList).map((setsuName) => {
    const paddingX = 10
    const z = setsuList[setsuName]
    return (
      <SVGLayer
        key={setsuName}
        x={zAxisWidth - paddingX}
        y={z}
        transformMat={clearTrans}
        clip={false}
      >
        <text>
          <tspan textAnchor='end' x={0}>{`${setsuName}節`}</tspan>
          {isShowSetsuZValues ? (
            <tspan textAnchor='end' x={0} dy='1em'>
              {z}
            </tspan>
          ) : null}
        </text>
      </SVGLayer>
    )
  })
  return <g className='svg-setsu-labels'>{labels}</g>
}

export default React.memo(SetsuLabels)
