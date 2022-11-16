# RTT Drawer

## 技術要素

RTT の描画機能を web 上で実現するために採用した技術要素は以下のとおりです。

### React.js

[React](https://reactjs.org/) を使って実装しています。
詳しい説明は web 上の記事に譲ることにします。

公式のチュートリアルを和訳してくれているブログがあるのでおすすめです。
ただし、 React v16 に対応している記事であることを確認するのを忘れないでください。
月額980円かかりますが [ドットインストール](https://dotinstall.com/search?q=react&f=topbar) の動画を観るのもいいです。

### svg

画像のフォーマットの一つです。
下記記事にある通り、svg は `<circle>` `<line>` `<text>` といった「要素（elements）」を多数入れ子にしてできています。
これら要素の組み合わせを、現場のデータとユーザのマウスの動きにあわせて、Reactを使って動的に生成します。

- [SVGファイルの特徴と作成・変換する方法 | UX MILK](https://uxmilk.jp/46597)

svg の詳細な仕様について知りたいときは、以下のサイトを見ると良いです。

- [SVG: Scalable Vector Graphics | MDN](https://developer.mozilla.org/ja/docs/Web/SVG)

### 画像の移動、拡大縮小操作

PCの場合はマウス、スマホの場合は指の動きに応じて画像を移動、拡大縮小する必要があります。
このような動きをスムーズに実現するために、地図ライブラリの実装を参考にしました。これにより、地図アプリと同様の操作で画像を移動、拡大縮小することを目指します。

- [GitHub - mariusandra/pigeon-maps: ReactJS Maps without external dependencies](https://github.com/mariusandra/pigeon-maps)

`SVGMap` というコンポーネントがマウスや指の動きを検出して移動量と倍率をリアルタイムに計算しています。計算された値は `mapState` という名前で、いたるところで利用されています。

### 座標変換

複数種類の座標変換を何段階か組み合わせることにより RTTDrawer の描画が成り立っています。
例えば、外壁1では、真ん中のメイン部分、x軸表示部、y軸表示部、天井部分の4つの向きの面（座標系）を、 `mapState` の変化に応じて別々に動かす必要があります。4つの別々の動きを実現するために、4つの部分それぞれについて別の座標変換を行っています。

svg での座標変換は、行列演算が元になっています（下記記事参照）。
座標変換を行うための変換行列は、 `a` から `f` の6つの値で表せます。
平行移動( `translate` )、拡大縮小( `scale` )、平行四辺形のように傾ける( `shear` )、といった座標変換もすべて `a` から `f` の値を使って変換行列の形で表すことができます。
svgでは、 `transform` という属性を通してどのような座標変換を行うかを指定します。

- [transform - SVG: Scalable Vector Graphics | MDN](https://developer.mozilla.org/ja/docs/Web/SVG/Attribute/transform)

RTTDrawer では、これらの行列計算や svg への指定を簡単にするため、 [transformation-matrix](https://github.com/chrvadala/transformation-matrix) というライブラリを利用しています。
`xxxTrans` といった名前のついた関数や変数は基本的に変換行列を扱っているので、そのような関数や変数に注目すると座標変換の流れを追いやすいです。

- [GitHub - chrvadala/transformation-matrix: Javascript isomorphic 2D affine transformations written in ES6 syntax. Manipulate transformation matrices with this totally tested library!](https://github.com/chrvadala/transformation-matrix)

root 座標系と呼んでいる座標系は、描画の大元となる座標系です。
描画領域の外枠の長方形の左下が root 座標系の原点となっています。
右方向がroot座標系x軸、上方向がroot座標系y軸です。

文字の描画の際は少し工夫をしないと、文字が歪んだりサイズが変動したりしてしまいます。
例えば、外壁1の真ん中のメイン部分の座標系にそのまま文字を置いたとします。
この座標系は右斜め上に少し歪んでいるので、そのまま文字を配置すると文字も同様に歪んでしまいます。
また、描画を拡大縮小したときは文字サイズも一緒に変化してしまいます。
これを防ぎ、文字の歪みとサイズを root座標系と同じ状態に保つために、 `clearTrans` を使います。 `clearTrans` には、root 座標系から今いる座標系への座標変換の逆変換（のようなもの）を計算しておきます。
文字の部分に `clearTrans` の変換を使うことで、文字の部分の座標系を root 座標系に戻すことができ、歪みや拡大縮小の影響を取り除く事ができます。
