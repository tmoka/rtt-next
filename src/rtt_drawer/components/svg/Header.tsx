import React from 'react'
import { GenbaDataType } from '../../../common/types'
import {
  HEADER_HEIGHT,
  ROOT_WIDTH,
  ZUMEN,
  MenuConfigType,
  ZUMEN_TO_JA,
  stageToJa,
  HeaderInfoType,
} from '../../constants'
import TextCenter from './common/TextCenter'
import ClipRect from './common/ClipRect'
import { getYyyymmdd, getSetsuOrToriName, getGosaStageSrcDst } from '../../utils'

const x0 = 0
const x1 = (ROOT_WIDTH / 36) * 12
const x2 = (ROOT_WIDTH / 36) * (12 + 12)
const x3 = (ROOT_WIDTH / 36) * (12 + 12 + 2)
const x4 = (ROOT_WIDTH / 36) * (12 + 15 + 3)
const x5 = (ROOT_WIDTH / 36) * (12 + 15 + 3 + 2)
const x6 = ROOT_WIDTH

const y0 = 0
const y1 = HEADER_HEIGHT / 2
const y2 = HEADER_HEIGHT

type HeaderProps = Readonly<{
  genbaData: GenbaDataType | null
  zumenType: ZUMEN
  menuConfig: MenuConfigType
  headerInfo: HeaderInfoType
}>

/**
 * SVG上部に現場情報を表示するコンポーネント
 */
const Header: React.FC<HeaderProps> = ({ genbaData, zumenType, menuConfig, headerInfo }) => {
  const { genbaName, comment, measuredAt, measuredBy, confirmedBy } = headerInfo
  const setsuOrToriName = getSetsuOrToriName(genbaData, zumenType, menuConfig)
  const { gosaStageSrc, gosaStageDst } = getGosaStageSrcDst(zumenType, menuConfig)

  return (
    <g>
      <ClipRect
        id='svg-header-genba-name'
        x={x0}
        y={y0}
        width={x1 - x0}
        height={y2 - y0}
        withBorder
      >
        <TextCenter x={(x1 + x0) / 2} y={(y2 + y0) / 2}>
          {genbaName}
        </TextCenter>
      </ClipRect>
      <ClipRect
        id='svg-header-setsu-zumen-src-dst'
        x={x1}
        y={y0}
        width={x3 - x1}
        height={y1 - y0}
        withBorder
      >
        <TextCenter x={(x3 + x1) / 2} y={(y1 + y0) / 2}>
          {zumenType === ZUMEN.SETSU_COMPARISON
            ? [
                ZUMEN_TO_JA[zumenType],
                gosaStageSrc
                  ? `${menuConfig.setsuComparisonSrcName}節 ${stageToJa(gosaStageSrc)} →`
                  : null,
                gosaStageDst
                  ? `${menuConfig.setsuComparisonDstName}節 ${stageToJa(gosaStageDst)}`
                  : null,
              ].join(' ')
            : [
                setsuOrToriName,
                ZUMEN_TO_JA[zumenType],
                gosaStageSrc && gosaStageSrc !== gosaStageDst
                  ? `${stageToJa(gosaStageSrc)} →`
                  : null,
                stageToJa(gosaStageDst),
              ].join(' ')}
        </TextCenter>
      </ClipRect>
      <ClipRect id='svg-header-comment' x={x1} y={y1} width={x2 - x1} height={y2 - y1} withBorder>
        <TextCenter x={(x2 + x1) / 2} y={(y2 + y1) / 2}>
          {comment}
        </TextCenter>
      </ClipRect>
      <ClipRect
        id='svg-header-date-title'
        x={x3}
        y={y0}
        width={x4 - x3}
        height={y1 - y0}
        withBorder
      >
        <TextCenter x={(x4 + x3) / 2} y={(y1 + y0) / 2}>
          計測日
        </TextCenter>
      </ClipRect>
      <ClipRect
        id='svg-header-date-content'
        x={x4}
        y={y0}
        width={x6 - x4}
        height={y1 - y0}
        withBorder
      >
        <TextCenter x={(x6 + x4) / 2} y={(y1 + y0) / 2}>
          {measuredAt ? getYyyymmdd(new Date(measuredAt)) : ''}
        </TextCenter>
      </ClipRect>
      <ClipRect
        id='svg-header-measurer-title'
        x={x2}
        y={y1}
        width={x3 - x2}
        height={y2 - y1}
        withBorder
      >
        <TextCenter x={(x3 + x2) / 2} y={(y2 + y1) / 2}>
          計測者
        </TextCenter>
      </ClipRect>
      <ClipRect id='svg-header-measurer' x={x3} y={y1} width={x4 - x3} height={y2 - y1} withBorder>
        <TextCenter x={(x4 + x3) / 2} y={(y2 + y1) / 2}>
          {measuredBy}
        </TextCenter>
      </ClipRect>
      <ClipRect
        id='svg-header-confirmer-title'
        x={x4}
        y={y1}
        width={x5 - x4}
        height={y2 - y1}
        withBorder
      >
        <TextCenter x={(x5 + x4) / 2} y={(y2 + y1) / 2}>
          確認者
        </TextCenter>
      </ClipRect>
      <ClipRect id='svg-header-confirmer' x={x5} y={y1} width={x6 - x5} height={y2 - y1} withBorder>
        <TextCenter x={(x6 + x5) / 2} y={(y2 + y1) / 2}>
          {confirmedBy}
        </TextCenter>
      </ClipRect>
    </g>
  )
}

export default React.memo(Header)
