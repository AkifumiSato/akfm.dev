---
title: 'Rustで作ったAPIのDocker on Heroku'
archive: true
---

## Introduction

Rust で Rest API を作ったんですが、Heroku にデプロイしようとしたら結構いろいろハマって大変な思いをしました・・・。
もともとインフラ自体結構苦手意識があってちょっと避けてたんですが、せっかく作った API をまたローカルで動かすだけで満足するのはもったいない！と思い、意を決してちゃんとデプロイすることにしたんですが、やっぱ初めてだと苦労するものですよね。

今回はそんな自分への備忘録かねて、苦労した部分のポイントについて詳細残しておこうと思います。

## 作ったもの

今回作った API のリポジトリはこちらです。
[https://github.com/AkifumiSato/at-api/tree/45ed837339dc754942821b6b1b6a6700092ef646](https://github.com/AkifumiSato/at-api/tree/45ed837339dc754942821b6b1b6a6700092ef646)

認証部分は別にマイクロサービス化してるので、この API は勤怠情報の永続化だけ担当してます。
まだ制作途中なのでいろいろ変更してくと思いますが、今日時点のコミット時点でリンク貼っときます。

### デプロイする API の技術選定

この API の技術選定については以下になります。

- language: Rust
- framework: actix-web
- ORM: diesel
- DB: postgreSQL

本当 Rust 楽しい。。。

## デプロイ概要

### やりたきこと

当然 API を動かすことではあるんですが、加えて「Docker のイメージサイズを下げること」を今回目標としました。
Docker 理解がまだまだ未熟だし、本番環境で動かす経験してみたい＋せっかく Rust 使って極小なバイナリにできるのにでっかいイメージサイズで運用するのなんか嫌だな・・・ってことで、わからないなりにやってみることにしました。

ちなみに開発中に使ってたイメージは 1.35GB ほどでした。

### インフラ

無料で使えるし今回は Heroku にしました。
Netlify とか使う前は静的サイトの確認用に Node でサーバー立ててよく使ってたんですが、Docker で動かしたことはなかったです。

### デプロイフロー

ORM もあるので当然マイグレーションしなきゃいけません。
ざっくりやるべきことを羅列するとこんな感じになります。

- Rust のコンパイルのマルチステージビルド
- DB のマイグレーション
- Rust のコンパイル結果のバイナリだけ持ってきたイメージを動かす

### 最終形の Dockerfile と heroku.yml

Dockerfile はこんな感じです。
database と dev ステージはローカル用なので、デプロイ時は production をターゲットにして`docker build`してます。

ちなみにわざわざ一回 Cargo.toml とかだけ持ってきて`cargo new`したり`cargo build`してるかというと、こうすることで Cargo.toml に変更がない場合イメージのキャッシュが利用されるので build が早くなります。
Heroku 上の build でも早くなるのかはわかりませんが、ローカルで build する時毎回依存関係解決しに行くと結構長くなっちゃうので・・・。

```Dockerfile
# build-stage
FROM rust:1.44.1 AS build-stage

WORKDIR /app

RUN USER=root cargo new at-api
WORKDIR /app/at-api

COPY Cargo.toml Cargo.lock ./
RUN cargo build --release
COPY . .
RUN rm ./target/release/deps/at_api*
RUN cargo build --release
RUN cargo install diesel_cli

# production
FROM debian:buster-slim AS production
RUN apt-get update
RUN apt-get install libpq-dev -y
COPY --from=build-stage /app/at-api/target/release/at-api .
CMD ["./at-api"]

# database
FROM postgres:11-alpine AS db
ENV LANG ja_JP.utf8

# dev
FROM rust:1.44.1 AS develop
WORKDIR /app
RUN cargo install cargo-watch
RUN cargo install diesel_cli
COPY . .
```

続いて、heroku.yml は以下です。

```yaml
build:
  docker:
    web:
      dockerfile: Dockerfile
      target: production
    migration:
      dockerfile: Dockerfile
      target: build-stage
release:
  image: migration
  command:
    - diesel setup
```

## Heroku でハマったこと

### ビルドステージに環境変数が渡せない

まずこれがかなり困りました。。。
結論、マルチステージビルドにおいては解決策が見つかりませんでした。

これで何が困るって DB のマイグレーションをビルドステージでできないんですよ。
今回使ってる Rust の Diesel って CLI をインストールしてマイグレーション実施しなきゃなのですが、「Docker のイメージサイズを可能な限り下げること」を目標としてるわけだからマイグレーション用の CLI なんて稼働するイメージに入れたくないですよね。
（そもそも Cargo install が動く環境にしたらまた 1GB 超えちゃう・・・）

そこで Rails とかのマイグレーションを Heroku で実施するときとかいろいろ調べてたら、Heroku には heroku.yml で release 時のみに走らせるコンテナを指定できると言うではないですか。
と言うことで heroku.yml で release 指定すれば、環境変数渡せるのではって思ったんですが・・・

### heroku.yml の仕様の説明がわかりづらい＋足りない

[heroku.yml の仕様](https://devcenter.heroku.com/articles/build-docker-images-heroku-yml)はここにだいたい書いてあるんですが、説明が簡素でいろいろわからず戸惑いました。。。
最初イメージ名書けばいいなら Dockerfile で宣言した名前でいいのかと以下のように書いたら「そんなイメージないよ？」って怒られました。

```yaml
release:
  image: build-stage
  command:
    - diesel setup
```

まぁこの辺は冗長な気がするけど、サンプル同様にすればとりあえず動くだろうと修正したらとりあえずこけなくなりました。

## Rust のバイナリ周りでこまったこと

### 軽量イメージでバイナリが動かない

調べてた限り、scratch とか busybox とかでも Rust のバイナリは動くはずなのにどういうわけか動かない・・・。
これは動的リンクを解決できないことが原因で、Linux musl というターゲットを設定する＋ musl をコンパイルできる環境構築をすれば解決します。

この辺がとても参考になりました。
[https://dev.to/sergeyzenchenko/actix-web-in-docker-how-to-build-small-and-secure-images-2mjd](https://dev.to/sergeyzenchenko/actix-web-in-docker-how-to-build-small-and-secure-images-2mjd)

```Dockerfile
FROM rust:1.43.1 as build

RUN apt-get update
RUN apt-get install musl-tools -y
RUN rustup target add x86_64-unknown-linux-musl

WORKDIR /usr/src/api-service
COPY . .

RUN RUSTFLAGS=-Clinker=musl-gcc cargo install -—release —target=x86_64-unknown-linux-musl

FROM alpine:latest

COPY --from=build /usr/local/cargo/bin/api-service /usr/local/bin/api-service

CMD ["api-service"]
```

もしくは distroless を使うと musl すら不要でポータブルなバイナリにできます。
イメージサイズは少し大きくなりますが、まぁ 10MB 前後から 50MB くらいになるだけで Dockerfile がシンプルになるならそれに越したことはないかなーって気がしますね。

```Dockerfile
FROM rust:1.43.1 as build
ENV PKG_CONFIG_ALLOW_CROSS=1

WORKDIR /usr/src/api-service
COPY . .

RUN cargo install --path .

FROM gcr.io/distroless/cc-debian10

COPY --from=build /usr/local/cargo/bin/api-service /usr/local/bin/api-service

CMD ["api-service"]
```

これで動くはず、って思ったら僕の API はこれらどっちでも動かなかったんですよね。。。

### postgreSQL を使うなら libpq-dev が必要

前述の状態で動かなかったのはなんと postgreSQL 使ってるせいでした。
diesel に含まれる postgreSQL 接続部分のバイナリモジュールに含まれる動的リンクが原因だったので、Rust のターゲットと変えても解決できず動かない模様でした。

これを動かすにはどうやら`libpq-dev`が必要とのことだったので、ベースイメージを`debian`に変更して、インストールしてみました。

```Dockerfile
# production
FROM debian:buster-slim AS production
RUN apt-get update
RUN apt-get install libpq-dev -y
COPY --from=build-stage /app/at-api/target/release/at-api .
CMD ["./at-api"]
```

これでようやく API が Heroku 上で動きました！
ちょっと記憶なんで間違ってるかもしれませんが、distroless だと`apt-get`できず debian のイメージにした気がします。

この辺はまた musl をターゲットにして alpine で動かせばもっとイメージサイズは小さくなるかもしれません。
が、これでもイメージサイズは 105MB だったのでまぁ及第点ってことで満足することにしました。
（というかここまででかなり疲弊した・・・）

## まとめ

開発用のステージ（1.35GB）と比べたら言わずもがな、Rails や Laravel のイメージは小さくしても 400~500MB あたりが割と限界っぽいからそれに比べったらかなり小さくできました。
いろいろハマったものの、今回いろいろ学びはあったので今後はもう少しスムーズに構築できる気がします。

あと Heroku って、結構遅い印象だったので actix-web（世界で今 2 番目に早いフレームワーク）使ってるとはいえレスポンス速度不安だったのですが、だいたいスリープしてなきゃ 200ms くらいで帰ってきてたので実用レベルで問題ないように思えました。
比較用に Node で全く同じ仕様の API デプロイしてみて速度検証してみたいですが、まぁわざわざ作るのも面倒なので気が向いたらですかね・・・。

Rust で API 作ろうって需要がまだほぼない気もするんですが、もし同じようなことで困っている方がいたら、この記事が参考になれば幸いです。
