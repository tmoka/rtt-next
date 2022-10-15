// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron'
import * as universalAnalyticsModule from 'universal-analytics'
import * as nodeMachineIdModule from 'node-machine-id'
import { TrackerType } from './types'

/**
 * electron 向けの google analytics との通信用クラス
 *
 * 参考: https://blogenist.jp/2019/09/17/9221/
 */
export class TrackerOnElectron implements TrackerType {
  visitor: universalAnalyticsModule.Visitor

  constructor(trackingId: string) {
    const ua = remote.require('universal-analytics') as typeof universalAnalyticsModule.default
    const { machineIdSync } = remote.require('node-machine-id') as typeof nodeMachineIdModule

    const original = true
    const clientId = machineIdSync(original) // マシンごとに固有のidを取得する
    this.visitor = ua(trackingId, clientId, { strictCidFormat: false })
  }

  pageview(path: string): void {
    // electron のページにはホスト名が存在しないので、代わりに http://localhost を設定しておく
    this.visitor.pageview(path, 'http://localhost').send()
  }

  event(category: string, action: string, label?: string, value?: number): void {
    let v
    if (label === undefined) {
      v = this.visitor.event(category, action)
    } else if (value === undefined) {
      v = this.visitor.event(category, action, label)
    } else {
      v = this.visitor.event(category, action, label, value)
    }
    v.send()
  }
}
