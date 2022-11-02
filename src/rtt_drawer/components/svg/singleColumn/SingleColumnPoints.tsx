import React from 'react'
import sortBy from 'lodash/sortBy'
import { Matrix } from 'transformation-matrix'
import { Stage, SetsuListType, PointsType } from '../../../../common/types'
import { XOrY } from '../../../constants'
import { getGosaVector, RTTDrawerError } from '../../../utils'
import SingleColumnPoint from './SingleColumnPoint'

type SingleColumnPointsProps = Readonly<{
  xy: XOrY
  setsuList: SetsuListType
  singleColumnPoints: PointsType
  stage: Stage
  isShowGosaValues: boolean
  isShowGosaArrows: boolean
  isShowGosaKanriAndGosaGenkai: boolean
  gosaValueFontSize: number
  columnSize: number
  gosaScale: number
  gosaStageDst: Stage
  decimalDigits: number
  clearTrans: Matrix
}>

const SingleColumnPoints: React.FC<SingleColumnPointsProps> = ({
  xy,
  setsuList,
  singleColumnPoints,
  stage,
  isShowGosaValues,
  isShowGosaArrows,
  isShowGosaKanriAndGosaGenkai,
  gosaValueFontSize,
  columnSize,
  gosaScale,
  gosaStageDst,
  decimalDigits,
  clearTrans,
}) => {
  const sortedSetsuNames = sortBy(
    Object.keys(setsuList),
    (setsuName) => setsuList[setsuName],
  ).filter((setsuName) => {
    const point = singleColumnPoints[setsuName]
    return point && getGosaVector(point, stage)
  })
  const pointElems = sortedSetsuNames.map((setsuName, i) => {
    const point = singleColumnPoints[setsuName]
    const dz =
      i === 0
        ? 0
        : singleColumnPoints[sortedSetsuNames[i]].z - singleColumnPoints[sortedSetsuNames[i - 1]].z
    const z = setsuList[setsuName]
    if (z === undefined) {
      throw new RTTDrawerError('節のデータが存在しません。')
    }
    return (
      <SingleColumnPoint
        key={setsuName}
        xy={xy}
        point={point}
        stage={stage}
        z={z}
        dz={dz}
        isShowGosaValues={isShowGosaValues}
        isShowGosaArrows={isShowGosaArrows}
        isShowGosaKanriAndGosaGenkai={isShowGosaKanriAndGosaGenkai}
        gosaValueFontSize={gosaValueFontSize}
        columnSize={columnSize}
        gosaScale={gosaScale}
        gosaStageDst={gosaStageDst}
        decimalDigits={decimalDigits}
        clearTrans={clearTrans}
      />
    )
  })

  return <g className='svg-single-column-points'>{pointElems}</g>
}

export default React.memo(SingleColumnPoints)
