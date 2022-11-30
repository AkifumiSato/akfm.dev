---
title: 'Gatsby&Typescript&StorybookでComponent開発を効率化する'
archive: true
---

## Introduction

React や Vue で新規の Component を書くとき、画面で実際に使いながら Componennt を作って、あとになって
「あー、あのときこう作っておけば」
「そもそもこの Component って何渡せばいいんだっけ？」
「なんか似たような Component あるな、、、」
なんて経験、筆者だけじゃないと思います。
Component 思考において最も重要な「どう使うか」という観点が、実際に画面をみながら開発するとどうしてもその場しのぎというか、一旦画面要件を満たす形だけ作ってしまって Component としての独立性とか責務わけがぐちゃぐちゃになったりしやすかったりしますよね。

### What is Storybook

**Storybook**はこういった Component 開発のやりずらさを解消してくれます。
具体的には

- 独立した Component の一覧
- Component の表示や振る舞いのデモ
- 使い方（props の型定義など）のドキュメント

といった機能を提供してくれるので、より Component にフォーカスして実装することができます。
※ヒーローイメージはこのサイトの Storybook のキャプチャです。

ちなみに Storybook の由来は、Component が利用される場面=Story をまとめたものだから Storybook という由来、、、だと思っています（推測です、ごめんなさい）。

## 導入

React アプリケーションに Storybook を入れたい方は、公式に色々まとまってるのでこのブログより先に見たほうがいいです。
[Storybook Quick Start Guide](https://storybook.js.org/docs/guides/quick-start-guide/)

Gatsby での導入についても Gatsby の公式に乗ってるので、一旦そちらを見たほうがいいです。
[Gatsby Visual Testing with Storybook](https://www.gatsbyjs.org/docs/visual-testing-with-storybook/)

公式にまとまってるし簡単じゃん！
...で終わればいいんですが、このブログでは Gatsby + Typescript で構成しているのでちょっと罠があってハマりました。

## Gatsby + Typescript + Storybook の webpack 設定

### package version

- gatsby: 2.3.32
- @storybook/react: 5.0.11

### まずは Gatsby 公式の通りに

**sb init**コマンド実行して公式の指示通りに webpack.config.js 用意すると普通に動きました。
...が、実際に Component を呼ぼうとすると.ts ファイルを読み込めない。。。
まぁ loader で Typescript の loader かましてないからそりゃそうです。

ということで babel-loader に Typescript の設定をする必要が出てきます。

### Typescript を Storybook のビルド環境でトランスパイル

- typescript
- babel-loader

**gatsby-plugin-typescript**を利用してるとプラグイン内にトランスパイル設定とかパッケージが隠蔽されるから Storybook 側で webpack で loader かますには別途 npm i しなきゃいけないんですよね。
ということで上記の２つをいれて、webpack.config.js を以下のように書き換えました。

```javascript
module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [['react-app', { flow: false, typescript: true }]],
        },
      },
    ],
  })
  config.resolve.extensions.push('.ts', '.tsx')
  return config
}
```

これで Typescript の Component も Storybook で読み込めるようになりました。

## Storybook の豊富なアドオン

Storybook にはアドオンが豊富なんですが、今回は必要なものだけにしようと思い

- addon-actions
- addon-info
- addon-links
- addon-storysource
- addon-viewport

らへんのみ入れてみました。
この辺は結構オーソドックスなものなので入れてる人も多いと思います。

ただここでまた Typescript との掛け合わせの問題が出てきます。。。
**addon-info**で自動解析してくれるはずの props の定義ドキュメントが空になる。。。
これは Storybook の webpack の中で**react-docgen-typescript-loader**を loader に追加することで解決しました。

```javascript
module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [['react-app', { flow: false, typescript: true }]],
        },
      },
      {
        loader: require.resolve('react-docgen-typescript-loader'), // 　addon-info用
      },
      {
        loader: require.resolve('@storybook/addon-storysource/loader'), // addon-storysource用
        options: { parser: 'typescript' },
      },
    ],
  })
  config.resolve.extensions.push('.ts', '.tsx')
  return config
}
```

**react-docgen-typescript-loader**によって Storybook 側で型定義を解析できるようになり、**addon-info**にも props 定義が表示されるようになりました。

## Storybook を使ってみて

ここまでで Gatsby+Typescript+Storybook が実際動くようになり、Story を描き始めたのですが、Story で Component をみてみると謎に input に白い背景色がついてたり、Prism の初期化を呼び出す Component が page レイヤーになってたり、と
ん？ってなる箇所が思いの外あって、驚きました。

自分の中では結構綺麗に作ってるつもりだったので、ちょっとショックでしたがこういった気づきがある時点で Storybook での Component 開発は意味をなしてくるんでしょうね。

### addon-info について

今回やってみて思ったんですが、Storybook を使うならこれは絶対必須です。
チーム開発において Component の使い方や責務の認識共有って非常に難しいと思うんですが、これがあればドキュメントとかかかないでも Component の振る舞いがわかるから非常に楽。
Typescript で補完が効いても、他人が作った Component を利用するときどうしても不安になって結局 Component のソースみないといけない、、、みたいな状況を緩和してくれる気がします。

## 感想

Storybook 非常にいいですね。
なんか TDD 的な、単一責務のモジュラリティ向上を目的としたツール感がすごい。

まだテスト系整えられてないので、今後はテスト系整えていこうと思います。
