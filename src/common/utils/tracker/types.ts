/**
 * google analytics event の category を表す型
 */
export enum EventCategory {
  RTTAPP = 'RTTAPP',
  CONVERTER = 'CONVERTER',
  GENBA_DATA_FORMAT = 'GENBA_DATA_FORMAT',
  RTT_DRAWER_MENU = 'RTT_DRAWER_MENU',
  RTT_SVG_VIEWER = 'RTT_SVG_VIEWER',
  ZUMEN_TYPE = 'ZUMEN_TYPE',
}

/**
 * google analytics との通信用のクラスの型
 */
export type TrackerConstructor = {
  new (trackingId: string): TrackerType
}

/**
 * google analytics との通信用のオブジェクトの型
 */
export type TrackerType = {
  /**
   * google analytics にページの閲覧を示す pageview データを送信
   */
  pageview(path: string): void
  /**
   * google analytics に event データを送信
   * @detail 参考: https://support.google.com/analytics/answer/1033068
   */
  event(category: EventCategory, action: string, label?: string, value?: number): void
}
