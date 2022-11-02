/**
 * 描画領域のヘッダ部分に表示する情報
 */
export type HeaderInfoType = {
  /** 現場名 */
  readonly genbaName?: string
  /** コメント */
  readonly comment?: string
  /** 計測日 */
  readonly measuredAt?: string
  /** 計測者 */
  readonly measuredBy?: string
  /** 確認者 */
  readonly confirmedBy?: string
}
