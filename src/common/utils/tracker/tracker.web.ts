import ReactGA from 'react-ga'
import { TrackerType } from './types'

/**
 * rails の userId を取得する
 * @returns userId。ただし、取得できなかった場合は undefined
 */
const getRailsUserId = (): string | undefined => {
  // metaタグ経由でデータを取得する
  const userIdMetaTag = document.head.querySelector('meta[name=user-id]')
  const userId = (userIdMetaTag && userIdMetaTag.getAttribute('content')) || undefined
  return userId
}

/**
 * web 向けの google analytics との通信用クラス
 */
export class TrackerOnWeb implements TrackerType {
  constructor(trackingId: string) {
    const userId = getRailsUserId()
    ReactGA.initialize(trackingId, {
      debug: process.env.NODE_ENV !== 'production',
      gaOptions: { userId },
    })
  }

  // eslint-disable-next-line class-methods-use-this
  pageview(path: string): void {
    ReactGA.pageview(path)
  }

  // eslint-disable-next-line class-methods-use-this
  event(category: string, action: string, label?: string, value?: number): void {
    ReactGA.event({ category, action, label, value })
  }
}
