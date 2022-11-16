import React from 'react'
import { applyToPoint, inverse, Matrix } from 'transformation-matrix'
import { BasicStage, LinkType, PointsType, Stage } from '../../../../common/types'
import { getStageColor, ZUMEN, ZUMEN_TYPE_TO_AS_XYZ } from '../../../constants'
import SVGLayer from '../common/SVGLayer'
import { getStageXY, getGosaVector, calcIntersection, IntersectType } from '../../../utils'
import DashLine from '../common/DashLine'

type GaihekiLinkProps = Readonly<{
  points: PointsType
  link: LinkType
  stage: Stage
  gosaScale: number
  zumenType: ZUMEN.GAIHEKI1 | ZUMEN.GAIHEKI2
  gaihekiTrans: Matrix
  clearTrans: Matrix
  strokeWidth: number
  isPlus: boolean
}>

const GaihekiLink: React.FC<GaihekiLinkProps> = ({
  points,
  link,
  stage,
  gosaScale,
  zumenType,
  gaihekiTrans,
  clearTrans,
  strokeWidth,
  isPlus,
}) => {
  const { asZ } = ZUMEN_TYPE_TO_AS_XYZ[zumenType]
  const k1 = isPlus ? -1 : 1
  const k2 = zumenType === ZUMEN.GAIHEKI1 ? 1 : -1

  const ps = [points[link[0]], points[link[1]]]
  if (!ps[0] || !ps[1]) {
    // ポイントが見つからなかった場合
    return null
  }

  // KIH
  const { x: x1, y: y1 } = getStageXY(ps[0], BasicStage.KIH, gosaScale, zumenType)
  const { x: x2, y: y2 } = getStageXY(ps[1], BasicStage.KIH, gosaScale, zumenType)
  const { x: screenKihX1, y: screenKihY1 } = applyToPoint(inverse(clearTrans), {
    x: x1,
    y: y1,
  })
  const { x: screenKihX2, y: screenKihY2 } = applyToPoint(inverse(clearTrans), {
    x: x2,
    y: y2,
  })

  // gosa
  const gv1 = getGosaVector(ps[0], stage)
  const gv2 = getGosaVector(ps[1], stage)
  if (!gv1 || !gv2) {
    return null
  }
  const { x: screenGosaVectorX1, y: screenGosaVectorY1 } = applyToPoint(gaihekiTrans, {
    x: k1 * gv1[asZ] * gosaScale,
    y: 0,
  })
  const { x: screenGosaVectorX2, y: screenGosaVectorY2 } = applyToPoint(gaihekiTrans, {
    x: k1 * gv2[asZ] * gosaScale,
    y: 0,
  })

  const screenGosaX1 = screenKihX1 + screenGosaVectorX1
  const screenGosaY1 = screenKihY1 + screenGosaVectorY1
  const screenGosaX2 = screenKihX2 + screenGosaVectorX2
  const screenGosaY2 = screenKihY2 + screenGosaVectorY2

  const intersectResult = calcIntersection(
    screenKihX1,
    screenKihY1,
    screenKihX2,
    screenKihY2,
    screenGosaX1,
    screenGosaY1,
    screenGosaX2,
    screenGosaY2,
  )

  const color = getStageColor(stage)

  if (intersectResult.type !== IntersectType.INTERSECTING) {
    if (k2 * screenGosaVectorX1 < 0) {
      return (
        <DashLine
          key={`${link[0]}_${link[1]}`}
          x1={screenGosaX1}
          y1={screenGosaY1}
          x2={screenGosaX2}
          y2={screenGosaY2}
          color={color}
          strokeWidth={strokeWidth}
          isDotDash={false}
        />
      )
    }
    return (
      <line
        key={`${link[0]}_${link[1]}`}
        x1={screenGosaX1}
        y1={screenGosaY1}
        x2={screenGosaX2}
        y2={screenGosaY2}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    )
  }

  const intersection = intersectResult.point
  if (k2 * screenGosaVectorX1 < 0) {
    return (
      <g>
        <DashLine
          key={`dash_${link[0]}_${link[1]}`}
          x1={screenGosaX1}
          y1={screenGosaY1}
          x2={intersection.x}
          y2={intersection.y}
          color={color}
          strokeWidth={strokeWidth}
          isDotDash={false}
        />
        <line
          key={`line_${link[0]}_${link[1]}`}
          x1={intersection.x}
          y1={intersection.y}
          x2={screenGosaX2}
          y2={screenGosaY2}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </g>
    )
  }

  return (
    <g>
      <line
        key={`line_${link[0]}_${link[1]}`}
        x1={screenGosaX1}
        y1={screenGosaY1}
        x2={intersection.x}
        y2={intersection.y}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <DashLine
        key={`dash_${link[0]}_${link[1]}`}
        x1={intersection.x}
        y1={intersection.y}
        x2={screenGosaX2}
        y2={screenGosaY2}
        color={color}
        strokeWidth={strokeWidth}
        isDotDash={false}
      />
    </g>
  )
}

type GaihekiLinksProps = Readonly<{
  points: PointsType
  links: LinkType[]
  stage: Stage
  gosaScale: number
  zumenType: ZUMEN.GAIHEKI1 | ZUMEN.GAIHEKI2
  gaihekiTrans: Matrix
  clearTrans: Matrix
  strokeWidth: number
  isPlus: boolean
}>

const GaihekiLinks: React.FC<GaihekiLinksProps> = ({
  points,
  links,
  stage,
  gosaScale,
  zumenType,
  gaihekiTrans,
  clearTrans,
  strokeWidth,
  isPlus,
}) => {
  const linkElems = links.map((link) => (
    <GaihekiLink
      key={`${link[0]}-${link[1]}`}
      points={points}
      link={link}
      stage={stage}
      gosaScale={gosaScale}
      zumenType={zumenType}
      gaihekiTrans={gaihekiTrans}
      clearTrans={clearTrans}
      strokeWidth={strokeWidth}
      isPlus={isPlus}
    />
  ))

  return (
    <SVGLayer x={0} y={0} transformMat={clearTrans} clip={false}>
      {linkElems}
    </SVGLayer>
  )
}

export default React.memo(GaihekiLinks)
