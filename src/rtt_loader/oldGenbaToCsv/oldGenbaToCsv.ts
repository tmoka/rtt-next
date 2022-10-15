import fs from 'fs'
import path from 'path'
import cloneDeep from 'lodash/cloneDeep'
import flatten from 'lodash/flatten'
import { rotate, applyToPoints } from 'transformation-matrix'
import {
  defaultCSVPoint,
  CSVLinkRow,
  CSVPointRow,
  CSVSetsuRow,
  CSVTorishinRow,
  PointNameType,
  TorishinNameType,
  AXIS,
  SetsuNameType,
  KGExceptionType,
  ColForm,
  isColForm,
  GaihekiTorishinType,
  isGaihekiKey,
  getAdditionalStageColumnKey,
  MAX_ADDITIONAL_STAGE,
} from '../../common/types'
import {
  OldGenbaFileType,
  oldPointFileTypeToGosaKey,
  OLD_GOSA_FILE_TYPES,
  OldGosaFileTypes,
  asyncForEach,
  OldFileExts,
  chunk,
  range,
} from '../../common/utils'
import { listFilesByExt, asyncReadLines } from '../../common/utils/fs.node'

export class OldGenbaToCsvError extends Error {
  name = 'OldGenbaToCsvError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, OldGenbaToCsvError.prototype)
  }

  public toKGExceptions(): KGExceptionType[] {
    return [
      {
        exceptionName: this.name,
        userMessage: this.message,
        debugMessage: '',
      },
    ]
  }
}

/**
 * ポイントファイルに記録されている1つのポイントを表す型
 */
interface OldPointFilePointType {
  readonly pointName: string
  readonly x: number
  readonly y: number
  readonly z: number
}

/**
 * COLファイルのデータを表す型
 */
interface OldColsType {
  [pointName: string]: ColForm | undefined
}

/**
 * 文字列を数値に変換
 * @param s - 数値に変換する文字列
 * @throws 数値の文字列以外ならError
 * @returns 変換後の数値
 */
const parseNum = (s: string, fileName: string, line: number): number => {
  const n = parseFloat(s)
  if (Number.isNaN(n)) {
    throw new OldGenbaToCsvError(
      `数値に変換できませんでした。 ファイル名: '${fileName}' , 行数: '${line}'行目`,
    )
  }
  return n
}

/**
 * ポイント名の中で通り芯名を分割するための分割するための文字。
 * ポイント名は `<X通り芯名>-<Y通り芯名>` という形式になっていることが多い。
 */
const TORI_NAME_DELIMITER = '-'

/**
 * KGPointのポイント名からX通りとY通りの名前を取得する
 * @param point
 * @returns xToriNameとyToriName をキーに持つobject。
 * ただし、正しく取得できなかったときはどちらの値もnull。
 */
const pointNameToXYToriName = (
  pointName: PointNameType,
): [TorishinNameType | undefined, TorishinNameType | undefined] => {
  const toriNames = pointName.split(TORI_NAME_DELIMITER)
  if (toriNames.length < 2) {
    // ポイント名を X通り芯名 と Y通り芯名 に正しく分割できなかった場合
    return [undefined, undefined]
  }
  return [toriNames[0], toriNames[1]]
}

/**
 * 節名をエスケープする
 * @param buf - エスケープしたい文字列
 * @return エスケープ後の文字列
 * @detail
   節名の中で最初に登場する数字, ドット, アンダーバー, スペース, ハイフン以外の文字以降を削除する。
   ZENTAIZファイル用。例: 0.5節 => 0.5
 */
const escapeSetsuNameStr = (buf: string): string => {
  const regexp = /^[0-9._ -]*/
  const matchResult = regexp.exec(buf)
  const setsuName = matchResult ? matchResult[0] : ''
  return setsuName
}

/**
 * 節名の文字列をファイル名で用いるためにエスケープする
 * @param setsuName
 * @returns エスケープされた節名
 */
const escapeSetsuFileName = (setsuName: string): string => setsuName.replace(/\./g, '_')

/** ファイルパス（小文字拡張子）とファイルパス（大文字拡張子）のうち存在するほうを返す。
 * @param genbaDirPath
 * @param setsuName
 * @param ext
 * @returns 存在するパス。
 * ただし、どちらも存在する場合は小文字を優先、どちらも存在しない場合は undefined 。
 * @detail 例: genbaDirPath = 'path/to/genba', setsuName = '0.5', ext = 'KIH' のとき、
 * まず、 path/to/genba/0_5.kih ファイルが存在するか調べ、存在すれば path/to/genba/0_5.kih を返す。
 * 次に、 path/to/genba/0_5.KIH ファイルが存在するか調べ、存在すれば path/to/genba/0_5.KIH を返す。
 * どちらも存在しなければ undefined を返す。
 */
const getExtCaseSensitiveFilePath = (
  genbaDirPath: string,
  setsuName: SetsuNameType,
  ext: OldFileExts,
): string | undefined => {
  const escapedSetsuName = escapeSetsuFileName(setsuName)
  const candidates = [
    path.join(genbaDirPath, `${escapedSetsuName}.${ext.toLowerCase()}`),
    path.join(genbaDirPath, `${escapedSetsuName}.${ext.toUpperCase()}`),
  ]
  const filePath = candidates.find((candidatePath) => fs.existsSync(candidatePath))
  return filePath
}

/**
 * 1つのポイントファイルを読み込んで、記録されているポイントの配列を返す
 */
const asyncReadOldPointFile = async (filePath: string): Promise<OldPointFilePointType[]> => {
  const point = { pointName: '', x: 0, y: 0, z: 0 }
  const points: OldPointFilePointType[] = []

  let lines: string[]
  try {
    lines = await asyncReadLines(filePath)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new OldGenbaToCsvError(
      `${path.basename(filePath)} ファイルの内容を読み込めませんでした。`,
    )
  }

  let isTime = false
  let line = 0
  lines.forEach((buf, i) => {
    switch (line) {
      case 0:
        if (buf === 'TIME') {
          isTime = true
          line = 1
        } else {
          point.pointName = buf
          line = 2
        }
        break
      case 1:
        point.pointName = buf
        line = 2
        break
      case 2:
        point.x = parseNum(buf, path.basename(filePath), i + 1)
        line = 3
        break
      case 3:
        point.y = parseNum(buf, path.basename(filePath), i + 1)
        line = 4
        break
      case 4: {
        point.z = parseNum(buf, path.basename(filePath), i + 1)
        const p = cloneDeep(point)
        points.push(p)
        line = isTime ? 5 : 1
        break
      }
      case 5:
        // toDo: TIME付きのポイントファイルの処理
        line = 1
        break
      default:
        break
    }
  })

  return points
}

/**
 * 1つのkihファイルを読み込んで CSVPointRowの配列 を返す
 */
const asyncReadKihFile = async (
  genbaDirPath: string,
  setsuName: SetsuNameType,
): Promise<CSVPointRow[]> => {
  const filePath = getExtCaseSensitiveFilePath(genbaDirPath, setsuName, OldGenbaFileType.KIH)
  if (!filePath) {
    // ファイル存在しない場合は空データを返す
    return []
  }

  const points = await asyncReadOldPointFile(filePath)
  const pointRows = points.map((point) => {
    // xTorishinName と yTorishinName をポイント名から推測して設定しておく
    const [xTorishinName, yTorishinName] = pointNameToXYToriName(point.pointName)
    const pointRow = {
      ...defaultCSVPoint,
      pointName: point.pointName,
      kihX: point.x,
      kihY: point.y,
      kihZ: point.z,
      setsuName,
      xTorishinName,
      yTorishinName,
    }
    return pointRow
  })

  return pointRows
}

/**
 * 2つの kih ファイルを読み込んで結合し、 CSVPointRow の配列を返す。
 * 曳家工事用の機能
 * @param genbaDirPath 現場ディレクトリのパス
 * @param fileBaseName1 1つめのファイル名（拡張子を含まない）
 * @param fileBaseName2 2つめのファイル名（拡張子を含まない）
 * @returns CSVPointRow の配列
 */
export const asyncReadTwoKihFile = async (
  genbaDirPath: string,
  fileBaseName1: string,
  fileBaseName2: string,
): Promise<CSVPointRow[]> => {
  const filePath1 = getExtCaseSensitiveFilePath(genbaDirPath, fileBaseName1, OldGenbaFileType.KIH)
  const filePath2 = getExtCaseSensitiveFilePath(genbaDirPath, fileBaseName2, OldGenbaFileType.KIH)

  const points1 = filePath1 ? await asyncReadOldPointFile(filePath1) : []
  const points2 = filePath2 ? await asyncReadOldPointFile(filePath2) : []

  const points = [...points1, ...points2]

  const setsuName = '0' // 節は 0 節に固定

  const pointRows = points.map((point) => {
    const pointRow = {
      ...defaultCSVPoint,
      pointName: point.pointName,
      kihX: point.x,
      kihY: point.y,
      kihZ: point.z,
      setsuName,
    }
    return pointRow
  })

  return pointRows
}

/**
 * 1つの誤差ファイルを読み込んで OldPointFilePointType の配列 を返す
 */
const asyncReadGosaFile = async (
  genbaDirPath: string,
  setsuName: SetsuNameType,
  fileType: OldGosaFileTypes,
): Promise<OldPointFilePointType[]> => {
  const filePath = getExtCaseSensitiveFilePath(genbaDirPath, setsuName, fileType)
  if (!filePath) {
    // ファイル存在しない場合は空データを返す
    return []
  }

  const points = await asyncReadOldPointFile(filePath)
  return points
}

/**
 * COL ファイル内で区切りとなる文字
 */
const COL_DELIMITER = /\s*,\s*/

/**
 * 1つの COL ファイルを読み込む
 */
const asyncReadColFile = async (
  genbaDirPath: string,
  setsuName: SetsuNameType,
): Promise<OldColsType> => {
  const filePath = getExtCaseSensitiveFilePath(genbaDirPath, setsuName, OldGenbaFileType.COL)
  if (!filePath) {
    return {}
  }

  let lines
  try {
    lines = await asyncReadLines(filePath)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new OldGenbaToCsvError(
      `COL ファイルの内容を読み込めませんでした。 ファイル名: '${path.basename(filePath)}'`,
    )
  }

  const oldCols: OldColsType = {}
  lines.forEach((line) => {
    const [pointName, colForm] = line.split(COL_DELIMITER)
    if (pointName && isColForm(colForm)) {
      oldCols[pointName] = colForm
    }
  })

  return oldCols
}

/**
 * GAIHEKI ファイル内で区切りとなる文字
 */
const GAIHEKI_DELIMITER = /\s*:\s*/

/**
 * GAIHEKI ファイルを読み込んで 1つの gaihekiRow を返す
 */
const asyncReadGaihekiFile = async (filePath: string): Promise<GaihekiTorishinType> => {
  let lines
  try {
    lines = await asyncReadLines(filePath)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new OldGenbaToCsvError('GAIHEKI ファイルの内容を読み込めませんでした。')
  }
  const gaihekiRow: { [key: string]: TorishinNameType | undefined } = {}
  lines.forEach((buf, i) => {
    if (buf.length === 0) {
      return
    }
    const [gaihekiKey, gaihekiValue] = buf.split(GAIHEKI_DELIMITER)
    const gaihekiKeyLower = gaihekiKey.toLowerCase()
    if (!isGaihekiKey(gaihekiKeyLower) || !gaihekiValue) {
      throw new OldGenbaToCsvError(
        `GAIHEKI ファイルの形式が正しくありません。 ファイル名: '${path.basename(
          filePath,
        )}' , 行数: '${i + 1}'行目`,
      )
    }
    gaihekiRow[gaihekiKeyLower] = gaihekiValue
  })
  return gaihekiRow
}

/**
 * 1つの ZENTAIX か ZENTAIY ファイルと GAIHEKI ファイルを読み込んで CSVTorishinRowの配列 を返す
 */
const asyncReadZentaiXOrYFile = async (
  genbaDirPath: string,
  oldPointFileType: OldGenbaFileType.ZENTAIX | OldGenbaFileType.ZENTAIY,
): Promise<CSVTorishinRow[]> => {
  const points = await asyncReadOldPointFile(path.join(genbaDirPath, oldPointFileType))
  const gaihekiPath = path.join(genbaDirPath, 'GAIHEKI')
  const gaihekiRow = fs.existsSync(gaihekiPath) ? await asyncReadGaihekiFile(gaihekiPath) : {}
  if (points.length % 2 !== 0) {
    // ポイントファイルに記録されていたポイント数が奇数
    throw new OldGenbaToCsvError(
      `${oldPointFileType} ファイルに記録されているポイント数が奇数です。`,
    )
  }
  const torishinRows: CSVTorishinRow[] = chunk(points, 2).map(([p1, p2]) => {
    const [name1] = pointNameToXYToriName(p1.pointName)
    const [name2] = pointNameToXYToriName(p2.pointName)
    if (name1 !== name2 || !name1) {
      throw new OldGenbaToCsvError(
        `${oldPointFileType} ファイルに記録されているポイント名が不正です: '${p1.pointName}', '${p2.pointName}' 。`,
      )
    }

    // gaihekiRow の値が name1 と一致していたらキー名を返す。異なっていたら undefined を返す
    const gaihekiKeyName: string | undefined = Object.keys(gaihekiRow).find((key) =>
      isGaihekiKey(key) && gaihekiRow[key] === name1 ? gaihekiRow[key] : undefined,
    )

    return {
      torishinName: name1,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      gaihekiType: gaihekiKeyName,
    }
  })

  return torishinRows
}

/**
 * .LINK ファイル内でポイント名の区切りとなる文字
 */
const LINK_DELIMITER = /\s*,\s*/

/**
 * 1つのlinkファイルを読み込んで CSVLinkRow の配列を返す
 */
const asyncReadLinkFile = async (
  genbaDirPath: string,
  setsuName: SetsuNameType,
): Promise<CSVLinkRow[]> => {
  const filePath = getExtCaseSensitiveFilePath(genbaDirPath, setsuName, OldGenbaFileType.LINK)
  if (!filePath) {
    // ファイル存在しない場合は空データを返す
    return []
  }

  let lines
  try {
    lines = await asyncReadLines(filePath)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new OldGenbaToCsvError(
      `LINK ファイルの内容を読み込めませんでした。 ファイル名: '${path.basename(filePath)}'`,
    )
  }

  const linkRows: CSVLinkRow[] = []
  lines.forEach((buf, i: number) => {
    if (buf.length === 0) {
      // 空行はスキップする
      return
    }
    const [pointName1, pointName2] = buf.split(LINK_DELIMITER)
    if (!pointName1 || !pointName2) {
      throw new OldGenbaToCsvError(
        ` ポイント名を正しく認識できませんでした。ファイル名: '${path.basename(
          filePath,
        )}' , 行数: '${i + 1}'行目 `,
      )
    }
    linkRows.push({ pointName1, pointName2, setsuName })
  })

  return linkRows
}

/**
 * ZENTAIZファイルを読み込んで CSVSetsuRow の配列を返す
 * @param genbaDirPath - 現場ディレクトリのパス
 * @returns
 */
const asyncReadZentaiZFile = async (genbaDirPath: string): Promise<CSVSetsuRow[]> => {
  const filePath = path.join(genbaDirPath, OldGenbaFileType.ZENTAIZ)

  let lines: string[]
  try {
    lines = await asyncReadLines(filePath)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    throw new OldGenbaToCsvError('ZENTAIZ ファイルの内容を読み込めませんでした。')
  }

  const setsuRows: CSVSetsuRow[] = []
  let line = 0
  let setsuName = ''
  lines.forEach((buf, i) => {
    if (buf.length === 0) {
      // 空行はスキップする
      return
    }
    if (line % 2 === 0) {
      setsuName = escapeSetsuNameStr(buf)
      if (!setsuName) {
        throw new OldGenbaToCsvError(
          `節名を識別できませんでした。 ファイル名: '${path.basename(filePath)}' , 行数: '${
            i + 1
          }'行目`,
        )
      }
    } else {
      const z = parseNum(buf, path.basename(filePath), i)
      setsuRows.push({ setsuName, z })
    }
    line += 1
  })

  return setsuRows
}

/**
 * kihファイルを読み込んで point.csv のデータを返す
 * @param genbaDirPath - kihファイルを含むディレクトリ
 * @returns point.csv のcsvデータ
 */
export const kihToPointCsv = async (genbaDirPath: string): Promise<CSVPointRow[]> => {
  const kihFileNames = await listFilesByExt(genbaDirPath, OldGenbaFileType.KIH)
  const setsuNames = kihFileNames.map((fileName) => path.parse(fileName).name)

  // KIHファイル読み込み
  const kihData = await Promise.all(
    setsuNames.map(async (setsuName) => asyncReadKihFile(genbaDirPath, setsuName)),
  )

  const pointRows = flatten(kihData)
  return pointRows
}

/**
 * 現場ファイルのうちポイント関連のファイルを読み込んで point.csv の内容を返す
 * @param genbaDirPath - 現場ファイルを含むディレクトリ
 * @returns point.csv のcsvデータ
 */
const pointsToCsv = async (genbaDirPath: string): Promise<CSVPointRow[]> => {
  // 節一覧の取得
  const setsuRows = await asyncReadZentaiZFile(genbaDirPath)
  const setsuNames = setsuRows.map((setsuRow) => setsuRow.setsuName)

  // KIHファイル読み込み
  const pointsData = await Promise.all(
    setsuNames.map(async (setsuName) => asyncReadKihFile(genbaDirPath, setsuName)),
  )

  await asyncForEach(OLD_GOSA_FILE_TYPES, async (fileType) => {
    // 誤差ファイルの読み込み
    const gosaData = await Promise.all(
      setsuNames.map(async (setsuName) => asyncReadGosaFile(genbaDirPath, setsuName, fileType)),
    )

    // 読み込んだ誤差データを pointsData に追加
    gosaData.forEach((gosaPoints, i) => {
      gosaPoints.forEach((gosaPoint) => {
        const pointRow = pointsData[i].find((row) => row.pointName === gosaPoint.pointName)
        if (pointRow) {
          pointRow[oldPointFileTypeToGosaKey(fileType, AXIS.X)] = gosaPoint.x - pointRow.kihX
          pointRow[oldPointFileTypeToGosaKey(fileType, AXIS.Y)] = gosaPoint.y - pointRow.kihY
          pointRow[oldPointFileTypeToGosaKey(fileType, AXIS.Z)] = gosaPoint.z - pointRow.kihZ
        }
      })
    })
  })

  // COL ファイル読み込み
  const colData = await Promise.all(
    setsuNames.map(async (setsuName) => asyncReadColFile(genbaDirPath, setsuName)),
  )

  // 読み込んだ COL データを pointsData に追加
  colData.forEach((oldCols, i) => {
    Object.entries(oldCols).forEach(([pointName, colForm]) => {
      // const colForm = oldCols[pointName];
      const pointRow = pointsData[i].find((row) => row.pointName === pointName)
      if (pointRow) {
        pointRow.colForm = colForm
      }
    })
  })

  const pointRows = flatten(pointsData)
  return pointRows
}

/**
 * linkファイルを読み込んで link.csv のデータを返す
 * @param genbaDirPath - linkファイルを含むディレクトリ
 * @returns link.csv のcsvデータ
 */
const linkToCsv = async (genbaDirPath: string): Promise<CSVLinkRow[]> => {
  // 節一覧の取得
  const setsuRows = await asyncReadZentaiZFile(genbaDirPath)
  const setsuNames = setsuRows.map((setsuRow) => setsuRow.setsuName)

  // LINKファイル読み込み
  const linkData = await Promise.all(
    setsuNames.map(async (setsuName) => asyncReadLinkFile(genbaDirPath, setsuName)),
  )

  const linkRows = flatten(linkData)
  return linkRows
}

/**
 * ZENTAIX と ZENTAIY ファイルを読み込んで torishin.csv のデータを返す
 */
const zentaiXYToCsv = async (genbaDirPath: string): Promise<CSVTorishinRow[]> => {
  const torishinRows = flatten(
    await Promise.all([
      asyncReadZentaiXOrYFile(genbaDirPath, OldGenbaFileType.ZENTAIX),
      asyncReadZentaiXOrYFile(genbaDirPath, OldGenbaFileType.ZENTAIY),
    ]),
  )
  return torishinRows
}

/**
 * ZENTAIZファイルを読み込んで setsu.csv のデータを返す
 * @param genbaDirPath - ZENTAIZファイルを含むディレクトリ
 * @returns setsu.csv のcsvデータ
 */
const zentaiZToCsv = async (genbaDirPath: string): Promise<CSVSetsuRow[]> => {
  const setsuRows = await asyncReadZentaiZFile(genbaDirPath)
  return setsuRows
}

export const BASE0_POINT_NAME = 'BASE0'
export const BASE1_POINT_NAME = 'BASE1'

/**
 * 適当な座標系の pointRows を pointName が BASE0 のものを原点、 pointName が BASE1 のものを x 軸上の点として座標変換する
 * @param pointRows 座標変換前の pointRows
 * @param isNormalizeZ z 座標を BASE0 に合わせる場合は true, そうでなければ false
 * @returns 座標変換後の pointRows
 */
export const transformKihWithBase = (
  pointRows: CSVPointRow[],
  isNormalizeZ: boolean,
): CSVPointRow[] => {
  // 平行移動 (3次元なのでライブラリを使わない)
  const base0 = pointRows.find((pointRow) => pointRow.pointName === BASE0_POINT_NAME)
  if (!base0) {
    throw new OldGenbaToCsvError(`基準となるポイント "${BASE0_POINT_NAME}" がありません。`)
  }
  const translatedPointRows = pointRows.map((pointRow) => ({
    ...pointRow,
    kihX: pointRow.kihX - base0.kihX,
    kihY: pointRow.kihY - base0.kihY,
    kihZ: isNormalizeZ ? pointRow.kihZ - base0.kihZ : pointRow.kihZ,
  }))

  // 角度を求める
  const base1 = translatedPointRows.find((pointRow) => pointRow.pointName === BASE1_POINT_NAME)
  if (!base1) {
    throw new OldGenbaToCsvError(`基準となるポイント "${BASE1_POINT_NAME}" がありません。`)
  }
  const phi = Math.atan2(base1.kihY, base1.kihX)
  if (Number.isNaN(phi)) {
    throw new OldGenbaToCsvError('回転角が正しくないため回転できません。')
  }

  // [{x: number, y: number}] という配列を作る
  const points = translatedPointRows.map((pointRow) => ({
    x: pointRow.kihX,
    y: pointRow.kihY,
  }))

  // 回転させる
  const matrix = rotate(-1 * phi)
  const rotatedPoints = applyToPoints(matrix, points)
  const resultPointRows = translatedPointRows.map((pointRow, i) => ({
    ...pointRow,
    kihX: rotatedPoints[i].x,
    kihY: rotatedPoints[i].y,
  }))

  return resultPointRows
}

/**
 * 現場フォルダに含まれる従来版現場ファイルをcsvに変換する
 * @param genbaDirPath - 現場フォルダ
 * @returns 4種類の csv ファイルのcsv形式の文字列
 */
export const oldGenbaToCsv = async (
  genbaDirPath: string,
): Promise<{
  linkRows: CSVLinkRow[]
  pointRows: CSVPointRow[]
  setsuRows: CSVSetsuRow[]
  torishinRows: CSVTorishinRow[]
}> => {
  const [pointRows, linkRows, torishinRows, setsuRows] = await Promise.all([
    pointsToCsv(genbaDirPath),
    linkToCsv(genbaDirPath),
    zentaiXYToCsv(genbaDirPath),
    zentaiZToCsv(genbaDirPath),
  ])

  return {
    linkRows,
    pointRows,
    setsuRows,
    torishinRows,
  }
}

/**
 * 曳家工事用データを読み込む
 * @param genbaDirPath
 * @param isNormalizeZ z 座標を BASE0 に合わせる場合は true, そうでなければ false
 */
export const loadHikiyaDataFiles = async (
  genbaDirPath: string,
  isNormalizeZ: boolean,
): Promise<CSVPointRow[]> => {
  // ステージ00を読み込む
  // ステージ00は基本データとして扱う
  const pointRows = transformKihWithBase(
    await asyncReadTwoKihFile(genbaDirPath, '00-1', '00-2'),
    isNormalizeZ,
  )

  // ステージ01以降を読み込む
  await asyncForEach(range(1, MAX_ADDITIONAL_STAGE + 1), async (stageIdx): Promise<void> => {
    const paddedStageIdx = `${stageIdx}`.padStart(2, '0')
    const fileBaseName1 = `${paddedStageIdx}-1`
    const fileBaseName2 = `${paddedStageIdx}-2`
    const rawRows = await asyncReadTwoKihFile(genbaDirPath, fileBaseName1, fileBaseName2)
    if (rawRows.length === 0) {
      return
    }
    const stagePointRows = transformKihWithBase(rawRows, isNormalizeZ)

    const keyX = getAdditionalStageColumnKey(stageIdx, AXIS.X)
    const keyY = getAdditionalStageColumnKey(stageIdx, AXIS.Y)
    const keyZ = getAdditionalStageColumnKey(stageIdx, AXIS.Z)
    stagePointRows.forEach((stagePointRow) => {
      const targetRow = pointRows.find((pointRow) => pointRow.pointName === stagePointRow.pointName)
      if (!targetRow) {
        throw new OldGenbaToCsvError(
          'ポイント名が不正です。ステージ00に含まれるポイント名を指定してください。' +
            `: ステージ${paddedStageIdx}, ${stagePointRow.pointName}`,
        )
      }

      // 基本データとの誤差を求める
      targetRow[keyX] = stagePointRow.kihX - targetRow.kihX
      targetRow[keyY] = stagePointRow.kihY - targetRow.kihY
      targetRow[keyZ] = stagePointRow.kihZ - targetRow.kihZ
    })
  })

  return pointRows
}
