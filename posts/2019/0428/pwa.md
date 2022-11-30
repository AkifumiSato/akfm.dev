---
title: 'PWA対応をブログでしてみた'
archive: true
---

## PWA とは？

**Progressive Web App**の略で、ネイティブアプリっぽく動作させるためのいくつかの要件を満たしている Web アプリのこと。
オフラインキャッシュやプッシュ通知とかですね。
去年あたり？日経新聞さんが対応ゴリゴリにやって界隈で話題になりました。
※ヒーローイメージは Slack の PWA コミニティで選ばれたロゴ。

## なぜ PWA 対応するの？

- 速度改善
- オフライン対応
- ユーザーへの訴求 Push 通知実施

などが理由としてはあげられるのだろうけど、こういったブログでやる意味はほとんどないと思います。
速度改善に繋がる部分はまぁ意味があるかもしれないけど、正直もともと爆速だし、オフラインでこのブログみてもな、、、って自分でも思うし。
完全にやってみたかっただけです。

## Gatsby アプリに PWA 対応する

### manifest の適用編

まずは web manifest を適用させていきます。
Gatsby にプラグインがあるので、インストール。

```none
npm install --save gatsby-plugin-manifest
```

そしたら以下を gatsby-config.js に追記しましょう。

```javascript
module.exports = {
  // ...省略
  plugins: [
    // ...省略
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'AKIFUMI SATO',
        short_name: 'AKIFUMI SATO',
        start_url: '/',
        background_color: '#fff',
        theme_color: '#fff',
        display: 'standalone',
        icon: 'static/favicon.png',
        icons: [
          {
            src: `/favicon/favicon-32.png`,
            sizes: `32x32`,
            type: `image/png`,
          },
          {
            src: `/favicon/favicon-192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/favicon/favicon-512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
        crossOrigin: `use-credentials`,
      },
    },
  ],
}
```

ちょっと初見でわかりにくい点として、icon で設定した画像をベースに icons の src で指定したパスにプラグインが画像を生成・配置してくれます。
なので実際には favicon-xx.png とかはいちいちディレクトリに配置しなくてオッケーです。

これをやって実際に manifest が画面上で確認できたら、今度はオフライン対応をしてみましょう。

### offline 適用編

例のごとく、Gatsby のプラグインをインストール。

```none
npm install --save gatsby-plugin-offline
```

そしたら以下を gatsby-config.js に追記しましょう。

```javascript
module.exports = {
  // ...省略
  plugins: [
    // ...省略
    'gatsby-plugin-offline',
  ],
}
```

たった１行。。。
このプラグインは内部的には Workbox っていう Google 製のライブラリを使用してて、option で同様の設定とかを渡せるらしいのですが、デフォルト値で十分いい感じにキャッシュしてくれるので ↑ で基本は十分です。

## 感想

「ブログで PWA やってどうすんだよ、、、」って思ってたけど、やっぱやってみると少し感動しました。
とは言っても、今回結局デフォルトで設定されてる Workbox の内容みながら少しドキュメント読んだりはしたんですが、諸々書いてみたわけじゃないからちょっと不完全燃焼なところもあるので、余裕あればそのうち Gatsby 以外で書いてみようと思います。
