import React from 'react'
import { Matrix } from 'transformation-matrix'
import { ZUMEN_WIDTH, ZUMEN_HEIGHT } from '../../../constants'
import SVGLayer from './SVGLayer'
import TextCenter from './TextCenter'

type NoDataProps = Readonly<{
  text: string
  clearTrans: Matrix
}>

/**
 * データが存在しない旨を表示するコンポーネント
 */
const NoData: React.FC<NoDataProps> = (props) => {
  const { text, clearTrans } = props
  return (
    <g className='svg-no-heimen-data'>
      <SVGLayer
        id='svg-no-data'
        x={ZUMEN_WIDTH / 2}
        y={ZUMEN_HEIGHT / 2}
        transformMat={clearTrans}
        clip={false}
      >
        <TextCenter>{text}</TextCenter>
      </SVGLayer>
    </g>
  )
}

export default NoData
