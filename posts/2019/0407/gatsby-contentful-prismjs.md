---
title: 'Gatsby＋Contentful＋PrismJSでシンタックスハイライトを表現する'
archive: true
---

## Prism とは

Prism は syntax highlight を表現するための（多分）最も有名なライブラリです。
Gatsby には**gatsby-remark-prismjs**っていうプラグインとかがあるんですが、このブログは contentful 経由で記事を生成しているので Markdown では記事が存在しないために使えませんでした。
ということで備忘録がてらまとめておこうかと思います。

## package のバージョン

- gatsby: 2.3.3
- react: 16.8.6
- Prism: 1.16.0

ブログの記事自体は Contentful から取得しています。

## 実際の作業の流れ

### まずは install

```none
npm i prismjs
```

### Prism の適用

1. Prism を Component に import
2. 好きな theme を import
3. hooks の useEffect で Component マウント時に Prism.highlightAll を呼び出し、Dom に適用する

Prism にはいくつか theme があるんですが、ぼくは割と default が好きだったので、default を選びました。

```javascript
import React, { useEffect } from 'react'
import Prism from 'prismjs' // step1
import 'prismjs/themes/prism.css' // step2

export default () => {
  useEffect(() => {
    Prism.highlightAll() // step3
  })

  return (
    <pre className="language-javascript">
      <code>
        // Your code
      <code>
    </pre>
  )
}
```

Raect の hooks についての説明は省略します。
これで Prism が適用されました。

## 雑記

シンタックスハイライトをサイト上で使いたいと思ったことがなかったので結構初めて知った部分が多かったですが、割と簡単に適用できますね。
最初自前で実装しようかなーとか思ったけど、絶対 Prism とか使った方が楽。

リファクタ系のやりたきことも増えてきたから次は見えない部分リファクタとか中心にやろうかなー、、、
