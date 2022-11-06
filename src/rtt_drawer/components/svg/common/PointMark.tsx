import React from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { ColForm, KGPointType, Stage } from '../../../../common/types'
import { COLOR_SETSU_COMPARISON_SRC, getStageColor, ZUMEN } from '../../../constants'
import { getAngle } from '../../../utils'

const delayConfig = { show: 1000, hide: 500 }

type PointInfoProps = Readonly<{
  point: KGPointType
}>

const PointInfo: React.FC<PointInfoProps> = ({ point }) => (
  <div className='text-left'>
    <pre>{JSON.stringify(point, null, 2)}</pre>
  </div>
)

type PointMarkProps = Readonly<{
  // PointMarkを識別するid
  id?: string
  // 描画したいの柱形状
  colForm: ColForm
  // 描画したい色に対応するステージ
  stage: Stage
  // 描画するポイントのサイズ
  markSize: number
  // ポイントに付帯する文字のサイズ
  fontSize?: number
  // 左側に描画する文字列
  leftStr?: string
  // 右側に描画する文字列
  rightStr?: string
  // KGPointから受け取ったデータ
  point?: KGPointType
  zumenType: ZUMEN
  isSetsuComparisonSrc: boolean
}>

/**
 * ポイントを描画するコンポーネント
 */
const PointMark: React.FC<PointMarkProps> = ({
  id,
  colForm,
  stage,
  markSize,
  fontSize = undefined,
  leftStr = '',
  rightStr = '',
  point = undefined,
  zumenType,
  isSetsuComparisonSrc,
}) => {
  const color = isSetsuComparisonSrc ? COLOR_SETSU_COMPARISON_SRC : getStageColor(stage)
  const d = markSize / 2
  const c = d * 0.8

  let mark = null
  switch (colForm) {
    case ColForm.H:
      mark = (
        <g>
          <line x1={-d} y1={-d} x2={-d} y2={d} stroke={color} />
          <line x1={d} y1={-d} x2={d} y2={d} stroke={color} />
          <line x1={-d} y1={0} x2={d} y2={0} stroke={color} />
        </g>
      )
      break
    case ColForm.I:
      mark = (
        <g>
          <line x1={-d} y1={-d} x2={d} y2={-d} stroke={color} />
          <line x1={-d} y1={d} x2={d} y2={d} stroke={color} />
          <line x1={0} y1={-d} x2={0} y2={d} stroke={color} />
        </g>
      )
      break
    case ColForm.C:
      mark = <circle cx={0} cy={0} r={d} stroke={color} fill={color} fillOpacity={0} />
      break
    case ColForm.S:
      mark = (
        <rect
          x={-d}
          y={-d}
          width={d * 2}
          height={d * 2}
          stroke={color}
          fill={color}
          fillOpacity={0}
        />
      )
      break
    case ColForm.PLS:
      mark = (
        <g>
          <line x1={-d} y1={0} x2={d} y2={0} stroke={color} />
          <line x1={0} y1={-d} x2={0} y2={d} stroke={color} />
          <line x1={-0.5 * d} y1={-d} x2={0.5 * d} y2={-d} stroke={color} />
          <line x1={d} y1={-0.5 * d} x2={d} y2={0.5 * d} stroke={color} />
          <line x1={-0.5 * d} y1={d} x2={0.5 * d} y2={d} stroke={color} />
          <line x1={-d} y1={-0.5 * d} x2={-d} y2={0.5 * d} stroke={color} />
        </g>
      )
      break
    case ColForm.T_U:
      mark = (
        <g>
          <line x1={-d} y1={-d} x2={d} y2={-d} stroke={color} />
          <line x1={0} y1={-d} x2={0} y2={d} stroke={color} />
          <line x1={-d} y1={-1.5 * d} x2={-d} y2={-0.5 * d} stroke={color} />
          <line x1={d} y1={-1.5 * d} x2={d} y2={-0.5 * d} stroke={color} />
          <line x1={-0.5 * d} y1={d} x2={0.5 * d} y2={d} stroke={color} />
        </g>
      )
      break
    case ColForm.T_D:
      mark = (
        <g>
          <line x1={-d} y1={d} x2={d} y2={d} stroke={color} />
          <line x1={0} y1={d} x2={0} y2={-d} stroke={color} />
          <line x1={-d} y1={1.5 * d} x2={-d} y2={0.5 * d} stroke={color} />
          <line x1={d} y1={1.5 * d} x2={d} y2={0.5 * d} stroke={color} />
          <line x1={-0.5 * d} y1={-d} x2={0.5 * d} y2={-d} stroke={color} />
        </g>
      )
      break
    case ColForm.T_L:
      mark = (
        <g>
          <line x1={-d} y1={-d} x2={-d} y2={d} stroke={color} />
          <line x1={-d} y1={0} x2={d} y2={0} stroke={color} />
          <line x1={-1.5 * d} y1={-d} x2={-0.5 * d} y2={-d} stroke={color} />
          <line x1={-1.5 * d} y1={d} x2={-0.5 * d} y2={d} stroke={color} />
          <line x1={d} y1={-0.5 * d} x2={d} y2={0.5 * d} stroke={color} />
        </g>
      )
      break
    case ColForm.T_R:
      mark = (
        <g>
          <line x1={d} y1={-d} x2={d} y2={d} stroke={color} />
          <line x1={d} y1={0} x2={-d} y2={0} stroke={color} />
          <line x1={1.5 * d} y1={-d} x2={0.5 * d} y2={-d} stroke={color} />
          <line x1={1.5 * d} y1={d} x2={0.5 * d} y2={d} stroke={color} />
          <line x1={-d} y1={-0.5 * d} x2={-d} y2={0.5 * d} stroke={color} />
        </g>
      )
      break
    case ColForm.X:
      mark = (
        <g>
          <line x1={-c} y1={-c} x2={c} y2={c} stroke={color} />
          <line x1={-c} y1={c} x2={c} y2={-c} stroke={color} />
          <line x1={0.5 * c} y1={1.5 * c} x2={1.5 * c} y2={0.5 * c} stroke={color} />
          <line x1={0.5 * c} y1={-1.5 * c} x2={1.5 * c} y2={-0.5 * c} stroke={color} />
          <line x1={-0.5 * c} y1={1.5 * c} x2={-1.5 * c} y2={0.5 * c} stroke={color} />
          <line x1={-0.5 * c} y1={-1.5 * c} x2={-1.5 * c} y2={-0.5 * c} stroke={color} />
        </g>
      )
      break
    case ColForm.I_L:
      mark = (
        <g>
          <line x1={-c} y1={-c} x2={c} y2={c} stroke={color} />
          <line x1={0.5 * c} y1={1.5 * c} x2={1.5 * c} y2={0.5 * c} stroke={color} />
          <line x1={-0.5 * c} y1={-1.5 * c} x2={-1.5 * c} y2={-0.5 * c} stroke={color} />
        </g>
      )
      break
    case ColForm.I_R:
      mark = (
        <g>
          <line x1={-c} y1={c} x2={c} y2={-c} stroke={color} />
          <line x1={0.5 * c} y1={-1.5 * c} x2={1.5 * c} y2={-0.5 * c} stroke={color} />
          <line x1={-0.5 * c} y1={1.5 * c} x2={-1.5 * c} y2={0.5 * c} stroke={color} />
        </g>
      )
      break
    case ColForm.D:
      mark = (
        <g>
          <line x1={0} y1={2 * c} x2={2 * c} y2={0} stroke={color} />
          <line x1={2 * c} y1={0} x2={0} y2={-2 * c} stroke={color} />
          <line x1={0} y1={-2 * c} x2={-2 * c} y2={0} stroke={color} />
          <line x1={-2 * c} y1={0} x2={0} y2={2 * c} stroke={color} />
        </g>
      )
      break
    case ColForm.DOT:
      mark = <circle cx={0} cy={0} r={2} fill={color} stroke={color} />
      break
    default:
      mark = (
        <text dominantBaseline='central' textAnchor='middle'>
          ?
        </text>
      )
  }

  const [leftText, rightText] = [leftStr, rightStr].map((str, i) => {
    const sx = i === 0 ? -1 : 1
    const textAnchor = i === 0 ? 'end' : 'start'
    const style = fontSize
      ? {
          fontSize: `${fontSize}px`,
        }
      : {}

    return (
      <text
        key={sx}
        x={sx * 2 * d}
        y={0}
        dominantBaseline='central'
        textAnchor={textAnchor}
        style={style}
      >
        {str}
      </text>
    )
  })

  const deg = getAngle(zumenType, point)
  const g = (
    <g className='svg-point-mark'>
      {leftText}
      <g transform={`rotate(${deg})`}>{mark}</g>
      {rightText}
    </g>
  )

  if (!id || !point) {
    return g
  }

  return (
    <OverlayTrigger
      placement='bottom'
      delay={delayConfig}
      overlay={
        <Popover id={id} title={point.name}>
          <PointInfo point={point} />
        </Popover>
      }
    >
      {g}
    </OverlayTrigger>
  )
}

export default React.memo(PointMark)
