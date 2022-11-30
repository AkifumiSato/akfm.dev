---
title: 'NetlifyでRustを使う'
archive: true
---

## Introduction

### Why Rust?

最近 Rust を勉強し始めて、ゴールデンウィーク中に Rust の[The Book](https://doc.rust-jp.rs/book/second-edition/ 'The Book')を一通りやって、最終的に yew という Rust 版 React（どっちかというと Elm？）を試そうと決めました。

一通り The Book は終えたのですが、Rust いいですね。
「安全性」「速度」「可読性」どれをとっても文句なし。
Haskell や Scala でよく聞くコンパイル時間や実行速度の問題もないし、C++などでよく聞くメモリ系の脆弱性に対してもコンパイラがかなり堅牢なので意図せずにはメモリ脆弱にはなりにくい。
もともと Firefox が CSS エンジンを Rust にしたらメモリ脆弱性が何十個も減った、とか言ってた理由もわかるしブラウザのような高い性能が求められるシステムを対象にしても十分やっていけるのも頷ける。

フロントエンド界隈でも wasm で注目されてるし、Amazon や MS が去年採用決めたりして盛り上がってきてるので、サーバーサイド・フロントエンド問わず興味があるならぜひ The Book のチュートリアルを始めることを進めます！（宣伝？）

### Netlify+Rust

とまぁ、順調に The Book は進められたのですが、せっかくなので後々ブログのネタにしようと思い、作成物を Netlify にあげようと思ってたのですが、Netlify ってそもそも Rust サポートしてなかったんじゃなかったっけな・・・と思ったら案の定未サポート。

yew や wasm のサンプル見てると結構 Netlify にあげてる人多いのにやり方どこにも書いてないなぁ、、、
ということで、備忘録もかねて Netlify で Rust でビルドしたサイトを運用する方法を書き残していきたいと思います。

## 作成物

今回は Rust（wasm、もっと言えば yew）をビルドしてホスティングすることが目標です。

wasm のビルドには元のコンパイル環境と webpack が必要になりますが、yew にはもろもろ設定したテンプレートがあるのでこれを使うと便利かと思います。
（Rust や wasm の環境構築手順は割愛します）

まずは ↓ のテンプレートの「Use this template」をクリックして自分のリポジトリを作成しておきましょう。

<https://github.com/pvcresin/yew-markdown-preview>

ちなみに yew の話はしないので、yew じゃなくても全然いいですが、↑ のテンプレートだと Netlify へのデプロイ設定ファイルが用意されてたりするので今回はこのテンプレートで進めたいと思います。

## Netlify のホスティング方法

先述の通り、Netlify は Rust 未サポートです。
なので、Netlify で Rust のビルド成果物をホスティングするなら以下の方法が考えられます。

- 毎回ビルドした結果をコミットする
- 成果物をドラックアンドドロップで Netlify にあげる
- 別なビルドサーバーでビルドして、Netlify へ自動であげる

理想は最後の方法ですが、ビルドサーバーを毎回どっかに立てて消すなんて辛いですよね、、、
ですがこのテンプレートだとそれに近しいやり方をすでに用意してくれてます。
Github Actions を利用した方法です。

### Github Actions

恥ずかしながらあんまり Gitbhub Actions をあまり分かっておらず、プルリクフック的な何かくらいしか知りませんでしたが、Github Actions は Github に紐づく何かしらのイベント（Push とか Pull Request とか）ごとに行いたいことをやってくれる環境を提供してくれます。
よくあるのは Lint や format などですね。

もちろん、ビルドすることも可能なので wasm をビルドすることも可能です。
Github Actions では Docker のイメージ取得のようにして、簡単に一時的作業環境を構築してくれます。

yew のテンプレートリポジトリの**/.github/workflows/deploy.yml**をみてみましょう。
これは Netlify へ自動デプロイする設定です。

```yml
name: Deploy to Netlify

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown

      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: 14

      - name: Install
        run: npm install

      - name: Build
        run: npm run build

      - name: Publish
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

secrets.NETLIFY_SITE_ID と secrets.NETLIFY_AUTH_TOKEN は[Netlify の actions の README](https://github.com/netlify/actions/tree/master/cli)から設定方法がかいてあるので、その通りにやると無事 Netlify へ POST することができます。
これらの設定にはあらかじめサイトを Netlify へ構築しておく必要があるので、netlify 配下を丸ごとドラッグ&ドロップなどで 1 個サイトを作っておくとスムーズです。

今回 Rust のビルドは、webpack の wasm プラグイン経由で wasm にビルドするようになっているので、Rust 環境さえあれば十分なので、Rust の setup のみで cargo build などは行なっていません。
yew や wasm ではなく、ここで cargo build したいなどの場合は run をする step を追加すればいいだけです。

これで無事、Rust をビルドしホスティングすることが可能になりました。

### Netlify ではなく Github Pages を使う

今回僕がやりたかったのはただの成果物の確認環境なので、Netlify まで使わずとも、Github Pages で事足ります。
ということで先ほどビルドした結果を Netlify へ POST していたのをちょっと変えるだけで Github Pages にデプロイすることができます。

```yml
name: Deploy to Github pages

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown

      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: 14

      - name: Install
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

secrets.GITHUB_TOKEN は毎回 Github Actions から自動で発行されるものなので設定は不要ですが、コミットするブランチが必要になるので Setting から Github Pages の対象ブランチを gh-pages にする必要があります。

github
<https://github.com/AkifumiSato/yew-markdown-demo>

demo
<https://akifumisato.github.io/yew-markdown-demo/>

※yew のお試しに内容は変動するかもしれません。

## まとめ

Netlify が Rust サポートしてないことがちょっと悲しかったですが、ビルド成果物を Netlify に POST なんてできるんですね。
ビルドサーバーの制約を外に逃す方法もちゃんと用意してるなんてさすが（信者）。

そして Github Actions が便利すぎて、、、
これ使えば lint とか format とか、テストすら Jenkins とかコミットフック用意する必要ないんですねー。
自動化にかけるコストの問題って仕事である以上どうしてもバランス感難しいなといつも思うんですが、これだけローコストで色々自動化できるのは素晴らしいですね。
「自動化して楽しよう」を目指すのがちょい前のいけてる考え方だった感ありますが、最近は「自動化も楽しよう」みたいな感じがしますね。

Github と Netlify は共謀して Web の未来を企んでるらしいので、今後さらにこの辺の連携が進化していきそうで楽しみ。
Netlify の wasm サポートとかも今後進んでいくのではないかと個人的には期待。
