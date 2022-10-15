import { AXIS, GosaKey } from '../types'

/**
 * 従来版現場ファイルの種類を表す型
 */
export enum OldGenbaFileType {
  /** 0.kih などのポイントファイル */
  KIH = 'KIH',
  TAT = 'TAT',
  HON = 'HON',
  YOU = 'YOU',
  CON = 'CON',
  /** COL ファイル */
  COL = 'COL',
  /** LINK ファイル */
  LINK = 'LINK',
  /** ZENTAIX ファイル */
  ZENTAIX = 'ZENTAIX',
  /** ZENTAIY ファイル */
  ZENTAIY = 'ZENTAIY',
  /** ZENTAIZ ファイル */
  ZENTAIZ = 'ZENTAIZ',
}

/**
 * 誤差データを記録しているファイルの種類
 */
export type OldGosaFileTypes =
  | OldGenbaFileType.TAT
  | OldGenbaFileType.HON
  | OldGenbaFileType.YOU
  | OldGenbaFileType.CON

/**
 * 誤差データを記録しているファイルの種類の一覧
 */
export const OLD_GOSA_FILE_TYPES = [
  OldGenbaFileType.TAT,
  OldGenbaFileType.HON,
  OldGenbaFileType.YOU,
  OldGenbaFileType.CON,
] as OldGosaFileTypes[]

/**
 * ポイントファイル形式のファイルの種類
 */
export type OldPointFileTypes =
  | OldGenbaFileType.KIH
  | OldGosaFileTypes
  | OldGenbaFileType.ZENTAIX
  | OldGenbaFileType.ZENTAIY

/**
 * 従来版ファイルの拡張子を表す型
 */
export type OldFileExts =
  | OldGenbaFileType.KIH
  | OldGenbaFileType.TAT
  | OldGenbaFileType.HON
  | OldGenbaFileType.YOU
  | OldGenbaFileType.CON
  | OldGenbaFileType.COL
  | OldGenbaFileType.LINK

/**
 * OLD_POINT_FILE_TYPE の x, y, z 座標に対応する CSVPointRow の key を求める
 * @param fileType
 * @param xyz
 */
export const oldPointFileTypeToGosaKey = (fileType: OldGosaFileTypes, xyz: AXIS): GosaKey =>
  `${fileType.toLowerCase()}${xyz.toUpperCase()}` as GosaKey
