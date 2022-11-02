import * as pathModule from 'path'
import { ClientFunction, Selector } from 'testcafe'

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const path = require('path') as typeof pathModule

export const getPageUrl = ClientFunction(() => window.location.href)

export const getPageTitle = ClientFunction(() => document.title)

export const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const assertNoConsoleErrors = async (t: TestController): Promise<TestController> => {
  await sleep(1000) // 処理が終わるまでちょっと待つ
  const { error } = await t.getBrowserConsoleMessages()

  if (error.length > 0) {
    // eslint-disable-next-line no-console
    console.log({ error })
  }
  return t.expect(error.length).eql(0)
}

export const sampleGenbaDir = (genbaName: string, format: string): string =>
  format === 'OLD'
    ? path.join(__dirname, '../../../newclass/samplefiles/RTT', genbaName)
    : path.join(__dirname, '../rtt_loader/', genbaName)

// セレクタ
const e2eTestGenbaDirInput = Selector('[data-tid="e2e-test-genba-dir"]')
const genbaSelectButton = Selector('[data-tid="genba-select-button"]')

// 選択関数
export const selectTestGenbaDir =
  (genbaDirPath: string) =>
  async (t: TestController): Promise<TestController> =>
    t.typeText(e2eTestGenbaDirInput, genbaDirPath).click(genbaSelectButton)
