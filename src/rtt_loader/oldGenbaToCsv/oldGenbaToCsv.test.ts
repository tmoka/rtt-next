import {
  asyncReadTwoKihFile,
  transformKihWithBase,
  kihToPointCsv,
  oldGenbaToCsv,
  OldGenbaToCsvError,
} from './oldGenbaToCsv';

describe('従来版現場ファイルからCSVファイルに変換できること', () => {
  test('2つのKIHファイルを統合し座標変換できること', async () => {
    const pointRows = await asyncReadTwoKihFile(
      './test/old_genba_to_csv/transform_kih_with_base/',
      '02-1',
      '02-2',
    );
    const normalizedConvertedPointRows = transformKihWithBase(pointRows, true);
    expect(normalizedConvertedPointRows).not.toHaveLength(0);
  });

  test('2つのKIHファイルを統合し座標変換できること(z座標は保存)', async () => {
    const pointRows = await asyncReadTwoKihFile(
      './test/old_genba_to_csv/transform_kih_with_base/',
      '02-1',
      '02-2',
    );
    const nonNormalizedConvertedPointRows = transformKihWithBase(
      pointRows,
      false,
    );
    expect(nonNormalizedConvertedPointRows).not.toHaveLength(0);
  });

  test('KIH ファイルから point.csv に変換できること', async () => {
    expect.assertions(1);
    const pointRows = await kihToPointCsv('./test/rtt_loader/kih/');
    expect(pointRows).not.toHaveLength(0);
  });

  ['rtt_hanshin', 'sample1'].forEach((sampleName) => {
    test(`${sampleName} フォルダ全体から link.csv, point.csv, setsu.csv, torishin.csv に変換できること`, async () => {
      expect.assertions(4);
      const data = await oldGenbaToCsv(
        `../newclass/samplefiles/RTT/${sampleName}/`,
      );
      expect(data.linkRows).not.toHaveLength(0);
      expect(data.pointRows).not.toHaveLength(0);
      expect(data.setsuRows).not.toHaveLength(0);
      expect(data.torishinRows).not.toHaveLength(0);
    });
  });
});

describe('エラーが正しく定義されていること', () => {
  test('OldGenbaToCsvError が正しく定義されていること', () => {
    const error = new OldGenbaToCsvError('test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(OldGenbaToCsvError);
    expect(error.toString()).toEqual('OldGenbaToCsvError: test message');
  });
});
