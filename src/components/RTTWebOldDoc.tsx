import { Table } from 'react-bootstrap'

const RTTWebOldDoc = () => {
  return (
    <section>
      <h2>従来版フォーマット</h2>
      <h3>0.KIH, 1.KIH…(ポイントファイル)</h3>
      <p>基本データを描画するのに必要である。</p>

      <h3>0.TAT, 0.HON, 0.YOU, 0.CON, 1.TAT, 1.HON, 1.YOU, 1.CON…(ポイントファイル)</h3>
      <p>各種実測ファイル</p>

      <h3>0.LINK, 1.LINK…</h3>
      <p>結線情報のファイルである。 X0-Y0,X0-Y1 と書いてあればX0-Y0とX0-Y1が結線される。</p>

      <h3>0.COL, 1.COL…</h3>
      <p>柱の形状を格納しているファイルである。 例えば X0-Y0,C と書いてあればX0-Y0の位置に円柱が立っていることを表わす。 柱の形はページ最後に示した表の通りである。</p>

      <h3>TORISHIN(ポイントファイル)</h3>
      <p>RTTWebの描画には使用されていないが、このファイルを元に社員さんが ZENTAIX, ZENTAIY ファイルを作成してくれている。</p>

      <h3>ZENTAIX(ポイントファイル)</h3>
      <p>南北通りの通り芯を描画するのに必要。 以下のように２点を指定することでX0通りはこの２つの点を結ぶ直線となる。</p>
      <pre>
        <code>
          X0-1 0.0000 0.0000 0.0000 X0-2 0.0000 54000.0000 0.0000
        </code>
      </pre>

      <h3>ZENTAIY(ポイントファイル)</h3>
      <p>東西通りの通り芯を描画するのに必要。 以下ように２点を指定することでY0通りはこの２つの点を結ぶ直線となる。</p>

      <h3>ZENTAIZ</h3>
      <p>立面図などで節を描くのに必要である。 以下のようになっていれば０節の高さが0m,１節の高さが10m,２節の高さが20m…となる。</p>

      <h3>GAIHEKI</h3>
      <p>外壁を描くのに必要である。 以下のようにすればx軸の小さい方の外壁がX0通り、x軸の大きい方の外壁がX6通り、y軸の小さい方の外壁がY0通り、y軸の大きい方の外壁がY6通りとなる。</p>

      <h3>柱形状の記号と描画される形状の対応</h3>
      <Table>
        <thead>
          <tr>
            <th>記号</th>
            <th>描画される形状</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>H</td>
            <td>H鋼</td>
          </tr>
          <tr>
            <td>I</td>
            <td>I鋼(H横向き)</td>
          </tr>
          <tr>
            <td>C</td>
            <td>円柱鋼</td>
          </tr>
          <tr>
            <td>S</td>
            <td>四角形</td>
          </tr>
          <tr>
            <td>+</td>
            <td>十字鋼</td>
          </tr>
          <tr>
            <td>T_D</td>
            <td>T字下向き(⊥)</td>
          </tr>
          <tr>
            <td>T_U</td>
            <td>T字上向き(⊥の上下逆)</td>
          </tr>
          <tr>
            <td>T_R</td>
            <td>T字右向き</td>
          </tr>
          <tr>
            <td>T_L</td>
            <td>T字左向き</td>
          </tr>
          <tr>
            <td>X</td>
            <td>十字鋼(斜め向き)</td>
          </tr>
          <tr>
            <td>I_L</td>
            <td>I字左斜め向き</td>
          </tr>
          <tr>
            <td>I_R</td>
            <td>I字右斜め向き</td>
          </tr>
          <tr>
            <td>D</td>
            <td>ひし形（◇）</td>
          </tr>
          <tr>
            <td>DOT</td>
            <td>ドット（・）</td>
          </tr>
        </tbody>
      </Table>
    </section>
  )
}

export default RTTWebOldDoc