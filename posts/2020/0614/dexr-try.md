---
title: 'Dexr:Deno+Reactのフレームワークを作ってみた'
archive: true
---

## Motivation

噂の Deno を試してみてて、せっかくだからなんか React で作ろっかなーなんて思ってたら、React をユニバーサルに動かすライブラリやフレームワークがまだなかった。。。
が、ここはせっかくなので、Deno ＋ React どちらの勉強もかねて SSR〜クライアントサイドでも動く React アプリケーションフレームワークを作成してみることにしました。
ということで作成したのが表題にもある**Dexr**です。

今回作成したものは deno.land の 3rd パーティモジュールとして公開しています。

[https://deno.land/x/dexr@v0.2.2](https://deno.land/x/dexr@v0.2.2)

## Deno

まず、そもそも Deno とはなんでしょう？
Deno は簡単に言うと Typescript と Javascript のランタイム、つまり Node 同様サーバーサイドで動く Javascript 環境です。
なら Node でいいじゃん、、、と思った方もいるかもしれませんが、Deno は以下のような特徴を持っています。

- デフォルトでセキュアであり、許可しないとネットワークやファイル書き込みなどをできなくしている
- Typescript や JSX をデフォルトでサポートしている
- テスト実行もデフォルトで可能
- 実行するのは１ファイルのみ（ローカルに存在しなくてもいい）で、依存関係はインストールするのではなく URL で import する

他にも Node とは異なる部分が多いですが、より詳しい情報は以下の公式サイトにて。

[https://deno.land/](https://deno.land/)

### Deno と Node

Deno は実は Node の生みの親であるライアン・ダール先生によって作成されました。
Node は非常に優れたランタイムですが、ライアン・ダール先生には Node でやり残した公開が 10 個ありました。

[Deno の登場で Node.js の時代は終わるのか？](https://qiita.com/so99ynoodles/items/c3ba2a528052827e3b3c)

この Node で残した後悔を払拭する為に新たに作ったもの、なので今 Node では破壊的変更となってしまうであろう数々の特徴を持っています。

### Deno における JSX

さて、Deno がなんだかはなんとなくわかってきたと思いますが、5 月の v1 リリースで僕は初めて存在を知り、「なんだこれ素晴らしい」と思って色々いじってたわけなんですが、その時点で Deno にはまだ React や Vue など View 系のフレームワークがないことに気づきました。

Dev.to とかみてると結構 SSR サンプルとかはあったんですが、なんせクライアントサイドで動かない。
動いても Styled Component とかいれると壊れるようなサンプルしかない。

ということで、序盤に書いた通り自分で作ってせっかくなので公開してみました。

## Dexr

Dexr はクライアント・サーバーどちらでも同様に動作することを目的とした軽量フレームワークです。
**oak**という Deno のライブラリを利用してサーバーサイドのルーティングとかは動作させてます。

### 構成

Dexr は現時点では大きく以下の構成を持っています。

- DexrApp
- Renderer

DexrApp はアプリケーションの起動やルーティングの登録などを行ないます。
ただそれだけだと NextJS における\_document.tsx などの拡張ができないので、Renderer に head の追加やレンダリング時の拡張を行えるような責務をもたせました。

これにより、example にもあるように Redux や Styled Components などもサポートすることが可能になりました。
細かい API の解説は省きますが、雰囲気だけでも見れるように本当に簡単なサンプルコードを貼っておきます。

```typescript
import { delay } from 'https://deno.land/std@0.57.0/async/delay.ts'
import { createRenderer } from '../../renderer.tsx'
import { createDexr } from '../../mod.ts'
import { Props as BookProps } from './Book.tsx'
import Head from './Head.tsx'

const renderer = createRenderer().useHead(Head)

const dexr = createDexr().useRenderer(renderer)
await dexr.addPage('/', './App.tsx')

type BookParams = {
  id: string
}

type BookQuery = {
  foo?: string
}

await dexr.addPage<BookParams, BookQuery, BookProps>(
  '/book_async/:id',
  '/Book.tsx',
  async (params, query) => {
    await delay(1000) // async callback
    return {
      id: params.id,
      foo: query.foo ?? '[default]',
    }
  }
)

await dexr.run()
```

`addPage`の第３引数（省略可）で動的ルーティングの処理を行う感じです。
バリデーションやページ Component に渡す前処理はここで行えます。
あとは`run`すればアプリケーションが起動します。

### deno.land での公開

作成したものを３ rd パーティモジュールとして deno.land で検索可能にするには、deno.land のリポジトリ内にある JSON ファイルを更新して PR を投げるだけです。

[https://github.com/denoland/deno_website2/pull/1086](https://github.com/denoland/deno_website2/pull/1086)
※ちょうどタイミングが悪く、テストが絶対こけるようになってたので１回こけてます・・・

ここでマージされると、[https://deno.land/x](https://deno.land/x)で検索ができるようになりました。

### Dexr の今後

現状 Dexr はまだ依存ファイルの bundle とかをしておらず、.tsx のリクエストに対しコンパイルだけした js を返却するとかして無理やり動かしている状態です。
これは Deno の bundle 時のバグ（[https://github.com/denoland/deno/issues/4542](https://github.com/denoland/deno/issues/4542)）で外部ファイルの依存関係を bundle できない状態なのでこういった回避策を取っています。
bundle が無事できるようになったら

- React を export、もしくは別バージョンを指定できるように拡張
- クライアントサイドは SPA にできるよう Routing を自動で付与
- 依存関係を bundle
- SSG 的機能の追加
- ドキュメントサイトの公開

などをしていこうと思っています。

## 感想

### Deno を触ってみて

Deno 自体はとても素晴らしいです。
安全性・０インストールによる作業軽量化感・ランタイムがテストや Typescript のコンパイラをもっていることで気にすることが Node と比べるとかなり少なかったです。
webpack は多機能・ブラックボックスが故にいじってるとはまることも結構あったので、そこらへんをランタイム側で責務をおってくれるのは開発者としてもありがたいし、なにより統一性を高めることになるので非常に嬉しいところでした。

v1 でたばかりな状態なので時折バグっぽいの見つけて issue 漁ったり立てたりしてたんですが、今後自分で取り組むこともやっていきたいなと思いました。
実は自分で立てた issue の原因探ろうとソース読んでたんですが、当たり前ですが難しくて右往左往している間に Close されちゃいました（ただどちらにせよ PR 見た感じ、難易度高くて自分にはどうせできなかったと思います）。

### フレームワークを作ってみて

React の SSR 周り、特に Styled Components とかを Next がどういうサポートの仕方をしているのかとかみながらだったのでなかなか勉強になりました。

あと、「どうだったらみんなが使いやすいのか」「他のフレームワークと比べどこまで制限してどこまで拡張の余地をもたせるのか」とかを都度考えて設計しなきゃだったので、
なかなかこれも普段の開発とはまた少し違って面白かったです。

### Deno への期待

今はまだ事例とかも少ないでしょうし、まだまだこれからだとは思いますが、いずれサーバーサイド JS のランタイムのメインになっていく可能性は全然あると思います。というかなってほしいなと思います。
なのでこのフレームワークをもうちょっと育てながら、今後も Deno の動向に注目していきたいと思います。
