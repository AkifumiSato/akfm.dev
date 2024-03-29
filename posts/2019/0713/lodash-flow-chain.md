---
title: 'lodashのflowやchainを数学的に分析する'
archive: true
---

## Introduction

最近圏論を学びはじめました。
関数型を学ぶ上で、言語->数学の順で学ぶことへの疑問が自分の中で溜まってしまったのと、久しぶりに数学勉強してみたくてしょうがなくなったのでやってみようかなと。
まぁまだまだ学び途中なんですが、備忘録も兼ねて今回は、lodash の chain を圏論的に見るとどうなのかを解説してみようかと思います。

## lodash とは

lodash は関数型 javascript をサポートするユーティリティライブラリです。
多くのフレームワークやライブラリの内部実装に使われてたりもする、結構有名なライブラリです。
jQuery とかと違って、ここ数年は lodash や Rxjs とかのプログラミングパラダイムをサポートするユーティリティ的なライブラリが出て結構盛り上がってる（と僕は思ってるので）、知らなかった人はぜひ試してみてください！

### 他の関数型サポートのライブラリ

ちなみに話ついでに。関数型系のライブラリだと

- RamdaJS
- immutableJS

とかが昨今だと関数型系のライブラリだと有名ですかね？
Ramda は僕はちゃんと使ったことがないんですが、ドキュメントとかみてると結構 lodash と同じような関数が揃ってるイメージです。

あとはやっぱり React や Redux なんかが関数型の影響を強く受けてたりするのと、最近よく聞くようになってきた Elm が関数型言語なので、その辺も要チェックですね。
Elm ネタはいずれ記事で書きたいと思います。

## lodash/chain と lodash/fp/flow

lodash には lodash と lodash/fp というものがあり、lodash/fp の方がより関数型スタイルを強めたもの（詳細は省きますが、デフォルトでカリー化されている）になります。
おそらくですが、lodash/fp の方が後発だと思います。
今回はこの lodash と lodash/fp にあるパイプライン的演算を可能にする lodash/chain と lodash/fp/flow でどのようなデータ構造が生成されているか、そして lodash/chain から lodash/fp/flow に変化したことによって圏論的にはどのような構造変化があったのかみてみようと思います。

### chain

lodash を直接 import するとバイト数が大きくなるのであまりよろしくないんですが、今回は最適化が目的ではないので一旦わかりやすさ重視でいきたいと思います。
chain では値を受け取って加工してから、最後に\_.value()で値を取り出せます。

```javascript
import _ from 'lodash'

const result = _.chain([1, 2, 3, 4, 5])
  .map((x) => x * 2)
  .filter((x) => x <= 6)
  .value()

console.log(result)
```

細かいメソッドの説明は省きますが、この例では chain で配列を受け取ってから lodash のプロトタイプで定義されているメソッド（map, filter, value）を実行しています。

### Comonad というアプローチ

この chain で生成されたデータ構造は圏論的？に言うと **コモナド** と言われる構造です。
コモナドはコモナド則という規則を満たす構造で、圏論的にはいわゆる **モナド** と双対する存在です。

chain で生成されたデータ構造は\_.value を実行するまで隠蔽されています。
コモナドも同様に計算途中では値は隠蔽されており、必要になった場面で値の取り出し操作が発生します。

Haskell にもコモナドは定義されているので、Haskell の型定義を参考にみてみましょう。
※急に Haskell が出てきましたがご容赦ください。

```haskell
class Functor w => Comonad w where
  extract :: w a -> a
  extend :: (w b -> a) -> w b -> w a
  duplicate :: w a -> w (w a)

  duplicate = extend id
  extend f = fmap f . duplicate
```

extract の*w a -> a*　は、ラッピングされた a という型(w a)から a という値を取り出すことを、
extend の*w b -> a*　はラッピングされた引数（w a）から b という型の結果を返す関数を引数に取ることを表しています。

chain で生成された構造も、プロトタイプで繋がれたメソッドに*b -> a* となるような関数を渡して新たな関数　*w b ->a* を生成し、ラッピングされた値（_w b_）へ適用し、戻り値（_w a_）を得ているとみなせますね。
最後の value メソッドで*w a -> a*である extract 同様の振る舞いをしているのでまさにコモナドです。

### flow

次に lodash/fp/flow の挙動をみてみましょう。
※今度は partial import してますが、主題じゃないので詳細は省きますが単なる最適化です。

```javascript
import map from 'lodash/fp/map'
import filter from 'lodash/fp/filter'
import flow from 'lodash/fp/flow'

const result = flow(
  map((x) => x * 2),
  filter((x) => x <= 6)
)([1, 2, 3, 4, 5])

console.log(result)
```

map や filter に関数を渡した際の戻り値が*a -> b*型の関数に変わってたり、値の取り出しに必要だった value メソッドがなくなりましたね。
先ほど説明したコモナドで定義されてた型とはだいぶ異なるので、これだとコモナドではなさそうですね。

これを Typescript の型でみてみるとこんな感じになります。

```typescript
<R1, R2>(f1: () => R1, f2: (a: R1) => R2): () => R2
```

関数を受け取って関数を返す、ほんとうにただの関数ですね。
構造的なラッピングとかはとくにないので、これはコモナドでもモナドでもなく、単純な関数になります。

lodash/fp ではコモナドなどのアプローチよりも関数の組み合わせへ方向転換することで従来の使い勝手に近い状態で chain の partial import やカリー化を行なったということになります。

## まとめ

chain と flow は単純な互換的メソッドのように見えますが、実は内部アプローチ自体大きく変更されていることがわかりました。
この変更を見たときは「ああ、シンプルになったしよかったな」くらいにしか思ってなかったんですが、こうしてみると結構おおきな変更に見えますね。

今回は lodash の chain がコモナド生成であることに絞りましたが、今後また圏論ネタで Elm とかもかけていけたらと思います。
