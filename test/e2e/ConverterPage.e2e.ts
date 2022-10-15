import { Selector } from 'testcafe'
import { assertNoConsoleErrors, sampleGenbaDir, selectTestGenbaDir, sleep } from './helpers'

// セレクタ
const kihToCsvButton = Selector('[data-tid="kih-to-csv-convert-button"]')
const oldGenbaToCsvButton = Selector('[data-tid="old-genba-to-csv-convert-button"]')

const assertConvertedCsvFromKih = async (t: TestController): Promise<TestController> => {
  await sleep(1000) // 処理が終わるまでちょっと待つ
  const { info } = await t.getBrowserConsoleMessages()
  const filteredInfo = info.filter((item) => /KIH_TO_POINT_CSV_DATA:(.+)/.exec(item))

  if (filteredInfo.length !== 1) {
    // point.csv と torishin.csv が適切に出力されていない場合
    // eslint-disable-next-line no-console
    console.error(filteredInfo)
  }
  return t.expect(filteredInfo.length).eql(1)
}

const assertConvertedCsvFromOldGenba = async (t: TestController): Promise<TestController> => {
  await sleep(1000) // 処理が終わるまでちょっと待つ
  const { info } = await t.getBrowserConsoleMessages()
  const filteredInfo = info.filter(
    (item) =>
      /OLD_GENBA_TO_LINK_CSV_DATA:(.+)/.exec(item) ||
      /OLD_GENBA_TO_POINT_CSV_DATA:(.+)/.exec(item) ||
      /OLD_GENBA_TO_SETSU_CSV_DATA:(.+)/.exec(item) ||
      /OLD_GENBA_TO_TORISHIN_CSV_DATA:(.+)/.exec(item),
  )

  if (filteredInfo.length !== 4) {
    // point.csv と torishin.csv が適切に出力されていない場合
    // eslint-disable-next-line no-console
    console.error(filteredInfo)
  }
  return t.expect(filteredInfo.length).eql(4)
}

const fixtures = [
  { genbaName: 'rtt_hanshin', format: 'OLD' },
  { genbaName: 'sample1', format: 'OLD' },
]
fixtures.forEach(({ genbaName, format }) => {
  fixture(`ConverterPage KIH => CSV 変換 ${genbaName}`)
    .page(`../../src/rtt_app/app.html#/converter`)
    .beforeEach(selectTestGenbaDir(sampleGenbaDir(genbaName, format)))
    .afterEach(assertNoConsoleErrors)
    .afterEach(assertConvertedCsvFromKih)

  test('テスト現場フォルダの KIH ファイルが CSV に変換できること', async (t) => {
    await t.click(kihToCsvButton)
  })

  fixture(`ConverterPage 現場フォルダ全体 => CSV 変換 ${genbaName}`)
    .page(`../../src/rtt_app/app.html#/converter`)
    .beforeEach(selectTestGenbaDir(sampleGenbaDir(genbaName, format)))
    .afterEach(assertNoConsoleErrors)
    .afterEach(assertConvertedCsvFromOldGenba)

  test('テスト現場フォルダの現場フォルダ全体が CSV に変換できること', async (t) => {
    await t.click(oldGenbaToCsvButton)
  })
})
