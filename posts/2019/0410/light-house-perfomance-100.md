---
title: 'Light Houseでperfomanceを100にした話'
archive: true
---

## 今回のチューニング前

Performance ではなんとか 99 点が取れるようにはなったものの、なぜかあと 1 点はどう頑張っても取れませんでした。。。
アクセシビリティや SEO の項目は後回しにしてたので、もはや見てもなかったです。

## 今回のチューニングでやったこと

light house みて赤いところともかく全部潰しました。
かるくまとめると ↓ こんな感じですかね。

### Performance

- node と npm のビルド環境のバージョンあげただけ（...？）

### Accessibility

- button 要素に aria-label 属性追加
- html lang 属性に ja を追加（react helmet）

### Best Practice

- 特になし（Gatsby2 系が最適化してくれてる）

### SEO

- description を設定した

ということなんですが、Performance がなぜ 1 点上がったのかはよくわからず。
トランスパイル時の最適化とかで Node のバージョン依存なんてあるのかな、、、
まぁなんにしろこれで 100 点サイトです！

本当はアクセシビリティも 100 点まで行きたかったけど、前回書いた Prism らへんで引っかかってたので今回はデザインを優先して諦めました。

## React Helmet で lang 属性指定

せっかくなので、今回やった Gatsby で html lang 属性の指定方法について。
Gatsby はもととなる html ファイルを直接修正できません。
なので基本的には lang 属性を直接触る手段はないのですが、React Helmet に html タグを渡せば指定できます！

```javascript
import React from 'react'
import Helmet from 'react-helmet'
import Layout from '../components/organisms/layout'

export default ({ data }) => {
  return (
    <Layout>
      <Helmet>
        <html lang="ja" />
        <title>site title</title>
      </Helmet>
    </Layout>
  )
}
```

こんな感じですね。便利！

## 今後の目標

一旦最高得点まではいったし、これを維持しながらエンハンスしていこうかと思います。
最初に高みまで行くのは案外簡単だけど、そっから維持するのが難しいって dev.to にも書いてあったし。
あとは SEO にひっかかるようにブログもっと書かねば、、、
