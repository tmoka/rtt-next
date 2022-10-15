import fs from 'fs';
import path from 'path';
import { CSVPointRow } from 'src/common/types';
import {
  CSVKind,
  RTTLoaderConvertError,
  RTTLoaderDecodeError,
  RTTLoaderError,
  RTTLoaderParseError,
} from './errors';
import { RTTLoader } from './loader';

const loader = new RTTLoader();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testLoader = async (csvName: string, csvType: string): Promise<any[]> => {
  const buffer = await fs.promises.readFile(
    path.join('test/rtt_loader', csvName, `${csvType}.csv`),
  );
  const content = buffer.toString();

  try {
    let data;
    switch (csvType) {
      case 'link':
        data = await loader.loadLink(content);
        break;
      case 'point':
        data = await loader.loadPoint(content);
        break;
      case 'setsu':
        data = await loader.loadSetsu(content);
        break;
      case 'torishin':
        data = await loader.loadTorishin(content);
        break;
      default:
        throw new Error('不正な csvType です');
    }

    // console.debug(data);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }
};

describe('csv テンプレートの csv ファイルから現場データを正しく読み込めること', () => {
  test('link.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('csv_template', 'link');
    expect(data).not.toBeFalsy();
  });

  test('point.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('csv_template', 'point');
    expect(data).not.toBeFalsy();
  });

  test('setsu.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('csv_template', 'setsu');
    expect(data).not.toBeFalsy();
  });

  test('torishin.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('csv_template', 'torishin');
    expect(data).not.toBeFalsy();
  });
});

describe('追加ステージを含む csv ファイルから現場データを正しく読み込めること', () => {
  test('link.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('additional_stages', 'link');
    expect(data).not.toBeFalsy();
  });

  test('point.csv が正しく読み込めること', async () => {
    expect.assertions(4);
    const data = await testLoader('additional_stages', 'point');
    expect(data).not.toBeFalsy();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pointRow: CSVPointRow = data[0];
    expect(pointRow.stage01X).toBe(1);
    expect(pointRow.stage01Y).toBe(2);
    expect(pointRow.stage01Z).toBe(3);
  });

  test('setsu.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('additional_stages', 'setsu');
    expect(data).not.toBeFalsy();
  });

  test('torishin.csv が正しく読み込めること', async () => {
    expect.assertions(1);
    const data = await testLoader('additional_stages', 'torishin');
    expect(data).not.toBeFalsy();
  });
});

describe('エラーが正しく定義されていること', () => {
  test('RTTLoaderError が正しく定義されていること', () => {
    const error = new RTTLoaderError('test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RTTLoaderError);
    expect(error.toString()).toEqual('RTTLoaderError: test message');
  });

  // TODO: 本当に正しく継承できているかチェック
  test('RTTLoaderConvertError が正しく定義されていること', () => {
    const error = new RTTLoaderConvertError(CSVKind.LINK, 'test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RTTLoaderError);
    expect(error).toBeInstanceOf(RTTLoaderConvertError);
    expect(error.toString()).toEqual(
      'RTTLoaderConvertError: test message\nファイル: link.csv',
    );
  });

  test('RTTLoaderDecodeError が正しく定義されていること', () => {
    const error = new RTTLoaderDecodeError(
      CSVKind.LINK,
      'test message',
      [],
      [],
    );
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RTTLoaderError);
    expect(error).toBeInstanceOf(RTTLoaderDecodeError);
    expect(error.toString()).toEqual(
      'RTTLoaderDecodeError: test message\nファイル: link.csv',
    );
  });

  test('RTTLoaderParseError が正しく定義されていること', () => {
    const error = new RTTLoaderParseError(CSVKind.LINK, 'test message', [], []);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RTTLoaderError);
    expect(error).toBeInstanceOf(RTTLoaderParseError);
    expect(error.toString()).toEqual(
      'RTTLoaderParseError: test message\nファイル: link.csv',
    );
  });
});
