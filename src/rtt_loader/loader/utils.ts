import {
  CSVLinkRow,
  CSVPointRow,
  CSVSetsuRow,
  CSVTorishinRow,
  GosaKey,
  SetsuListType,
  TorishinListType,
  GaihekiTorishinType,
  GaihekiKey,
  HeimenListType,
  PointsType,
  KGPointType,
  defaultColForm,
  ColForm,
  BasicStage,
  Stage,
  StageLatest,
  GosaVectorsType,
  SetsuNameType,
  LinkType,
  TorishinNamesType,
  ZentaiType,
  defaultKGException,
  GenbaType,
  isGaihekiKey,
  isColForm,
  GenbaFormat,
  STAGE_ORDER,
  PartialRecord,
  GosaVectorType,
  AdditionalStageColumnKey,
} from '../../common/types'
import { listFilesByExt } from '../../common/utils/fs.node'
import { RTTLoaderConvertError, CSVKind, RTTLoaderError } from './errors'

export const emptyGenbaWithUnknownError: GenbaType = {
  rttwebGenba: null,
  genbaData: null,
  errors: [defaultKGException],
}

export const splitByLine = (str: string): string[] => str.split(/\r?\n/)

/**
 * setsu.csv と torishin.csv の内容から zentai データを作成する
 * @param setsuRows - setsu.csv から読み込んだ型チェック済みデータ
 * @param torishinRows - torishin.csv から読み込んだ型チェック済みデータ
 * @returns zentai
 */
export const getZentai = (setsuRows: CSVSetsuRow[], torishinRows: CSVTorishinRow[]): ZentaiType => {
  const setsuList: SetsuListType = setsuRows.reduce(
    (obj, row) => ({
      ...obj,
      [row.setsuName]: row.z,
    }),
    {},
  )

  const torishinList: TorishinListType = torishinRows.reduce(
    (obj, row) => ({
      ...obj,
      [row.torishinName]: [
        { x: row.x1, y: row.y1 },
        { x: row.x2, y: row.y2 },
      ],
    }),
    {},
  )

  const gaihekiTorishin: GaihekiTorishinType = torishinRows.reduce((obj, row) => {
    if (!row.gaihekiType) {
      return obj
    }
    if (!isGaihekiKey(row.gaihekiType)) {
      throw new RTTLoaderConvertError(
        CSVKind.TORISHIN,
        `gaihekiType の値が不正です: '${row.gaihekiType}'。 ${Object.values(GaihekiKey).join(
          ', ',
        )} のいずれかを指定してください。`,
      )
    }
    return {
      ...obj,
      [row.gaihekiType]: row.torishinName,
    }
  }, {})

  const zentai = { setsuList, torishinList, gaihekiTorishin }
  return zentai
}

/**
 * point.csv の1行分のデータから gosaVectors と最新ステージを取得する
 * @param row - point.csv の1行分のデータ
 * @returns gosaVectors と最新ステージ
 */
const getGosaVectorsAndLatestStage = (
  row: CSVPointRow,
): { gosaVectors: GosaVectorsType; latestStage: Stage } => {
  let latestStage: Stage = BasicStage.KIH
  const gosaVectors: PartialRecord<Stage, GosaVectorType> = STAGE_ORDER.reduce((acc, stage) => {
    if (stage === BasicStage.KIH || stage === StageLatest) {
      return acc
    }

    const stageLower = stage.toLowerCase()
    const [x, y, z] = [
      row[`${stageLower}X` as GosaKey | AdditionalStageColumnKey],
      row[`${stageLower}Y` as GosaKey | AdditionalStageColumnKey],
      row[`${stageLower}Z` as GosaKey | AdditionalStageColumnKey],
    ]
    if (x === undefined && y === undefined && z === undefined) {
      // ステージの x, y, z 全てが空欄だった場合は、そのステージの誤差データは無しとみなす
      return acc
    }
    latestStage = stage
    const gosaVector = { x: x || 0, y: y || 0, z: z || 0 }
    return { ...acc, [stage]: gosaVector, [StageLatest]: gosaVector }
  }, {})
  return { gosaVectors, latestStage }
}

/**
 * point.csv の1行分のデータから KGPoint を取得する
 * @param row - point.csv の1行分のデータ
 * @returns KGPoint
 */
const getPoint = (row: CSVPointRow): KGPointType => {
  const { colForm = defaultColForm } = row
  if (!isColForm(colForm)) {
    throw new RTTLoaderConvertError(
      CSVKind.POINT,
      `colForm の値が不正です: '${colForm}'。 ${Object.values(ColForm).join(
        ', ',
      )} のいずれかを指定してください。`,
    )
  }

  const { gosaVectors, latestStage } = getGosaVectorsAndLatestStage(row)

  const point: KGPointType = {
    name: row.pointName,
    xTorishinName: row.xTorishinName,
    yTorishinName: row.yTorishinName,
    setsuName: row.setsuName,
    colForm,
    angle: row.angle,
    x: row.kihX,
    y: row.kihY,
    z: row.kihZ,
    gosaVectors,
    latestStage,
    comment: row.comment,
  }

  return point
}

/**
 * point.csv の内容から指定された節の points を取得する
 * @param pointRows - point.csv から読み込んだ型チェック済みデータ
 * @param setsuName - 対象とする節の名前
 * @returns points
 */
const getPoints = (pointRows: CSVPointRow[], setsuName: SetsuNameType): PointsType => {
  const points: PointsType = pointRows
    .filter((row) => row.setsuName === setsuName)
    .reduce((obj, row) => {
      const point = getPoint(row)
      return {
        ...obj,
        [row.pointName]: point,
      }
    }, {})

  return points
}

/**
 * link.csv の内容から指定された節の links を取得する
 * @param linkRows - link.csv から読み込んだ型チェック済みデータ
 * @param setsuName - 対象とする節の名前
 * @returns links
 */
const getLinks = (linkRows: CSVLinkRow[], setsuName: SetsuNameType): LinkType[] => {
  const links = linkRows
    .filter((row) => row.setsuName === setsuName)
    .map((row): LinkType => [row.pointName1, row.pointName2])
  return links
}

/**
 * point.csv, link.csv, setsuList 内容から heimenList を取得する
 * @param pointRows - point.csv から読み込んだ型チェック済みデータ
 * @param linkRows - link.csv から読み込んだ型チェック済みデータ
 * @param setsuList - 節の一覧
 * @returns heimenList
 */
export const getHeimenList = (
  pointRows: CSVPointRow[],
  linkRows: CSVLinkRow[],
  setsuList: SetsuListType,
): HeimenListType => {
  const setsuNames = Object.keys(setsuList)
  const heimenList: HeimenListType = setsuNames.reduce((obj, setsuName) => {
    const points = getPoints(pointRows, setsuName)
    const links = getLinks(linkRows, setsuName)
    return {
      ...obj,
      [setsuName]: { points, links },
    }
  }, {})
  return heimenList
}

/**
 * heimenList の points からx方向とy方向の通り芯名一覧を取得する
 * @param heimenList
 * @returns torishinNames
 */
export const getTorishinNames = (heimenList: HeimenListType): TorishinNamesType => {
  const xNames = new Set<string>()
  const yNames = new Set<string>()
  Object.keys(heimenList).forEach((setsuName) => {
    const { points } = heimenList[setsuName]
    Object.keys(points).forEach((pointName) => {
      const { xTorishinName, yTorishinName } = points[pointName]

      if (xTorishinName) {
        xNames.add(xTorishinName)
      }
      if (yTorishinName) {
        yNames.add(yTorishinName)
      }
    })
  })

  const torishinNames = {
    x: Array.from(xNames),
    y: Array.from(yNames),
  }
  return torishinNames
}

/**
 * 現場フォルダのフォーマットを判定する
 * @param genbaDir
 * @returns フォーマットの種類
 */
export const detectGenbaFormat = async (genbaDirPath: string): Promise<GenbaFormat> => {
  try {
    const csvFileNames = await listFilesByExt(genbaDirPath, 'csv')
    // 現場のディレクトリに1つでもcsvファイルが存在した場合、csv版フォーマットとして読み込む
    return csvFileNames.length > 0 ? GenbaFormat.CSV : GenbaFormat.OLD_GENBA
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new RTTLoaderError('現場フォルダを開けませんでした。')
  }
}
