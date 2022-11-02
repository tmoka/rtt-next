import { loadGenbaFiles, dumpGenbaJson } from './files.node'

/**
 * rtt_loader の main 関数
 * このファイルをビルドして node で実行する。
 * 実行例:
 *   node rtt_loader.bundle.js path/to/genba path/to/output.json
 */
const main = async (): Promise<void> => {
  try {
    const genbaDir = process.argv[2]
    if (!genbaDir) {
      throw Error('genbaDir が指定されていません。')
    }
    const outputPath = process.argv[3]
    if (!outputPath) {
      throw Error('outputPath が指定されていません。')
    }

    const genba = await loadGenbaFiles(genbaDir)
    await dumpGenbaJson(genba, outputPath)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
