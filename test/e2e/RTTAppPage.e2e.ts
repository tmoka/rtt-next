import { Selector } from 'testcafe'
import {
  getPageTitle,
  assertNoConsoleErrors,
  sampleGenbaDir,
  selectTestGenbaDir,
  sleep,
} from './helpers'
import { SetsuNameType, TorishinNameType } from '../../src/common/types'

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const pkgVersion = require('../../package.json').version as string

// セレクタ
const zumenTab = (zumenJa: string): Selector =>
  Selector('[data-tid="zumen-tabs"]').find('a').withExactText(zumenJa)
const setsuSelect = Selector('[data-tid="setsu-select"]')
const xToriSelect = Selector('[data-tid="x-tori-select"]')
const yToriSelect = Selector('[data-tid="y-tori-select"]')
const pdfButton = Selector('[data-tid="pdf-button"]')
const stageDstTATCheckbox = Selector('[data-tid="stage-dst-tat-check"]')
const rttSVG = Selector('.rtt-svg-viewer svg')
const editorToolButton = (kind: 'rect' | 'line'): Selector =>
  Selector(`[data-tid="editor-tool-${kind}-button"]`)
const clearAllEditorShapesButton = Selector('[data-tid="clear-all-editor-shapes-button"]')
const shapes = (kind: 'rect' | 'line'): Selector => Selector(`[data-tid="${kind}-shape"]`)

// 選択関数
const selectHeimen =
  (setsuName: SetsuNameType) =>
  async (t: TestController): Promise<TestController> => {
    return t
      .click(zumenTab('平面図'))
      .click(setsuSelect)
      .click(setsuSelect.find('option').withExactText(setsuName))
  }
const selectSingleColumn =
  (xToriName: TorishinNameType, yToriName: TorishinNameType) =>
  async (t: TestController): Promise<TestController> => {
    return t
      .click(zumenTab('柱単品図'))
      .click(xToriSelect)
      .click(xToriSelect.find('option').withExactText(xToriName))
      .click(yToriSelect)
      .click(yToriSelect.find('option').withExactText(yToriName))
  }

const assertGeneratedPDF = async (t: TestController): Promise<TestController> => {
  await sleep(1000) // 処理が終わるまでちょっと待つ
  const { info } = await t.getBrowserConsoleMessages()
  const filteredInfo = info.filter((item) => /RTT_DRAWER_PDF_DATA:(.+)/.exec(item))

  if (filteredInfo.length !== 1) {
    // eslint-disable-next-line no-console
    console.error(filteredInfo)
  }
  return t.expect(filteredInfo.length).eql(1)
}

fixture('RTTAppPage 読み込み')
  .page(`../../src/rtt_app/app.html#/rttapp/0`)
  .afterEach(assertNoConsoleErrors)

test('タイトルが正しいこと', async (t) => {
  await t.expect(getPageTitle()).eql(`RTTApp ${pkgVersion}`)
})

const fixtures = [
  {
    genbaName: 'sample1',
    format: 'OLD',
    setsuName: '0',
    xyToriName: ['X0', 'Y0'],
  },
  {
    genbaName: 'rtt_hanshin',
    format: 'CSV',
    setsuName: '0',
    xyToriName: ['15', 'H'],
  },
]
fixtures.forEach(({ genbaName, format, setsuName, xyToriName }) => {
  fixture(`RTTAppPage 描画 ${genbaName} PDF`)
    .page('../../src/rtt_app/app.html#/rttapp/0')
    .beforeEach(selectTestGenbaDir(sampleGenbaDir(genbaName, format)))
    .afterEach(assertGeneratedPDF)
    .afterEach(assertNoConsoleErrors)

  const testPDF = async (t: TestController): Promise<void> => {
    await t.click(stageDstTATCheckbox).click(pdfButton)
    await assertGeneratedPDF(t)
  }

  test('平面0節のpdfがダウンロードできること', async (t) => {
    await selectHeimen(setsuName)(t)
    await testPDF(t)
  })

  test('柱単品のpdfがダウンロードできること', async (t) => {
    await selectSingleColumn(xyToriName[0], xyToriName[1])(t)
    await testPDF(t)
  })

  const testEditor = async (t: TestController): Promise<void> => {
    await t.click(editorToolButton('rect'))
    await t.drag(rttSVG, 400, 200)
    await t.expect(shapes('rect').count).eql(1)
    await t.expect(shapes('line').count).eql(0)

    await t.click(editorToolButton('line'))
    await t.drag(rttSVG, 200, 400)
    await t.expect(shapes('rect').count).eql(1)
    await t.expect(shapes('line').count).eql(1)

    await t.setNativeDialogHandler(() => true).click(clearAllEditorShapesButton)
    await t.expect(shapes('rect').count).eql(0)
    await t.expect(shapes('line').count).eql(0)
  }

  test('平面0節に図形が描画できること', async (t) => {
    await selectHeimen(setsuName)(t)
    await testEditor(t)
  })

  test('柱単品に図形が描画できること', async (t) => {
    await selectSingleColumn(xyToriName[0], xyToriName[1])(t)
    await testEditor(t)
  })
})
