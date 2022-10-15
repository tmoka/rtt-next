import { loadGenbaFiles } from './files.node';

describe('csvファイルから読み込んだデータを GenbaData に変換できること', () => {
  test('csv_template が正しく読み込めること', async () => {
    expect.assertions(2);
    const genbaData = await loadGenbaFiles('test/rtt_loader/csv_template');
    // console.debug(genbaData);
    expect(genbaData).not.toBeFalsy();
    expect(genbaData.errors).toEqual([]);
  });

  test('rtt_hanshin が正しく読み込めること', async () => {
    expect.assertions(2);
    const genbaData = await loadGenbaFiles('test/rtt_loader/rtt_hanshin');
    // console.debug(genbaData);
    expect(genbaData).not.toBeFalsy();
    expect(genbaData.errors).toEqual([]);
  });
});
