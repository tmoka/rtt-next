/**
 * google analytics 関連の設定
 *
 * google analytics の設定とレーポートの閲覧は、
 * https://analytics.google.com/
 * アカウント: kangi.programmers@gmail.com
 * から。
 */

import { TrackerConstructor } from './types'

export * from './types'

// google analytics との通信用のクラスをweb版とelectron版で切り替える
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Tracker: TrackerConstructor = require('./tracker.web').TrackerOnWeb

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
//require('./tracker.web').TrackerOnWeb
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
//require('./tracker.renderer').TrackerOnElectron

/**
 * google analytics の tracking id
 */
const googleAnalyticsTrackingId =
  // eslint-disable-next-line no-nested-ternary
  process.env.TARGET === 'web'
    ? process.env.NODE_ENV === 'production' && !process.env.E2E_BUILD
      ? 'UA-152596960-2' // kangi3d-com-prod
      : 'UA-152596960-1' // kangi3d-com-dev
    : process.env.NODE_ENV === 'production' && !process.env.E2E_BUILD
    ? 'UA-152596960-4' // RTTApp-prod
    : 'UA-152596960-3' // RTTApp-dev

/**
 * google analytics との通信用のオブジェクト
 */
export const tracker = new Tracker(googleAnalyticsTrackingId)
